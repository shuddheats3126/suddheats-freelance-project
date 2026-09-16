'use client';

const items = [
  '🚚 Free Delivery on Orders Above ₹699',
  '🔥 100% Baked / Roasted — Never Deep-Fried',
  '✅ No Maida · No Palm Oil · No Preservatives',
];

export default function AnnouncementBar() {
  // Create 10 copies to ensure it covers even ultra-wide screens seamlessly
  const repeated = Array(10).fill(items).flat();

  return (
    <div
      className="fixed top-0 left-0 right-0 w-full overflow-hidden z-[60]"
      style={{ background: '#475d2a', height: '34px' }}
    >
      <div
        className="announcement-track flex items-center h-full gap-0 whitespace-nowrap"
        aria-label="Announcements"
      >
        {repeated.map((text, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-3 text-white text-[11px] sm:text-xs font-semibold tracking-wide px-6"
            style={{ flexShrink: 0 }}
          >
            {text}
            <span className="text-white/40 select-none">|</span>
          </span>
        ))}
      </div>

      <style jsx>{`
        .announcement-track {
          width: max-content;
          animation: ticker 25s linear infinite;
        }
        .announcement-track:hover {
          animation-play-state: paused;
        }
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-10%); }
        }
      `}</style>
    </div>
  );
}
