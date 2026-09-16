const express = require('express');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const adminOnly = require('../middleware/adminOnly');

const router = express.Router();

/**
 * ADMIN 2FA SETUP
 * POST /api/admin/2fa/setup
 */
router.post('/2fa/setup', adminOnly, async (req, res) => {
  try {
    const adminId = req.user.id;

    // Generate secret
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `Shuddheats-ADMIN (${req.user.email})`
    });

    // 🔑 THIS IS THE KEY YOU WANT
    console.log("==========================================");
    console.log(`ADMIN 2FA SECRET (SAVE THIS): ${secret.base32}`);
    console.log("==========================================");

    // Save Base32 secret in DB
    await prisma.user.update({
      where: { id: adminId },
      data: {
        twoFASecret: secret.base32,
        is2FAEnabled: true
      }
    });

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      qrCode
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: '2FA setup failed' });
  }
});

/**
 * ADMIN DASHBOARD STATS
 * GET /api/admin/dashboard
 */
router.get('/dashboard', adminOnly, async (req, res) => {
  try {
    const totalOrders = await prisma.order.count();
    const totalProducts = await prisma.product.count();
    const totalUsers = await prisma.user.count({ where: { role: 'USER' } });
    
    const revenueAgg = await prisma.order.aggregate({
      _sum: {
        totalPrice: true
      },
      where: {
        isPaid: true
      }
    });
    const totalRevenue = revenueAgg._sum.totalPrice || 0;

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    res.json({
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue,
      recentOrders
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
});
/**
 * ADMIN REPLY TO QUERY
 * POST /api/admin/queries/:id/reply
 */
router.post('/queries/:id/reply', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { replyMessage } = req.body;

    if (!replyMessage) {
      return res.status(400).json({ message: 'Reply message is required' });
    }

    const query = await prisma.contactQuery.findUnique({
      where: { id }
    });

    if (!query) {
      return res.status(404).json({ message: 'Query not found' });
    }

    if (query.isReplied) {
      return res.status(400).json({ message: 'Query has already been replied to' });
    }

    const nodemailer = require('nodemailer');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fcfcfc; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .email-container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.06); border: 1px solid #f0f0f0; }
    .header { padding: 30px; text-align: center; }
    .logo { max-width: 200px; height: auto; margin-bottom: 10px; }
    .hero { background-color: #f9fafa; padding: 30px; text-align: center; border-bottom: 2px solid #f0f4ed; }
    .hero h1 { color: #2d371c; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.2px; }
    .hero p { color: #829e59; font-size: 16px; margin: 10px 0 0; font-weight: 500; }
    .body { padding: 40px 30px; }
    .greeting { font-size: 18px; color: #333333; font-weight: 600; margin-top: 0; margin-bottom: 20px; }
    .reply-content { font-size: 16px; color: #444444; line-height: 1.6; margin-bottom: 35px; white-space: pre-wrap; }
    .signature { font-size: 16px; color: #333333; margin-bottom: 40px; border-left: 3px solid #dfc4ac; padding-left: 15px; }
    .signature strong { color: #475d2a; display: block; margin-top: 5px; font-size: 18px; }
    .original-message-card { background-color: #fafbf9; border: 1px solid #e5ebe0; border-radius: 8px; padding: 25px; margin-top: 30px; }
    .original-message-card h3 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #829e59; margin: 0 0 15px 0; }
    .original-text { font-size: 14px; color: #666666; line-height: 1.6; font-style: italic; white-space: pre-wrap; margin: 0; }
    .footer { background-color: #475d2a; padding: 40px 30px; text-align: center; color: #ffffff; }
    .footer p { margin: 0 0 20px; font-size: 15px; font-weight: 500; letter-spacing: 0.5px; opacity: 0.9; }
    .btn { display: inline-block; background-color: #ffffff; color: #475d2a !important; text-decoration: none; padding: 12px 30px; border-radius: 30px; font-weight: 700; font-size: 14px; letter-spacing: 0.5px; transition: all 0.2s; }
    @media only screen and (max-width: 600px) {
      .email-container { margin: 20px 10px; width: auto !important; }
      .header, .hero, .body, .footer { padding-left: 20px; padding-right: 20px; }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <img src="cid:shuddheats_logo" alt="ShuddhEats Logo" class="logo" />
    </div>
    
    <div class="hero">
      <h1>We've got an answer for you!</h1>
      <p>Thank you for reaching out to ShuddhEats.</p>
    </div>

    <div class="body">
      <p class="greeting">Hi ${query.name},</p>
      
      <div class="reply-content">${replyMessage}</div>
      
      <div class="signature">
        Warmest regards,
        <strong>The ShuddhEats Team</strong>
      </div>

      <div class="original-message-card">
        <h3>Your Original Message</h3>
        <p class="original-text">${query.message}</p>
      </div>
    </div>
    
    <div class="footer">
      <p>Stay Healthy, Stay Shuddh.</p>
      <a href="http://localhost:3000" class="btn">Visit ShuddhEats</a>
    </div>
  </div>
</body>
</html>`;

    if (process.env.EMAIL_WEBHOOK_URL) {
      // Bypass Railway's SMTP block using a Webhook
      const response = await fetch(process.env.EMAIL_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: query.email,
          subject: `Re: ${query.subject}`,
          html: htmlContent
        })
      });
      const data = await response.json();
      if (!data.success) throw new Error('Webhook failed to send email');
    } else {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false, // true for 465, false for 587
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000
      });

      await transporter.sendMail({
        from: `"ShuddhEats Support" <${process.env.SMTP_USER}>`,
        to: query.email,
        subject: `Re: ${query.subject}`,
        html: htmlContent,
        text: `Hi ${query.name},\n\n${replyMessage}\n\nWarm regards,\nThe ShuddhEats Team\n\n--- Your Original Message ---\n${query.message}`,
        attachments: [
          {
            filename: 'logo.png',
            path: require('path').join(__dirname, '../../frontend/public/images/logo.png'),
            cid: 'shuddheats_logo'
          }
        ]
      });
    }

    // Update the database
    await prisma.contactQuery.update({
      where: { id },
      data: {
        isReplied: true,
        replyMessage
      }
    });

    res.json({ success: true, message: 'Reply sent successfully' });
  } catch (err) {
    console.error('Error sending reply:', err);
    res.status(500).json({ message: 'Failed to send reply' });
  }
});

module.exports = router;
