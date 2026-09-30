'use client';
import { Shield, Sparkles, HelpCircle } from 'lucide-react';

export default function IngredientsEducation() {
  const cards = [
    {
      id: 'edu-palm-oil',
      badge: '⚠️ Highly Inflammatory',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
      title: 'Palm Oil',
      description: 'Used in 90% of ordinary packaged snacks to lower production costs. It causes unhealthy weight gain, raises LDL (bad) cholesterol, and triggers chronic inflammation.',
      promise: '🌿 100% Palm Oil Free',
      promiseBg: 'bg-emerald-50 text-emerald-800 border-emerald-100',
      accentColor: '#d97706', // Amber accent
      bgColor: 'from-amber-50/70 to-amber-100/40 border-amber-200/60',
      svgIcon: (
        <svg viewBox="0 0 100 100" className="w-14 h-14 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
          <defs>
            <linearGradient id="palmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="38" fill="rgba(245, 158, 11, 0.1)" />
          <path d="M50 20 C62 38 66 50 66 62 C66 74 58 80 50 80 C42 80 34 74 34 62 C34 50 38 38 50 20 Z" fill="url(#palmGrad)" />
          <line x1="28" y1="28" x2="72" y2="72" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
          <circle cx="50" cy="50" r="30" stroke="#ef4444" strokeWidth="6" fill="none" />
          <path d="M72 15 C80 15 85 22 82 30 C75 36 68 33 68 25 C68 18 70 15 72 15 Z" fill="url(#leafGrad)" />
          <path d="M72 15 L75 25" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 'edu-preservatives',
      badge: '⚠️ Chemical Preservative',
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
      title: 'Sodium Benzoate',
      description: 'A synthetic preservative common in traditional sauces and beverages. When combined with Vitamin C, it reacts to form Benzene—a known human carcinogen.',
      promise: '🛡️ Zero Preservatives',
      promiseBg: 'bg-teal-50 text-teal-800 border-teal-100',
      accentColor: '#e11d48', // Rose accent
      bgColor: 'from-rose-50/70 to-rose-100/40 border-rose-200/60',
      svgIcon: (
        <svg viewBox="0 0 100 100" className="w-14 h-14 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1">
          <defs>
            <linearGradient id="flaskGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#0f766e" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="38" fill="rgba(225, 29, 72, 0.08)" />
          <path d="M43 20 L57 20 M50 20 L50 35 M32 75 L68 75 L56 42 L56 22 L44 22 L44 42 Z" stroke="#374151" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M35 70 L65 70 L56 48 L44 48 Z" fill="url(#flaskGrad)" />
          <circle cx="46" cy="58" r="3" fill="#fff" opacity="0.7" />
          <circle cx="54" cy="64" r="2" fill="#fff" opacity="0.8" />
          <path d="M68 25 C68 25 78 28 82 32 C82 45 78 58 68 65 C58 58 54 45 54 32 C58 28 68 25 68 25 Z" fill="url(#shieldGrad)" />
          <path d="M64 45 L67 48 L73 42" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      )
    },
    {
      id: 'edu-acrylamides',
      badge: '⚠️ Deep Frying Byproduct',
      badgeBg: 'bg-orange-100 text-orange-800 border-orange-200',
      title: 'Acrylamides',
      description: 'Harmful chemical compounds created when high-starch foods are deep-fried at extreme temperatures. Globally classified as a probable human carcinogen.',
      promise: '🔥 Air-Fried & Roasted Only',
      promiseBg: 'bg-emerald-50 text-emerald-800 border-emerald-100',
      accentColor: '#ea580c', // Orange accent
      bgColor: 'from-orange-50/70 to-orange-100/40 border-orange-200/60',
      svgIcon: (
        <svg viewBox="0 0 100 100" className="w-14 h-14 transition-transform duration-500 group-hover:scale-110">
          <defs>
            <linearGradient id="fireGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
            <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="38" fill="rgba(234, 88, 12, 0.08)" />
          <path d="M40 78 C32 78 28 70 32 60 C35 50 48 35 50 20 C52 35 65 50 68 60 C72 70 68 78 60 78 Z" fill="url(#fireGrad)" opacity="0.85" />
          <path d="M44 78 C38 78 36 73 38 65 C40 57 48 48 50 35 C52 48 60 57 62 65 C64 73 62 78 56 78 Z" fill="#facc15" />
          <path d="M22 64 C22 74 30 82 40 82 C50 82 58 74 58 64 L22 64" fill="none" stroke="#374151" strokeWidth="4" />
          <path d="M58 70 L78 80" stroke="#374151" strokeWidth="4" strokeLinecap="round" />
          <line x1="25" y1="45" x2="65" y2="85" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" />
          <path d="M75 25 L78 32 L85 35 L78 38 L75 45 L72 38 L65 35 L72 32 Z" fill="url(#sunGrad)" />
        </svg>
      )
    }
  ];

  return (
    <section className="py-10 bg-white relative overflow-hidden" id="ingredients-education">
      <div className="absolute top-1/4 left-0 w-80 h-80 bg-[#475d2a]/5 rounded-full filter blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-red-500/5 rounded-full filter blur-3xl pointer-events-none"></div>

      <div className="page-container relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#475d2a]/20 bg-[#475d2a]/5 text-[#475d2a] font-bold text-[10px] uppercase tracking-wider mb-2 animate-scaleIn">
            <HelpCircle className="w-3 h-3" /> Did You Know?
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#475d2a] tracking-tight mb-2">
            Avoid the <span className="text-red-500 italic relative">Hidden Nasties</span> in Your Snacks
          </h2>
          <p className="max-w-xl mx-auto text-gray-500 text-xs sm:text-sm leading-relaxed">
            Most supermarket snacks are loaded with cheap chemicals and fillers. Here is why we banned them entirely from ShuddhEats.
          </p>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {cards.map((card) => (
            <div
              key={card.id}
              id={card.id}
              className={`group flex flex-col justify-between bg-gradient-to-b ${card.bgColor} border rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden`}
            >
              <div 
                className="absolute -right-20 -top-20 w-32 h-32 rounded-full filter blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none" 
                style={{ backgroundColor: card.accentColor }}
              ></div>

              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`badge border text-[9px] font-bold py-1 px-2.5 rounded-full ${card.badgeBg}`}>
                    {card.badge}
                  </span>
                </div>

                {/* SVG Illustration Container */}
                <div className="h-16 flex items-center justify-start mb-4">
                  {card.svgIcon}
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-[#475d2a] mb-1.5 group-hover:text-red-600 transition-colors duration-300">
                  {card.title}
                </h3>

                {/* Body Text */}
                <p className="text-xs text-gray-600 leading-relaxed mb-4">
                  {card.description}
                </p>
              </div>

              {/* ShuddhEats Contrast Promise */}
              <div className={`mt-auto border rounded-xl p-2.5 flex items-center gap-2 ${card.promiseBg} border-dashed`}>
                <div className="flex-grow">
                  <p className="font-bold text-[9px] uppercase tracking-wider mb-0.5 text-gray-500">ShuddhEats Promise</p>
                  <p className="font-extrabold text-xs sm:text-sm text-gray-900 flex items-center gap-1">
                    {card.promise} <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  </p>
                </div>
              </div>

              {/* Bottom design border accent line */}
              <div 
                className="absolute bottom-0 left-0 right-0 h-1 transition-transform scale-x-0 group-hover:scale-x-100 duration-300 origin-left"
                style={{ backgroundColor: card.accentColor }}
              ></div>
            </div>
          ))}
        </div>

        {/* Informative Footer Badge */}
        <div className="mt-8 text-center">
          <p className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-bold bg-gray-50 border border-gray-100 rounded-full px-4 py-1.5 shadow-xs">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            Every ingredient is 100% traceably sourced, doctor-approved, and clean-label certified.
          </p>
        </div>

      </div>
    </section>
  );
}

