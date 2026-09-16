const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const prisma = require('../models/db');
const router = express.Router();

// POST /api/contact — send customer message to admin email and save to DB
router.post('/', async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Save to Database
        console.log("Executing Prisma query...");
        await prisma.contactQuery.create({
            data: {
                name,
                email,
                subject,
                message
            }
        });
        console.log("Database write successful");
        console.log('[Contact] Query saved to database successfully');

        const now = new Date().toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'long',
            timeStyle: 'short'
        });

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f6f3; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
    .email-container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #ebf0e6; }
    .header { padding: 30px; text-align: center; background-color: #ffffff; }
    .logo { max-width: 200px; height: auto; }
    .hero { background-color: #475d2a; padding: 25px 30px; text-align: center; }
    .hero h1 { color: #ffffff; font-size: 22px; font-weight: 700; margin: 0; letter-spacing: 0.5px; }
    .hero p { color: #dfc4ac; font-size: 13px; margin: 8px 0 0; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; }
    .body { padding: 40px 30px; }
    .intro { color: #555555; font-size: 15px; line-height: 1.6; margin-top: 0; margin-bottom: 30px; text-align: center; }
    .data-card { background-color: #fafbf9; border: 1px solid #e5ebe0; border-radius: 12px; padding: 25px; margin-bottom: 25px; }
    .data-row { margin-bottom: 20px; }
    .data-row:last-child { margin-bottom: 0; }
    .label { font-size: 12px; font-weight: 700; color: #829e59; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; display: block; }
    .value { font-size: 15px; color: #2d371c; font-weight: 600; margin: 0; word-break: break-word; }
    .value a { color: #475d2a; text-decoration: none; }
    .message-box { background-color: #ffffff; border: 1px solid #e5ebe0; border-radius: 8px; padding: 20px; margin-top: 8px; font-size: 15px; color: #444; line-height: 1.7; white-space: pre-wrap; font-weight: 400; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); }
    .footer { background-color: #f4f6f3; padding: 30px; text-align: center; border-top: 1px solid #e5ebe0; }
    .btn { display: inline-block; background-color: #475d2a; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 30px; font-weight: 600; font-size: 14px; letter-spacing: 0.5px; margin-bottom: 15px; }
    .footer-text { color: #888888; font-size: 12px; margin: 0; }
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
      <h1>New Customer Inquiry</h1>
      <p>Action Required</p>
    </div>
    <div class="body">
      <p class="intro">A new message has been submitted via the ShuddhEats website contact form. Please review the details below.</p>
      
      <div class="data-card">
        <div class="data-row">
          <span class="label">Customer Name</span>
          <p class="value">${name}</p>
        </div>
        
        <div class="data-row">
          <span class="label">Email Address</span>
          <p class="value"><a href="mailto:${email}">${email}</a></p>
        </div>
        
        <div class="data-row">
          <span class="label">Date & Time</span>
          <p class="value" style="color: #666; font-weight: 500;">${now}</p>
        </div>
      </div>

      <div class="data-row">
        <span class="label">Subject</span>
        <p class="value" style="font-size: 18px; color: #475d2a;">${subject}</p>
      </div>
      
      <div class="data-row">
        <span class="label">Message</span>
        <div class="message-box">${message}</div>
      </div>
    </div>
    
    <div class="footer">
      <a href="https://www.shuddheats.co.in" class="btn">Visit ShuddhEats.co.in</a>
      <p class="footer-text">This automated alert was sent from your website platform.</p>
      <p class="footer-text" style="margin-top: 5px; color: #aaa;">You can safely reply directly to this email to contact the customer.</p>
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
                    to: 'shuddheats3126@gmail.com',
                    replyTo: email,
                    subject: `[ShuddhEats Inquiry] ${subject}`,
                    html: htmlContent
                })
            });
            const responseText = await response.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.warn('Webhook returned non-JSON response, but request succeeded:', responseText.substring(0, 100));
                data = { success: response.ok };
            }
            if (!data.success && !response.ok) throw new Error('Webhook failed to send email');
        } else {
            // Standard SMTP (Blocked on Railway Hobby plan)
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
                from: `"ShuddhEats Contact Form" <${process.env.SMTP_USER}>`,
                to: 'shuddheats3126@gmail.com',
                replyTo: email,
                subject: `[ShuddhEats Inquiry] ${subject}`,
                html: htmlContent,
                text: `New message from ${name} (${email})\n\nSubject: ${subject}\n\nMessage:\n${message}\n\nReceived: ${now}`
            });
        }
        
        console.log('[Contact] Email sent successfully');
        res.json({ success: true, message: 'Message sent successfully' });
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
