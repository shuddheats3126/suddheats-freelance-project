'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, Eye, EyeOff, Lock, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token') || '';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            toast.error('Invalid or missing password reset token. Please request a new link.');
            return;
        }

        if (password.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', {
                token,
                password
            });
            setSuccess(true);
            toast.success('Password reset successfully! 🌿');
        } catch (err: any) {
            console.error('Reset password error:', err);
            toast.error(err.response?.data?.message || 'Failed to reset password. Link may be expired.');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="card p-6 sm:p-8 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center text-red-600">
                    <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Invalid Reset Link</h2>
                <p className="text-sm text-gray-500">
                    This password reset link is invalid or incomplete. Please request a new password reset link.
                </p>
                <Link
                    href="/auth/forgot-password"
                    className="btn-primary inline-flex items-center justify-center py-2.5 px-6 text-sm"
                >
                    Request New Link
                </Link>
            </div>
        );
    }

    if (success) {
        return (
            <div className="card p-6 sm:p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#475d2a' }}>
                    Password Reset Complete!
                </h2>
                <p className="text-sm text-gray-600">
                    Your password has been securely updated. You can now log in to your account with your new credentials.
                </p>
                <div className="pt-2">
                    <Link
                        href="/auth/login"
                        className="btn-primary w-full justify-center py-3 text-sm flex items-center gap-2"
                    >
                        Sign in to ShuddhEats
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="card p-4 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-1.5" style={{ color: '#475d2a' }}>
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            placeholder="At least 8 characters"
                            className="input-field text-sm py-2.5 sm:py-2 px-3 sm:px-4 pr-12 w-full"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(s => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-1.5" style={{ color: '#475d2a' }}>
                        Confirm New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Re-enter your new password"
                            className="input-field text-sm py-2.5 sm:py-2 px-3 sm:px-4 pr-12 w-full"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(s => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="text-xs text-gray-500 space-y-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className={password.length >= 8 ? 'text-green-600 font-medium' : 'text-gray-500'}>
                        ✓ Minimum 8 characters
                    </p>
                    <p className={password && password === confirmPassword ? 'text-green-600 font-medium' : 'text-gray-500'}>
                        ✓ Passwords match
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full justify-center py-3 sm:py-4 text-sm sm:text-base h-12 sm:h-auto flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        'Update Password'
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
        </div>
    );
}

export default function ResetPasswordPage() {
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
                        Set New Password
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500 mt-1">
                        Choose a strong password to protect your account
                    </p>
                </div>

                <Suspense fallback={
                    <div className="card p-8 text-center">
                        <div className="w-8 h-8 border-2 border-gray-300 border-t-[#475d2a] rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Loading reset verification...</p>
                    </div>
                }>
                    <ResetPasswordContent />
                </Suspense>
            </div>
        </div>
    );
}
