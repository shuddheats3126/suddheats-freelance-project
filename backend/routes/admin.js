const express = require('express');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const prisma = require('../models/db');
const { authMiddleware } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

const router = express.Router();

// Apply auth middleware to all admin routes first
router.use(authMiddleware);

/**
 * Helper to batch fetch products for an array of orders (prevents N+1 queries)
 */
async function batchFetchProductMap(orders) {
  try {
    const productIds = new Set();
    for (const order of orders) {
      if (Array.isArray(order.items)) {
        for (const item of order.items) {
          if (item && (item.product || item.id)) {
            productIds.add(item.product || item.id);
          }
        }
      }
    }
    const idArray = Array.from(productIds).filter(Boolean);
    if (idArray.length === 0) return new Map();

    const products = await prisma.product.findMany({
      where: { id: { in: idArray } },
      select: { id: true, name: true, thumbnail: true, images: true, price: true, originalPrice: true, category: true }
    });
    return new Map(products.map(p => [p.id, p]));
  } catch (err) {
    console.error('Error batch fetching products:', err);
    return new Map();
  }
}

/**
 * Format an order object into a standardized, rich order record for admin
 */
function formatOrder(order, productMap) {
  const addr = (order.shippingAddress && typeof order.shippingAddress === 'object')
    ? order.shippingAddress
    : {};
  
  const rawItems = Array.isArray(order.items) ? order.items : [];
  const items = rawItems.map(item => {
    if (!item) return null;
    const prodId = item.product || item.id || null;
    const liveProd = prodId && productMap ? productMap.get(prodId) : null;
    const price = Number(item.price ?? liveProd?.price ?? 0);
    const quantity = Number(item.quantity ?? 1);
    const subtotal = price * quantity;
    const image = item.image || item.thumbnail || liveProd?.thumbnail || (Array.isArray(liveProd?.images) ? liveProd.images[0] : null) || null;
    const variant = item.weight || item.packaging || (item.weight && item.packaging ? `${item.weight} (${item.packaging})` : null) || 'Standard';

    return {
      product: prodId,
      name: item.name || liveProd?.name || 'Product',
      image,
      variant,
      quantity,
      price,
      subtotal
    };
  }).filter(Boolean);

  const paymentResult = (order.paymentResult && typeof order.paymentResult === 'object')
    ? order.paymentResult
    : null;

  // Extract Cashfree payment and order details
  const cfPayment = paymentResult?.data?.payment || paymentResult?.payment || null;
  const cfOrder = paymentResult?.data?.order || paymentResult?.order || null;
  const transactionId = cfPayment?.cf_payment_id || paymentResult?.cf_payment_id || paymentResult?.transactionId || order.trackingId || null;
  const cashfreeOrderId = cfOrder?.order_id || paymentResult?.order_id || null;

  let paymentStatus = 'Unpaid';
  if (order.isPaid) {
    paymentStatus = 'Paid';
  } else if (order.paymentMethod === 'COD') {
    paymentStatus = order.status === 'Delivered' ? 'Paid (COD)' : 'Cash on Delivery';
  } else if (cfPayment?.payment_status) {
    paymentStatus = cfPayment.payment_status;
  } else if (order.status === 'FAILED' || order.status === 'Failed') {
    paymentStatus = 'Failed';
  } else {
    paymentStatus = 'Pending';
  }

  // Calculate items subtotal and prices
  const itemsPrice = Number(order.itemsPrice ?? items.reduce((sum, it) => sum + it.subtotal, 0));
  const shippingPrice = Number(order.shippingPrice ?? 0);
  const totalPrice = Number(order.totalPrice ?? (itemsPrice + shippingPrice));
  const discount = Math.max(0, (itemsPrice + shippingPrice) - totalPrice);

  return {
    id: order.id,
    orderId: order.id,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    status: order.status,
    isPaid: order.isPaid,
    paidAt: order.paidAt,
    paymentMethod: order.paymentMethod,
    itemsPrice,
    shippingPrice,
    totalPrice,
    discount,
    coupon: addr.coupon || null,
    user: {
      id: order.user?.id || order.userId,
      name: addr.fullName || order.user?.name || 'Customer',
      email: order.user?.email || 'N/A',
      phone: addr.phone || order.user?.phone || 'N/A'
    },
    shippingAddress: {
      fullName: addr.fullName || order.user?.name || 'Customer',
      phone: addr.phone || order.user?.phone || 'N/A',
      addressLine1: addr.addressLine1 || 'N/A',
      addressLine2: addr.addressLine2 || '',
      landmark: addr.landmark || '',
      city: addr.city || 'N/A',
      state: addr.state || 'N/A',
      pincode: addr.pincode || 'N/A',
      fullAddress: [addr.addressLine1, addr.addressLine2, addr.landmark, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')
    },
    items,
    payment: {
      status: paymentStatus,
      method: order.paymentMethod,
      transactionId,
      cashfreeOrderId,
      paymentResult
    },
    transactionId,
    cashfreeOrderId
  };
}

/**
 * ADMIN DASHBOARD STATS
 * GET /api/admin/dashboard
 */
router.get('/dashboard', adminOnly, async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      totalOrders,
      totalProducts,
      totalUsers,
      todayOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      failedOrders,
      lowStockProducts,
      revenueAgg,
      recentOrdersRaw,
      latestCustomersRaw
    ] = await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.order.count({ where: { status: { in: ['Pending', 'PLACED', 'Processing'] } } }),
      prisma.order.count({ where: { status: 'Delivered' } }),
      prisma.order.count({ where: { status: 'Cancelled' } }),
      prisma.order.count({ where: { status: { in: ['FAILED', 'Failed'] } } }),
      prisma.product.count({ where: { stock: { lte: 20 } } }),
      prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: {
          OR: [
            { isPaid: true },
            { paymentMethod: 'COD', status: { notIn: ['Cancelled', 'FAILED', 'Failed'] } }
          ]
        }
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true }
          }
        }
      }),
      prisma.user.findMany({
        take: 5,
        where: { role: 'USER' },
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, phone: true, createdAt: true }
      })
    ]);

    const totalRevenue = revenueAgg._sum.totalPrice || 0;
    const productMap = await batchFetchProductMap(recentOrdersRaw);
    const recentOrders = recentOrdersRaw.map(o => formatOrder(o, productMap));

    res.json({
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue,
      todayOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      failedOrders,
      lowStockCount: lowStockProducts,
      recentOrders,
      latestCustomers: latestCustomersRaw
    });
  } catch (err) {
    console.error('Error fetching admin dashboard stats:', err);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
});

/**
 * ADMIN GET ALL ORDERS
 * GET /api/admin/orders
 */
router.get('/orders', adminOnly, async (req, res) => {
  try {
    const { status, search, page, limit, sort = 'desc' } = req.query;

    const whereClause = {};

    if (status && status !== 'All') {
      whereClause.status = {
        equals: status,
        mode: 'insensitive'
      };
    }

    if (search && search.trim()) {
      const searchTerm = search.trim();
      whereClause.OR = [
        { id: { contains: searchTerm, mode: 'insensitive' } },
        { user: { name: { contains: searchTerm, mode: 'insensitive' } } },
        { user: { email: { contains: searchTerm, mode: 'insensitive' } } },
        { user: { phone: { contains: searchTerm, mode: 'insensitive' } } },
      ];
    }

    const orderBy = { createdAt: sort === 'asc' ? 'asc' : 'desc' };

    const take = limit ? Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200) : undefined;
    const skip = (page && take) ? (Math.max(parseInt(page, 10) || 1, 1) - 1) * take : undefined;

    const [ordersRaw, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        orderBy,
        take,
        skip,
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true }
          }
        }
      }),
      prisma.order.count({ where: whereClause })
    ]);

    const productMap = await batchFetchProductMap(ordersRaw);
    const formattedOrders = ordersRaw.map(o => formatOrder(o, productMap));

    res.setHeader('X-Total-Count', total);
    res.json(formattedOrders);
  } catch (err) {
    console.error('Error fetching admin orders:', err);
    res.status(500).json({ message: 'Failed to fetch orders from database' });
  }
});

/**
 * ADMIN GET SINGLE ORDER
 * GET /api/admin/orders/:id
 */
router.get('/orders/:id', adminOnly, async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const productMap = await batchFetchProductMap([order]);
    res.json(formatOrder(order, productMap));
  } catch (err) {
    console.error('Error fetching order by ID:', err);
    res.status(500).json({ message: 'Failed to fetch order details' });
  }
});

/**
 * ADMIN UPDATE ORDER STATUS
 * PUT /api/admin/orders/:id/status
 */
router.put('/orders/:id/status', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const updateData = { status };
    if (status === 'Delivered') {
      updateData.isDelivered = true;
      updateData.deliveredAt = new Date();
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true }
        }
      }
    });

    const productMap = await batchFetchProductMap([updatedOrder]);
    res.json(formatOrder(updatedOrder, productMap));
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

/**
 * ADMIN INVENTORY MANAGEMENT
 * GET /api/admin/inventory
 */
router.get('/inventory', adminOnly, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' }
    });
    const inventory = products.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.slug,
      stock: p.stock ?? 0,
      minStock: 20,
      category: p.category
    }));
    res.json(inventory);
  } catch (err) {
    console.error('Error fetching inventory:', err);
    res.status(500).json({ message: 'Failed to fetch inventory' });
  }
});

/**
 * ADMIN UPDATE PRODUCT STOCK
 * PATCH /api/admin/inventory/:id
 */
router.patch('/inventory/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    const updated = await prisma.product.update({
      where: { id },
      data: { stock: parseInt(stock, 10) || 0 }
    });
    res.json(updated);
  } catch (err) {
    console.error('Error updating stock:', err);
    res.status(500).json({ message: 'Failed to update stock' });
  }
});

/**
 * ADMIN DELETE PRODUCT FROM INVENTORY
 * DELETE /api/admin/inventory/:id
 */
router.delete('/inventory/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});
/**
 * ADMIN GET QUERIES
 * GET /api/admin/queries
 */
router.get('/queries', adminOnly, async (req, res) => {
  try {
    const queries = await prisma.contactQuery.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(queries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch queries' });
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
      <img src="https://res.cloudinary.com/dyf00ptkk/image/upload/v1789572181/shuddheats/assets/logo_full_spelling_new.png" alt="ShuddhEats Logo" class="logo" />
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
      <a href="https://www.shuddheats.co.in" class="btn">Visit ShuddhEats.co.in</a>
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
        }),
        redirect: 'manual' // Prevent following the 302 redirect to a non-existent doGet
      });
      
      // Google Apps Script always returns a 302 Redirect on successful POST
      if (response.status !== 200 && response.status !== 302) {
        const text = await response.text();
        console.error('Webhook failed:', response.status, text);
        throw new Error('Webhook failed to send email');
      }
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
        text: `Hi ${query.name},\n\n${replyMessage}\n\nWarm regards,\nThe ShuddhEats Team\n\n--- Your Original Message ---\n${query.message}`
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

