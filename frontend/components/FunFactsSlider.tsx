'use client';
import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Award, Flame, Sparkles } from 'lucide-react';
import Image from 'next/image';

const slides = [
  {
    id: 'fact-1',
    bgTheme: 'bg-gradient-to-br from-[#f0f4ed] via-white to-[#e8efe3]',
    title: 'Fun Facts, Real Snacks',
    accentColor: '#475d2a',
    heading: 'Makhana is 5,000 Years Old 📜',
    description: 'Fox nuts have been part of Indian diets since ancient times – you’re basically snacking on history!',
    badge: 'Did You Know?',
    visual: (
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-radial-gradient from-emerald-100 to-transparent opacity-60 rounded-2xl"></div>
        <div className="relative z-10 flex flex-col items-center gap-2 animate-scaleIn">
          <div className="relative w-24 h-24 bg-white rounded-full shadow-md flex items-center justify-center border-4 border-[#475d2a]">
            <span className="text-5xl">🏛️</span>
            <span className="absolute -top-2 -right-2 text-2xl animate-bounce-slow">✨</span>
          </div>
          <div className="bg-[#475d2a] text-white font-extrabold text-[9px] tracking-widest uppercase px-3 py-1 rounded-full shadow">
            Ancient Roots
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'fact-2',
    bgTheme: 'bg-gradient-to-br from-[#FEF9E7] via-white to-[#FDF2E2]',
    title: 'Fun Facts, Real Snacks',
    accentColor: '#d97706',
    heading: 'One Handful = Guilt-Free Power 💪',
    description: 'A single serving of roasted makhana has more protein than a regular potato chip pack -and way less oil.',
    badge: 'Did You Know?',
    visual: (
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-radial-gradient from-amber-100 to-transparent opacity-60 rounded-2xl"></div>
        <div className="relative z-10 flex flex-col items-center gap-3 animate-fadeInUp">
          <div className="relative w-20 h-20 bg-white/90 rounded-xl shadow-xs border border-amber-300 flex items-center justify-center hover:scale-105 transition-transform duration-300 p-2">
            <span className="text-5xl">⚡</span>
          </div>
          <div className="bg-amber-600 text-white font-extrabold text-[9px] tracking-widest uppercase px-3 py-1 rounded-full shadow flex items-center gap-1">
            <Flame className="w-3 h-3 fill-white text-white" /> High Protein
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'fact-3',
    bgTheme: 'bg-gradient-to-br from-[#F0FDF4] via-white to-[#DCFCE7]',
    title: 'Fun Facts, Real Snacks',
    accentColor: '#059669',
    heading: 'Millets Fed Ancient Kings 👑',
    description: 'Long before rice took over, millets were the OG superfood of Indian royalty.',
    badge: 'Did You Know?',
    visual: (
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-radial-gradient from-emerald-100 to-transparent opacity-60 rounded-2xl"></div>
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="relative w-24 h-24 bg-white rounded-2xl shadow-md border border-emerald-200 flex items-center justify-center">
            <span className="text-5xl">🌾</span>
            <span className="absolute -bottom-2 -right-2 text-2xl animate-pulse">👑</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'fact-4',
    bgTheme: 'bg-gradient-to-br from-[#EFF6FF] via-white to-[#DBEAFE]',
    title: 'Fun Facts, Real Snacks',
    accentColor: '#2563EB',
    heading: 'Makhana Grows in Water, Not Soil 💧',
    description: 'Fun fact: fox nuts are harvested from ponds and lakes – nature’s own floating snack farm!',
    badge: 'Did You Know?',
    visual: (
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-radial-gradient from-blue-100 to-transparent opacity-60 rounded-2xl"></div>
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="relative w-24 h-24 bg-white rounded-full shadow-md flex items-center justify-center border-4 border-[#2563EB]">
            <span className="text-5xl">🌊</span>
          </div>
          <div className="bg-[#2563EB] text-white font-extrabold text-[9px] tracking-widest uppercase px-3 py-1 rounded-full shadow">
            Floating Farm
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'fact-5',
    bgTheme: 'bg-gradient-to-br from-[#FEF2F2] via-white to-[#FEE2E2]',
    title: 'Fun Facts, Real Snacks',
    accentColor: '#DC2626',
    heading: 'A Spoon of Ghee, A Boost of Goodness 🧈',
    description: 'Roasting makhana in ghee doesn’t just add flavor – it helps your body absorb its nutrients better.',
    badge: 'Did You Know?',
    visual: (
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-radial-gradient from-red-100 to-transparent opacity-60 rounded-2xl"></div>
        <div className="relative z-10 flex flex-col items-center gap-2">
          <div className="relative w-20 h-20 bg-white/90 rounded-xl shadow-xs border border-red-300 flex items-center justify-center hover:scale-105 transition-transform duration-300 p-2">
            <span className="text-5xl">🥄</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'fact-6',
    bgTheme: 'bg-gradient-to-br from-[#F5F3FF] via-white to-[#EDE9FE]',
    title: 'Fun Facts, Real Snacks',
    accentColor: '#7C3AED',
    heading: 'Steady Energy, No Sugar Crash 🔋',
    description: 'Thanks to its low glycemic index, makhana keeps blood sugar stable – so you stay full longer, without the spike.',
    badge: 'Did You Know?',
    visual: (
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-radial-gradient from-purple-100 to-transparent opacity-60 rounded-2xl"></div>
        <div className="relative z-10 flex flex-col items-center gap-2 animate-scaleIn">
          <div className="relative w-24 h-24 bg-white rounded-full shadow-md flex items-center justify-center border-4 border-[#7C3AED]">
            <span className="text-5xl">🔋</span>
            <span className="absolute -top-2 -right-2 text-2xl animate-bounce-slow">✨</span>
          </div>
          <div className="bg-[#7C3AED] text-white font-extrabold text-[9px] tracking-widest uppercase px-3 py-1 rounded-full shadow">
            Sustained Energy
          </div>
        </div>
      </div>
    )
  }
];

export default function FunFactsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <section 
      className="py-10 bg-[#fafaf7] relative overflow-hidden" 
      id="fun-facts"
    >
      <div className="page-container">
        
        {/* Heading */}
        <div className="text-center mb-8 relative">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#475d2a] tracking-tight flex flex-col items-center gap-1.5">
            <span>{slides[currentIndex].title}</span>
            <span className="w-16 h-0.5 bg-yellow-400 rounded-full animate-pulse"></span>
          </h2>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-4xl mx-auto px-4">
          
          {/* Left Mascot Character (Chef Red) */}
          <div className="absolute right-full mr-3 lg:mr-8 xl:mr-10 bottom-[-20px] w-44 lg:w-56 xl:w-64 h-auto lg:block hidden z-10 animate-float pointer-events-none select-none">
            <Image 
              src="https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563563/shuddheats/assets/character-red.png" 
              alt="ShuddhEats Mascot Chef" 
              width={260} 
              height={270}
              className="w-full h-auto object-contain filter drop-shadow-[0_12px_24px_rgba(71,93,42,0.15)] hover:scale-108 hover:-rotate-3 transition-all duration-500 ease-out pointer-events-auto cursor-pointer"
            />
          </div>

          {/* Right Mascot Character (Chef Orange) */}
          <div className="absolute left-full ml-3 lg:ml-8 xl:ml-10 bottom-[-15px] w-44 lg:w-56 xl:w-64 h-auto lg:block hidden z-10 animate-float-delayed pointer-events-none select-none">
            <Image 
              src="https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563561/shuddheats/assets/character-orange-v2.png" 
              alt="ShuddhEats Mascot Elder" 
              width={260} 
              height={260}
              className="w-full h-auto object-contain filter drop-shadow-[0_12px_24px_rgba(71,93,42,0.15)] hover:scale-108 hover:rotate-3 transition-all duration-500 ease-out pointer-events-auto cursor-pointer"
            />
          </div>

          {/* Main Slide Card */}
          <div className={`card overflow-hidden shadow-md border border-gray-100 transition-all duration-500 ${slides[currentIndex].bgTheme}`}>
            <div className="grid grid-cols-1 md:grid-cols-12 items-center min-h-[290px]">
              
              {/* Left Column - Beautiful Illustration / Product visual */}
              <div className="col-span-1 md:col-span-4 h-40 md:h-full min-h-[160px] border-b md:border-b-0 md:border-r border-gray-100/50 flex items-center justify-center">
                {slides[currentIndex].visual}
              </div>

              {/* Right Column - Fun Fact text description */}
              <div className="col-span-1 md:col-span-8 p-6 sm:p-8 flex flex-col justify-center">
                
                {/* Badge tag */}
                <div className="flex items-center gap-1 mb-2">
                  <span className="badge badge-primary text-[9px] font-bold py-0.5 px-2 bg-white/80 border border-emerald-100 shadow-xs">
                    {slides[currentIndex].badge}
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-spin" style={{ animationDuration: '6s' }} />
                </div>

                {/* Heading */}
                <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#475d2a] mb-2 tracking-tight leading-tight">
                  {slides[currentIndex].heading}
                </h3>

                {/* Body Content */}
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-medium mb-4">
                  {slides[currentIndex].description}
                </p>

                {/* Sparkle Brand Signature */}
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#475d2a]/80">ShuddhEats Standard</span>
                </div>

              </div>

            </div>
          </div>

          {/* Navigation Controls */}
          
          {/* Left Arrow Button */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 md:-left-4 w-9 h-9 bg-white hover:bg-[#475d2a] text-[#475d2a] hover:text-white rounded-full shadow-md flex items-center justify-center border border-gray-100 transition-all duration-300 hover:scale-110 active:scale-95 group z-20 cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
          </button>

          {/* Right Arrow Button */}
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 md:-right-4 w-9 h-9 bg-white hover:bg-[#475d2a] text-[#475d2a] hover:text-white rounded-full shadow-md flex items-center justify-center border border-gray-100 transition-all duration-300 hover:scale-110 active:scale-95 group z-20 cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
          </button>

        </div>

        {/* Step Indicator Progress Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentIndex 
                  ? 'w-8 bg-[#475d2a] shadow-xs' 
                  : 'w-2.5 bg-gray-300 hover:bg-[#475d2a]/55'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
