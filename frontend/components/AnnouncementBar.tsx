'use client';

const items = [
  '🌿 1,00,000+ Happy Snackers',
  '📦 10,000+ Orders Every Month',
  '🚚 Free Delivery on Orders Above ₹699',
  '🇮🇳 Shipped Across All of India',
  '🔥 100% Baked / Roasted — Never Deep-Fried',
  '✅ No Maida · No Palm Oil · No Preservatives',
  '⭐ Doctor & Nutritionist Approved',
  '♻️ Eco-Friendly Recyclable Packaging',
];

export default function AnnouncementBar() {
  // Double the items so the seamless loop always has content
  const repeated = [...items, ...items];

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
          animation: ticker 45s linear infinite;
        }
        .announcement-track:hover {
          animation-play-state: paused;
        }
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
