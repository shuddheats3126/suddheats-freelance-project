'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Leaf } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        setLoading(true);
        try {
            await register(form.name, form.email, form.password, form.phone);
            toast.success('Account created! Welcome to ShuddhEats 🌿');
            router.push('/');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-8 sm:py-16 px-3 sm:px-4" style={{ background: '#f0f4ed' }}>
            <div className="w-full max-w-md">
                <div className="text-center mb-6 sm:mb-8">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4" style={{ background: '#475d2a' }}>
                        <Leaf className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: '#475d2a' }}>Join ShuddhEats</h1>
                    <p className="text-sm sm:text-base text-gray-500 mt-1">Create your account and start snacking clean</p>
                </div>
                <div className="card p-4 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                        {[
                            { n: 'name', l: 'Full Name', t: 'text', p: 'Rahul Sharma' },
                            { n: 'email', l: 'Email', t: 'email', p: 'rahul@email.com' },
                            { n: 'phone', l: 'Phone (optional)', t: 'tel', p: '+91 8850823761' },
                            { n: 'password', l: 'Password', t: 'password', p: 'Min 6 characters' },
                        ].map(({ n, l, t, p }) => (
                            <div key={n}>
                                <label className="block text-xs sm:text-sm font-semibold mb-1.5" style={{ color: '#475d2a' }}>{l}</label>
                                <input type={t} value={(form as any)[n]} onChange={e => setForm(f => ({ ...f, [n]: e.target.value }))}
                                    placeholder={p} required={n !== 'phone'} className="input-field text-sm py-2.5 sm:py-2 px-3 sm:px-4 w-full" />
                            </div>
                        ))}
                        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 sm:py-4 text-sm sm:text-base h-12 sm:h-auto flex items-center justify-center gap-2">
                            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} /> : 'Create Account'}
                        </button>
                    </form>
                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100 text-center">
                        <p className="text-xs sm:text-sm text-gray-500">Already have an account?{' '}
                            <Link href="/auth/login" className="font-bold hover:underline" style={{ color: '#475d2a' }}>Login</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
