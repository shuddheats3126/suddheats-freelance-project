"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Gift } from 'lucide-react';

export default function LaunchOfferWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Hydration fix & Lazy rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        const toggleBtn = document.getElementById('launch-offer-toggle');
        if (toggleBtn && toggleBtn.contains(e.target as Node)) return;
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('mousedown', handleClickOutside);
    }
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes attention-sequence {
          0%, 15% { transform: scale(1) rotate(0deg); }
          17% { transform: scale(1) rotate(-8deg); }
          19% { transform: scale(1) rotate(8deg); }
          21% { transform: scale(1) rotate(-8deg); }
          23% { transform: scale(1) rotate(0deg); }
          
          38% { transform: scale(1) rotate(0deg); }
          42% { transform: scale(1.08) rotate(0deg); }
          46% { transform: scale(1) rotate(0deg); }
          
          61% { transform: scale(1) rotate(0deg); }
          65% { transform: scale(1) rotate(15deg); }
          69% { transform: scale(1) rotate(0deg); }
          
          100% { transform: scale(1) rotate(0deg); }
        }
        
        .animate-attention {
          animation: attention-sequence 8s ease-in-out infinite;
          transform-origin: center center;
          will-change: transform;
        }

        .premium-glass {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.5);
        }
      `}} />

      {/* Popup */}
      <div 
        ref={popupRef}
        role="dialog"
        aria-modal="true"
        aria-label="Launch Offer Details"
        className={`fixed z-[9999] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-bottom-right
          ${isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}
          bottom-[90px] right-[16px] w-[calc(100vw-32px)] h-[420px]
          md:bottom-[105px] md:right-[20px] md:w-[340px] md:h-[480px]
          lg:bottom-[124px] lg:right-[24px] lg:w-[380px] lg:h-[520px]
          premium-glass rounded-3xl shadow-[0_20px_40px_-10px_rgba(71,93,42,0.25)]
          flex flex-col overflow-hidden
        `}
      >
        {/* Header */}
        <div className="bg-[#475d2a] text-white p-5 md:p-6 shrink-0 relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-5 -mb-5 pointer-events-none"></div>
          
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/90 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Close popup"
          >
            <X size={18} />
          </button>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
              <span className="text-xl leading-none">🎉</span> Launch Celebration
            </div>
            <h3 className="text-xl md:text-2xl font-bold leading-tight mb-1 shadow-black/5" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>Welcome to ShuddhEats!</h3>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 bg-gradient-to-b from-white to-[#f9faf7]">
          <div className="space-y-6">
            <div>
              <p className="text-gray-600 leading-relaxed font-medium">
                We're excited to have you here. Amazing launch rewards are arriving soon.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 md:p-5 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.08)] border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#475d2a]/5 rounded-bl-full pointer-events-none"></div>
              
              <h4 className="font-bold text-[#475d2a] flex items-center gap-2 mb-4 text-sm uppercase tracking-wide">
                <Gift size={16} />
                Coming Soon
              </h4>
              
              <ul className="space-y-3.5">
                {[
                  'Exclusive Coupons',
                  'First Order Rewards',
                  'Launch Discounts',
                  'Surprise Gifts',
                  'Lucky Spin',
                  'Referral Program',
                  'Loyalty Rewards'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm md:text-base text-gray-700 font-medium">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#475d2a]/10 text-[#475d2a] shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="text-center pt-2">
              <p className="text-[#475d2a] font-bold text-lg">Stay tuned!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Badge Button */}
      <button
        id="launch-offer-toggle"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed z-[10000] focus:outline-none transition-all duration-300
          bottom-[16px] right-[16px] w-[80px] h-[80px]
          md:bottom-[20px] md:right-[20px] md:w-[100px] md:h-[100px]
          lg:bottom-[24px] lg:right-[24px] lg:w-[120px] lg:h-[120px]
          ${!isOpen ? 'animate-attention' : ''}
          ${isHovered && !isOpen ? 'scale-110' : ''}
        `}
        aria-label={isOpen ? "Close Launch Offer" : "Open Launch Offer"}
      >
        <div className={`relative w-full h-full rounded-full shadow-[0_12px_25px_-5px_rgba(61,82,37,0.7)]
          bg-gradient-to-br from-[#809f56] via-[#5c7a36] to-[#364b1f]
          flex items-center justify-center overflow-hidden transition-shadow duration-300
          border-[2px] border-[#6b8c42]
          ${isHovered ? 'shadow-[0_18px_35px_-5px_rgba(61,82,37,0.9)]' : ''}
        `}>
          {/* Inner 3D Sphere shadow */}
          <div className="absolute inset-0 rounded-full shadow-[inset_0_-15px_20px_rgba(0,0,0,0.35)] pointer-events-none"></div>

          {/* Stitched dashed border */}
          <div className="absolute inset-[5px] md:inset-[7px] rounded-full border-[1.5px] border-dashed border-white/30 pointer-events-none"></div>
          
          {/* Realistic Glossy top reflection */}
          <div className="absolute top-[2%] left-[10%] right-[10%] h-[40%] bg-gradient-to-b from-white/45 to-white/0 rounded-full rounded-b-[70%] pointer-events-none filter blur-[1px]"></div>
          
          <div className="flex flex-col items-center justify-center text-white relative z-10 drop-shadow-lg w-full mt-1">
            {isOpen ? (
              <X size={36} className="md:w-12 md:h-12 lg:w-14 lg:h-14 text-white/90" />
            ) : (
              <>
                <span className="text-3xl md:text-4xl lg:text-[46px] mb-0 md:mb-1 filter drop-shadow-md leading-none">🔥</span>
                <span className="text-[12px] md:text-[15px] lg:text-[18px] font-black tracking-tighter leading-[0.95] uppercase text-center w-full px-2" style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.5)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  Launch<br/>Offer
                </span>
              </>
            )}
          </div>
        </div>
      </button>
    </>
  );
}
