const express = require('express');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

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

