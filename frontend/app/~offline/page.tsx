'use client';
import { WifiOff } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <WifiOff className="w-10 h-10 text-gray-400" />
      </div>
      <h1 className="text-2xl font-bold mb-2">You're Offline</h1>
      <p className="text-gray-500 mb-8 max-w-md">
        It looks like you've lost your internet connection. Some features of ShuddhEats are unavailable offline.
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="btn-primary"
      >
        Try Again
      </button>
      <div className="mt-4">
        <Link href="/" className="text-sm font-semibold hover:underline" style={{ color: '#475d2a' }}>
          Back to Homepage
        </Link>
      </div>
    </div>
  );
}
