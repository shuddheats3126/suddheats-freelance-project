'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error('Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/auth/forgot-password', { email: email.trim() });
            setSubmitted(true);
            toast.success('Reset link sent to your email!');
        } catch (err: any) {
            console.error('Forgot password error:', err);
            toast.error(err.response?.data?.message || 'Failed to send reset link. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-8 sm:py-16 px-3 sm:px-4" style={{ background: '#f0f4ed' }}>
            <div className="w-full max-w-md">
                <div className="text-center mb-6 sm:mb-8">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden flex items-center justify-center mx-auto mb-3 sm:mb-4" style={{ background: 'rgba(255,255,255,0.95)', border: '2px solid #475d2a' }}>
                        <Image
                            src="https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563574/shuddheats/assets/logo-se-circle.png"
                            alt="ShuddhEats Logo"
                            width={80}
                            height={80}
                            className="object-contain"
                        />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#475d2a' }}>
                        {submitted ? 'Check Your Email' : 'Forgot Password?'}
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500 mt-1">
                        {submitted
                            ? "We've sent a password reset link to your email"
                            : "Enter your registered email and we'll send you a link to reset your password"}
                    </p>
                </div>

                <div className="card p-4 sm:p-8">
                    {submitted ? (
                        <div className="text-center py-2 space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                A reset link has been dispatched to <span className="font-semibold text-gray-800">{email}</span>. Please click the link in that email to reset your password.
                            </p>
                            <p className="text-xs text-gray-400">
                                Didn't receive an email? Check your spam/junk folder or request another link in 2 minutes.
                            </p>
                            <div className="pt-4 flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSubmitted(false)}
                                    className="text-xs font-semibold hover:underline"
                                    style={{ color: '#475d2a' }}
                                >
                                    Resend reset link
                                </button>
                                <Link
                                    href="/auth/login"
                                    className="btn-primary w-full justify-center py-3 text-sm flex items-center gap-2 mt-2"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Return to Login
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs sm:text-sm font-semibold mb-1.5" style={{ color: '#475d2a' }}>
                                    Your Email Address
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        placeholder="you@email.com"
                                        className="input-field text-sm py-2.5 sm:py-2 px-3 sm:px-4 pl-10 w-full"
                                    />
                                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full justify-center py-3 sm:py-4 text-sm sm:text-base h-12 sm:h-auto flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div
                                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                                    />
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>

                            <div className="pt-2 text-center">
                                <Link
                                    href="/auth/login"
                                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold hover:underline"
                                    style={{ color: '#475d2a' }}
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back to Login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
