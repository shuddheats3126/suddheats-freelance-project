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
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_SECURE === 'true' || true,
      auth: {
        user: process.env.SMTP_USER || 'shuddheats3126@gmail.com',
        pass: process.env.SMTP_PASS || 'qqbqyjjutwzxyglc'
      }
    });

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f0; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: #475d2a; padding: 28px 32px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 22px; margin: 0; font-weight: 700; letter-spacing: 0.5px; }
    .header p { color: rgba(255,255,255,0.7); font-size: 13px; margin: 4px 0 0; }
    .body { padding: 32px; }
    .greeting { font-size: 18px; font-weight: 700; color: #1a1a1a; margin-bottom: 16px; }
    .message-value { white-space: pre-wrap; font-size: 15px; color: #333; line-height: 1.6; margin-bottom: 24px; }
    .original-query { padding: 16px; background: #f5f7f2; border-left: 3px solid #475d2a; border-radius: 0 8px 8px 0; margin-top: 32px; }
    .original-query-title { font-size: 12px; font-weight: 700; color: #475d2a; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
    .original-query-text { font-size: 13px; color: #555; white-space: pre-wrap; font-style: italic; }
    .footer { background: #f0f4ed; padding: 20px 32px; text-align: center; border-top: 1px solid #e5ebe0; }
    .footer p { color: #888; font-size: 12px; margin: 0; }
    .footer .brand { color: #475d2a; font-weight: 700; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>ShuddhEats Support</h1>
      <p>Re: ${query.subject}</p>
    </div>
    <div class="body">
      <div class="greeting">Hi ${query.name},</div>
      
      <div class="message-value">${replyMessage}</div>
      
      <p style="color:#555; font-size:14px; margin-top: 24px;">
        Warm regards,<br>
        <strong>The ShuddhEats Team</strong>
      </p>

      <div class="original-query">
        <div class="original-query-title">Your Original Message</div>
        <div class="original-query-text">${query.message}</div>
      </div>
    </div>
    <div class="footer">
      <p>This message was sent by <span class="brand">ShuddhEats.co.in</span></p>
    </div>
  </div>
</body>
</html>`;

    await transporter.sendMail({
      from: `"ShuddhEats Support" <${process.env.SMTP_USER}>`,
      to: query.email,
      subject: `Re: ${query.subject}`,
      html: htmlContent,
      text: `Hi ${query.name},\n\n${replyMessage}\n\nWarm regards,\nThe ShuddhEats Team\n\n--- Your Original Message ---\n${query.message}`
    });

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
