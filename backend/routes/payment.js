const express = require('express');
const crypto = require('crypto');
const prisma = require('../models/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

const getCashfreeURL = () => {
    const env = (process.env.CASHFREE_ENV || '').toUpperCase();
    const appId = process.env.CASHFREE_APP_ID || '';
    if (env === 'SANDBOX' || appId.startsWith('TEST') || appId.includes('SANDBOX')) {
        return 'https://sandbox.cashfree.com/pg/orders';
    }
    return 'https://api.cashfree.com/pg/orders';
};

// Helper to sanitize Indian mobile numbers
const sanitizeIndianPhone = (rawPhone) => {
    if (!rawPhone) return '';
    let digits = rawPhone.toString().replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) {
        digits = digits.substring(2);
    } else if (digits.length === 11 && digits.startsWith('0')) {
        digits = digits.substring(1);
    } else if (digits.length > 10) {
        digits = digits.slice(-10);
    }
    return digits;
};

// @POST /api/payment/create-order
// Create Cashfree order and return payment session id
router.post('/create-order', async (req, res) => {
    const correlationId = `req_${Date.now()}`;
    try {
        const { orderId, amount, currency, customer_phone, customer_email, customer_name } = req.body;
        console.log(`[PAYMENT][${correlationId}] Incoming create-order request:`, {
            orderId,
            amount,
            currency,
            customer_phone,
            customer_email,
            customer_name,
            headers: {
                origin: req.headers.origin,
                referer: req.headers.referer,
                'user-agent': req.headers['user-agent']
            }
        });

        if (!orderId) {
            console.warn(`[PAYMENT][${correlationId}] Validation Failed: Missing orderId in request body`);
            return res.status(400).json({ message: 'Order ID is required' });
        }

        // Check Cashfree API credentials
        const appId = process.env.CASHFREE_APP_ID;
        const secretKey = process.env.CASHFREE_SECRET_KEY;
        if (!appId || !secretKey) {
            console.error(`[PAYMENT][${correlationId}] Environment Error: CASHFREE_APP_ID or CASHFREE_SECRET_KEY is missing in environment variables!`);
            return res.status(500).json({ message: 'Cashfree payment gateway credentials are not configured on server' });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true }
        });

        if (!order) {
            console.warn(`[PAYMENT][${correlationId}] Database Lookup Failed: Order not found for ID ${orderId}`);
            return res.status(404).json({ message: 'Order not found' });
        }

        // Return URL for Cashfree payment redirection
        const returnUrl = `${process.env.FRONTEND_URL || req.headers.origin || 'https://suddheats-freelance-project.vercel.app'}/payment/success?order_id={order_id}`;

        // Phone sanitization & validation
        const rawPhone = customer_phone || (order.shippingAddress && order.shippingAddress.phone) || order.user?.phone;
        const finalPhone = sanitizeIndianPhone(rawPhone);

        if (!finalPhone || !/^[6-9]\d{9}$/.test(finalPhone)) {
            console.warn(`[PAYMENT][${correlationId}] Validation Failed: Invalid phone number. Raw: "${rawPhone}", Sanitized: "${finalPhone}"`);
            return res.status(400).json({
                message: 'A valid 10-digit Indian mobile number is required for payment (starting with 6-9).'
            });
        }

        // Name & Email fallbacks
        const rawName = customer_name || (order.shippingAddress && order.shippingAddress.fullName) || order.user?.name;
        const finalName = (rawName && String(rawName).trim().length > 0) ? String(rawName).trim().slice(0, 100) : 'ShuddhEats Customer';
        const finalEmail = customer_email || req.user?.email || order.user?.email || 'customer@shuddheats.com';

        // Customer ID (alphanumeric, -, _ only, 3-50 chars)
        const rawCustomerId = order.user?.id || order.userId || (req.user && req.user.id) || `cust_${order.id}`;
        const finalCustomerId = String(rawCustomerId).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50);

        // Order Amount validation & 2-decimal formatting (Cashfree requirement)
        const numericAmount = parseFloat(Number(order.totalPrice || amount || 0).toFixed(2));
        if (isNaN(numericAmount) || numericAmount <= 0) {
            console.warn(`[PAYMENT][${correlationId}] Validation Failed: Invalid order amount. Amount: ${order.totalPrice}`);
            return res.status(400).json({ message: `Invalid order amount: ${order.totalPrice}` });
        }

        const cashfreePayload = {
            order_id: order.id,
            order_amount: numericAmount,
            order_currency: 'INR',
            customer_details: {
                customer_id: finalCustomerId,
                customer_phone: finalPhone,
                customer_email: finalEmail,
                customer_name: finalName
            },
            order_meta: {
                return_url: returnUrl
            }
        };

        const targetUrl = getCashfreeURL();
        console.log(`[CASHFREE][${correlationId}] Sending Order Request to ${targetUrl}:`, JSON.stringify(cashfreePayload, null, 2));

        // Call Cashfree API to create the order session
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'x-client-id': appId,
                'x-client-secret': secretKey,
                'x-api-version': '2023-08-01',
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(cashfreePayload)
        });

        const data = await response.json();
        console.log(`[CASHFREE][${correlationId}] Cashfree Response status: ${response.status}`, data);

        if (!response.ok) {
            console.error(`[CASHFREE][${correlationId}] Create Order Failed:`, {
                status: response.status,
                data: data
            });

            // If order already exists in Cashfree (e.g. customer retried), fetch existing session
            if (data.code === 'order_already_exists' || (data.message && data.message.includes('already exists'))) {
                console.log(`[CASHFREE][${correlationId}] Order ${order.id} already exists in Cashfree, fetching existing payment session...`);
                try {
                    const existingRes = await fetch(`${targetUrl}/${order.id}`, {
                        method: 'GET',
                        headers: {
                            'x-client-id': appId,
                            'x-client-secret': secretKey,
                            'x-api-version': '2023-08-01',
                            'Accept': 'application/json'
                        }
                    });
                    const existingData = await existingRes.json();
                    if (existingData.payment_session_id) {
                        console.log(`[CASHFREE][${correlationId}] Reused existing payment_session_id:`, existingData.payment_session_id);
                        return res.json({ payment_session_id: existingData.payment_session_id });
                    }
                } catch (fetchErr) {
                    console.error(`[CASHFREE][${correlationId}] Could not fetch existing order:`, fetchErr);
                }
            }

            return res.status(response.status).json({
                message: data.message || 'Failed to create payment session with Cashfree',
                code: data.code || 'CASHFREE_ERROR'
            });
        }

        console.log(`[CASHFREE][${correlationId}] Order created successfully. Session ID: ${data.payment_session_id}`);
        res.json({ payment_session_id: data.payment_session_id });
    } catch (error) {
        console.error(`[PAYMENT][${correlationId}] Server Exception:`, error);
        console.error(error.stack);

        return res.status(500).json({
            success: false,
            message: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        });
    }
});

// @GET /api/payment/webhook
// Reject GET requests gracefully on the webhook route
router.get('/webhook', (req, res) => {
    res.status(404).json({ message: 'GET method not supported for webhook endpoint. Please use POST.' });
});

// @POST /api/payment/webhook
// Cashfree webhook to process payment status (SUCCESS/FAILED)
router.post('/webhook', async (req, res) => {
    try {
        const ts = req.headers['x-webhook-timestamp'];
        const signature = req.headers['x-webhook-signature'];

        if (!ts || !signature) {
            return res.status(400).json({ message: 'Missing Cashfree webhook headers' });
        }

        const rawBody = req.rawBody;
        if (!rawBody) {
            return res.status(400).json({ message: 'Missing raw body. Ensure express.json is configured to store it.' });
        }

        // Verify webhook signature
        const data = ts + rawBody;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.CASHFREE_SECRET_KEY)
            .update(data)
            .digest('base64');

        if (expectedSignature !== signature) {
            console.error('Invalid Webhook Signature. Expected:', expectedSignature, 'Got:', signature);
            return res.status(403).json({ message: 'Invalid signature' });
        }

        const payload = req.body;
        console.log('Valid Cashfree Webhook Received:', payload.type);

        // Extract order_id from payload.data.order (Cashfree 2023-08-01 format)
        const order_id = payload.data?.order?.order_id || payload.data?.payment?.order_id;

        console.log(`[CASHFREE WEBHOOK] Payload received. Extracted order_id: ${order_id}`);

        if (!order_id) {
            console.error('[CASHFREE WEBHOOK] Order ID not found in webhook payload:', JSON.stringify(payload));
            return res.status(200).json({ status: 'OK', message: 'Payload missing order_id' }); // Return 200 so cashfree stops retrying invalid payloads
        }

        // Process based on event type
        if (payload.type === 'PAYMENT_SUCCESS_WEBHOOK') {
            const { payment_status } = payload.data.payment || {};

            if (payment_status === 'SUCCESS') {
                const existingOrder = await prisma.order.findUnique({ where: { id: order_id } });

                if (!existingOrder) {
                    console.error(`[CASHFREE WEBHOOK] Database order not found for order_id: ${order_id}`);
                    return res.status(404).json({ message: 'Order not found' });
                }

                console.log(`[CASHFREE WEBHOOK] Database order found: ${existingOrder.id}`);

                if (existingOrder.isPaid) {
                    console.log(`[CASHFREE WEBHOOK] Order ${order_id} already PAID. Idempotency check passed. Ignoring webhook.`);
                    return res.status(200).json({ status: 'OK' });
                }

                console.log("Executing Prisma query...");
                await prisma.order.update({
                    where: { id: order_id },
                    data: {
                        isPaid: true,
                        paidAt: new Date(),
                        status: 'PAID',
                        paymentResult: payload
                    }
                });
                console.log("Database write successful");
                console.log(`[CASHFREE WEBHOOK SUCCESS] Order ${order_id} updated successfully. Revenue updated in real time.`);
            }
        } else if (payload.type === 'PAYMENT_FAILED_WEBHOOK' || payload.type === 'PAYMENT_USER_DROPPED_WEBHOOK') {
            const existingOrder = await prisma.order.findUnique({ where: { id: order_id } });

            if (existingOrder && !existingOrder.isPaid) {
                console.log("Executing Prisma query...");
                await prisma.order.update({
                    where: { id: order_id },
                    data: {
                        isPaid: false,
                        status: 'FAILED',
                        paymentResult: payload
                    }
                });
                console.log("Database write successful");
                console.log(`[CASHFREE WEBHOOK FAILED] Order ${order_id} marked as FAILED. Not marked as paid.`);
            } else if (!existingOrder) {
                console.error(`[CASHFREE WEBHOOK] Database order not found for failed order_id: ${order_id}`);
            }
        }

        // Always acknowledge webhook immediately with 200 OK
        res.status(200).json({ status: 'OK' });
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

// @GET /api/payment/status/:orderId
// Safely check the order payment status from frontend
router.get('/status/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { id: true, isPaid: true, status: true }
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ isPaid: order.isPaid, status: order.status });
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

