"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LaunchOfferWidget() {
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Hydration fix & Lazy rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (pathname === '/launch-offers') return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Lilita+One&display=swap');

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
      `}} />

      {/* Floating Badge Button */}
      <Link
        id="launch-offer-toggle"
        href="/launch-offers"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed z-[10000] focus:outline-none transition-all duration-300 block
          bottom-[16px] right-[16px] w-[80px] h-[80px]
          md:bottom-[20px] md:right-[20px] md:w-[100px] md:h-[100px]
          lg:bottom-[24px] lg:right-[24px] lg:w-[120px] lg:h-[120px]
          animate-attention
          ${isHovered ? 'scale-110' : ''}
        `}
        aria-label="View Exclusive Launch Offers"
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
            <span className="text-3xl md:text-4xl lg:text-[46px] mb-0 md:mb-1 filter drop-shadow-md leading-none">🔥</span>
            <span className="text-[14px] md:text-[17px] lg:text-[20px] tracking-wide leading-[0.95] uppercase text-center w-full px-2" style={{ textShadow: '0px 2px 5px rgba(0,0,0,0.6)', fontFamily: "'Lilita One', system-ui, sans-serif" }}>
              Launch<br/>Offer
            </span>
          </div>
        </div>
      </Link>
    </>
  );
}
