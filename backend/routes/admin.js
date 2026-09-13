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

module.exports = router;
