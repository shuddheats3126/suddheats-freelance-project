const express = require('express');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

const router = express.Router();

const withTimeout = (promise, ms = 5000) => {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`Database timeout after ${ms}ms`)), ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

const generateToken = (id, role = 'USER') => jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Generate temporary session token for 2FA verification
const generateTempToken = (id, role = 'USER') => jwt.sign({ id, role, temp: true }, process.env.JWT_SECRET, { expiresIn: '5m' });

// @POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        if (!password || password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
        }

        const exists = await withTimeout(User.findUnique({ where: { email } }));
        if (exists) {
            return res.status(409).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await withTimeout(User.create({
            data: { 
                name, 
                email, 
                password: hashedPassword, 
                phone: phone || null,
                role: 'USER' 
            }
        }));

        res.status(201).json({
            success: true,
            token: generateToken(user.id, user.role),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Registration Error:", error);
        console.error(error.stack);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// @POST /api/auth/google
router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ success: false, message: 'Google credential token is required' });
        }

        let payload = null;

        // 1. Try verifying with google-auth-library if available
        try {
            const { OAuth2Client } = require('google-auth-library');
            const googleClientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
            const client = new OAuth2Client(googleClientId);
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: googleClientId || undefined,
            });
            payload = ticket.getPayload();
        } catch (libErr) {
            // 2. Fallback to Google's official tokeninfo endpoint
            console.log('[Google Auth] Verifying via Google tokeninfo endpoint...');
            const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
            if (response.ok) {
                payload = await response.json();
            } else {
                return res.status(401).json({ success: false, message: 'Invalid Google token' });
            }
        }

        if (!payload || !payload.email) {
            return res.status(400).json({ success: false, message: 'Google token does not contain a valid email' });
        }

        const email = payload.email.toLowerCase().trim();
        const name = payload.name || payload.given_name || email.split('@')[0];
        const googleId = payload.sub;
        const picture = payload.picture || null;

        // Check if user already exists
        let user = await User.findUnique({ where: { email } });

        if (user) {
            // Update lastLogin and googleId/avatar if available
            try {
                user = await User.update({
                    where: { id: user.id },
                    data: {
                        lastLogin: new Date(),
                        ...(user.googleId ? {} : { googleId: googleId || undefined }),
                        ...(user.avatar ? {} : { avatar: picture || undefined })
                    }
                });
            } catch (updateErr) {
                // If columns don't exist yet in DB migration, continue gracefully
                console.warn('[Google Auth] Non-blocking DB update notice:', updateErr.message);
            }
        } else {
            // Create new user for Google Sign-In
            const crypto = require('crypto');
            const randomPassword = crypto.randomBytes(32).toString('hex');
            const hashedPassword = await bcrypt.hash(randomPassword, 12);

            const baseUserData = {
                name,
                email,
                password: hashedPassword,
                role: 'USER'
            };

            try {
                user = await User.create({
                    data: {
                        ...baseUserData,
                        googleId: googleId || null,
                        avatar: picture || null
                    }
                });
            } catch (createErr) {
                // Fallback in case schema migration has not yet been applied for googleId/avatar
                user = await User.create({
                    data: baseUserData
                });
            }
        }

        const jwtToken = generateToken(user.id, user.role);

        res.status(200).json({
            success: true,
            token: String(jwtToken),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone || null,
                avatar: user.avatar || picture || null,
                is2FAEnabled: user.is2FAEnabled || false
            }
        });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Google authentication failed'
        });
    }
});

// @POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email address is required' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findUnique({ where: { email: normalizedEmail } });

        // Security practice: Always return generic success to prevent email enumeration
        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If an account exists with this email, a password reset link has been sent.'
            });
        }

        // Generate a 32-byte secure random reset token
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes validity

        await User.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: expires
            }
        });

        const frontendUrl = process.env.FRONTEND_URL || 'https://www.shuddheats.co.in';
        const cleanFrontendUrl = frontendUrl.replace(/\/$/, '');
        const resetUrl = `${cleanFrontendUrl}/auth/reset-password?token=${rawToken}`;

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f3; margin: 0; padding: 0; }
    .email-container { max-width: 580px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #ebf0e6; }
    .header { padding: 30px; text-align: center; background-color: #ffffff; }
    .logo { max-width: 180px; height: auto; }
    .hero { background-color: #475d2a; padding: 25px 30px; text-align: center; }
    .hero h1 { color: #ffffff; font-size: 22px; font-weight: 700; margin: 0; }
    .body { padding: 35px 30px; text-align: center; }
    .intro { color: #444444; font-size: 15px; line-height: 1.6; margin: 0 0 25px; }
    .btn { display: inline-block; background-color: #475d2a; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 30px; font-weight: 700; font-size: 15px; margin: 10px 0 25px; box-shadow: 0 4px 12px rgba(71,93,42,0.25); }
    .notice { font-size: 13px; color: #777777; line-height: 1.5; margin-top: 20px; border-top: 1px solid #f0f0f0; padding-top: 20px; }
    .footer { background-color: #fafbf9; padding: 20px 30px; text-align: center; border-top: 1px solid #e5ebe0; }
    .footer-text { color: #999999; font-size: 12px; margin: 0; }
    .link-fallback { word-break: break-all; color: #475d2a; font-size: 12px; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="https://res.cloudinary.com/dyf00ptkk/image/upload/v1789572181/shuddheats/assets/logo_full_spelling_new.png" alt="ShuddhEats Logo" class="logo" />
    </div>
    <div class="hero">
      <h1>Reset Your Password</h1>
    </div>
    <div class="body">
      <p class="intro">Hello <strong>${user.name || 'there'}</strong>,<br/>We received a request to reset your password for your ShuddhEats account. Click the button below to choose a new password:</p>
      <div>
        <a href="${resetUrl}" class="btn" target="_blank" style="color: #ffffff;">Reset Password</a>
      </div>
      <p class="notice">This link is valid for <strong>30 minutes</strong>.<br/>If you did not request a password reset, you can safely ignore this email — your account remains completely secure.</p>
      <div style="margin-top: 20px; text-align: left; font-size: 12px; color: #888;">
        <p style="margin: 0 0 5px;">If the button above does not work, copy and paste this link into your browser:</p>
        <p class="link-fallback">${resetUrl}</p>
      </div>
    </div>
    <div class="footer">
      <p class="footer-text">© ${new Date().getFullYear()} ShuddhEats. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

        await sendEmail({
            to: user.email,
            subject: 'Reset Your ShuddhEats Password',
            html: htmlContent,
            text: `Hello ${user.name},\n\nClick the link below to reset your ShuddhEats password:\n${resetUrl}\n\nThis link expires in 30 minutes. If you did not request this, please ignore this email.`
        });

        res.status(200).json({
            success: true,
            message: 'If an account exists with this email, a password reset link has been sent.'
        });
    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ success: false, message: 'Failed to process password reset request' });
    }
});

// @POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token) {
            return res.status(400).json({ success: false, message: 'Reset token is required' });
        }

        if (!password || password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findFirst({
            where: {
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { gt: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Password reset link is invalid or has expired. Please request a new one.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null
            }
        });

        res.status(200).json({
            success: true,
            message: 'Your password has been successfully reset. You can now log in.'
        });
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ success: false, message: 'Failed to reset password' });
    }
});

// @POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, token } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ success: false, message: "Invalid credentials" });

    // 🔐 ADMIN + 2FA ONLY
    if (user.role === "ADMIN") {
      if (user.is2FAEnabled) {
        if (!token) {
          // Send 200 so axios doesn't throw, and provide the temporary token
          return res.status(200).json({
            success: true,
            requiresTwoFA: true,
            tempSessionToken: generateTempToken(user.id, user.role)
          });
        }

        const verified = speakeasy.totp.verify({
          secret: user.twoFASecret,
          encoding: "base32",
          token: token,
          window: 1
        });

        if (!verified) {
          return res.status(401).json({
            success: false,
            message: 'Invalid 2FA token'
          });
        }
      }
    }

    // ✅ LOGIN SUCCESS
    const jwtToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      token: String(jwtToken),
      requiresTwoFASetup: user.role === "ADMIN" && !user.is2FAEnabled,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is2FAEnabled: user.is2FAEnabled
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// @POST /api/auth/verify-2fa
// Verify TOTP code and return JWT token
router.post('/verify-2fa', async (req, res) => {
    try {
        const { tempSessionToken, totpCode } = req.body;

        if (!tempSessionToken || !totpCode) {
            return res.status(400).json({ message: 'Temp token and TOTP code required' });
        }

        // Verify temp token
        let decoded;
        try {
            decoded = jwt.verify(tempSessionToken, process.env.JWT_SECRET);
            if (!decoded.temp) {
                return res.status(401).json({ message: 'Invalid temp token' });
            }
        } catch (err) {
            return res.status(401).json({ message: 'Temp token expired or invalid' });
        }

        const user = await User.findUnique({ where: { id: decoded.id } });
        if (!user || !user.twoFASecret) {
            return res.status(400).json({ message: 'Invalid 2FA state' });
        }

        const isValid = speakeasy.totp.verify({
            secret: user.twoFASecret,
            encoding: 'base32',
            token: totpCode,
            window: 1
        });

        if (!isValid) {
            return res.status(401).json({ message: 'Invalid authenticator code' });
        }

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role)
        });
    } catch (error) {
        console.error(error);
        console.error(error.stack);
    
        return res.status(500).json({
            success: false,
            message: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        });
    }
});

// @GET /api/auth/profile
router.get('/profile', protect, async (req, res) => {
    try {
        console.log("Executing Prisma query...");
        const user = await User.findUnique({ where: { id: req.user.id } });
        console.log("Database write successful");
        if (!user) return res.status(404).json({ message: 'User not found' });
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error(error);
        console.error(error.stack);
    
        return res.status(500).json({
            success: false,
            message: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        });
    }
});

// @PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
    try {
        console.log("Executing Prisma query...");
        const user = await User.findUnique({ where: { id: req.user.id } });
        console.log("Database write successful");
        if (!user) return res.status(404).json({ message: 'User not found' });

        const updateData = {
            name: req.body.name || user.name,
            phone: req.body.phone !== undefined ? req.body.phone : user.phone
        };
        if (req.body.password) {
            if (req.body.password.length < 8) {
                return res.status(400).json({ message: 'Password must be at least 8 characters long' });
            }
            updateData.password = await bcrypt.hash(req.body.password, 12);
        }

        console.log("Executing Prisma query...");
        const updated = await User.update({
            where: { id: req.user.id },
            data: updateData
        });
        console.log("Database write successful");

        res.json({
            id: updated.id,
            name: updated.name,
            email: updated.email,
            role: updated.role,
            token: generateToken(updated.id, updated.role)
        });
    } catch (error) {
        console.error(error);
        console.error(error.stack);
    
        return res.status(500).json({
            success: false,
            message: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        });
    }
});

module.exports = router;

