'use client';
import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true); // Default true to prevent flashing

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true) {
      setIsStandalone(true);
      return;
    }
    
    setIsStandalone(false);

    // Don't show if they dismissed it recently
    if (localStorage.getItem('shuddheats_install_dismissed')) {
      return;
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Slight delay so it doesn't show immediately on page load
      setTimeout(() => setIsVisible(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('shuddheats_install_dismissed', 'true');
  };

  if (isStandalone || !isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-slideUp sm:hidden">
      <div className="bg-white rounded-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border border-gray-100 p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-gray-100">
            <img src="/icons/icon-192x192.png" alt="App Icon" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <h4 className="font-bold text-[15px] leading-tight text-gray-900">Install ShuddhEats</h4>
            <p className="text-xs text-gray-500 mt-0.5">Order faster, offline access</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={handleDismiss}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
          <button 
            onClick={handleInstallClick}
            className="h-9 px-4 rounded-full text-sm font-bold text-white flex items-center gap-1.5 shadow-sm"
            style={{ background: '#475d2a' }}
          >
            <Download className="w-3.5 h-3.5" /> Install
          </button>
        </div>
      </div>
    </div>
  );
}
