import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET() {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'shuddheats3126@gmail.com',
                pass: 'qqbqyjjutwzxyglc'
            },
            connectionTimeout: 10000
        });

        await transporter.sendMail({
            from: '"ShuddhEats" <shuddheats3126@gmail.com>',
            to: 'shuddheats3126@gmail.com',
            subject: 'Vercel SMTP Test',
            text: 'It works from Vercel!'
        });

        return NextResponse.json({ success: true, message: 'Email sent from Vercel!' });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
