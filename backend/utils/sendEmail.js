const nodemailer = require('nodemailer');

/**
 * Universal email helper for ShuddhEats
 * Supports both Railway Webhook (bypassing SMTP port block) and standard SMTP (Nodemailer)
 */
async function sendEmail({ to, subject, html, text }) {
    if (process.env.EMAIL_WEBHOOK_URL) {
        console.log(`[Email] Sending via Webhook to ${to}...`);
        const response = await fetch(process.env.EMAIL_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to,
                subject,
                html,
                text: text || ''
            }),
            redirect: 'manual'
        });

        if (response.status !== 200 && response.status !== 302) {
            const errText = await response.text();
            console.error('[Email Webhook Error]:', response.status, errText);
            throw new Error(`Email Webhook returned status ${response.status}`);
        }
        console.log(`[Email] Webhook delivered successfully to ${to}`);
        return true;
    }

    console.log(`[Email] Sending via Nodemailer SMTP to ${to}...`);
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 465,
        secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000
    });

    await transporter.sendMail({
        from: `"ShuddhEats" <${process.env.SMTP_USER || 'shuddheats3126@gmail.com'}>`,
        to,
        subject,
        html,
        text: text || ''
    });

    console.log(`[Email] SMTP delivered successfully to ${to}`);
    return true;
}

module.exports = sendEmail;
