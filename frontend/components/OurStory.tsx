'use client';
import { useState } from 'react';

export default function OurStory() {
    const [activeTab, setActiveTab] = useState('farm');

    const content = {
        farm: {
            title: 'Farm Fresh',
            description: 'We partner with Indian farmers who grow clean, seasonal ingredients using mindful methods. No shortcuts, no nasties, just traceable produce picked at peak, so each bite begins natural, honest, and homegrown.',
            emojis: ['🌾', '🚜', '🌱']
        },
        chef: {
            title: 'Chef Crafted',
            description: 'Our expert chefs carefully craft every recipe using traditional techniques and premium ingredients. Each snack is made with precision, passion, and purpose to deliver exceptional taste and quality.',
            emojis: ['👨‍🍳', '🍳', '🧂']
        },
        family: {
            title: 'Family First',
            description: 'We believe in creating snacks that bring families together. Every product is made with care, keeping health and happiness in mind, so you can share wholesome moments with your loved ones.',
            emojis: ['👨‍👩‍👧‍👦', '❤️', '🍪']
        }
    };

    const current = content[activeTab as keyof typeof content];

    return (
        <section className="py-6 bg-white">
            <div className="page-container">
                {/* Heading */}
                <div className="text-center mb-4">
                    <h2 className="text-2xl md:text-3xl font-bold">
                        Grown, Crafted, <span className="text-red-500 italic">Shared.</span>
                    </h2>
                </div>

                {/* Toggle Buttons - Below Heading */}
                <div className="flex justify-center mb-6">
                    <div className="flex gap-0 border-2 border-gray-300 rounded-full p-1 bg-white w-fit shadow-sm">
                    <button
                        onClick={() => setActiveTab('farm')}
                        className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                            activeTab === 'farm'
                                ? 'bg-[#475d2a] text-white shadow-md'
                                : 'bg-transparent text-gray-600 hover:text-[#475d2a] hover:bg-gray-50'
                        }`}
                    >
                        Farm Fresh
                    </button>
                    <button
                        onClick={() => setActiveTab('chef')}
                        className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                            activeTab === 'chef'
                                ? 'bg-[#475d2a] text-white shadow-md'
                                : 'bg-transparent text-gray-600 hover:text-[#475d2a] hover:bg-gray-50'
                        }`}
                    >
                        Chef Crafted
                    </button>
                    <button
                        onClick={() => setActiveTab('family')}
                        className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                            activeTab === 'family'
                                ? 'bg-[#475d2a] text-white shadow-md'
                                : 'bg-transparent text-gray-600 hover:text-[#475d2a] hover:bg-gray-50'
                        }`}
                    >
                        Family First
                    </button>
                    </div>
                </div>

                {/* Content Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-[#fafaf7] p-8 md:p-12 rounded-3xl border border-gray-100 shadow-sm mt-8">
                    {/* Left - Text Content */}
                    <div className="order-2 lg:order-1 flex flex-col justify-center">
                        <h3 className="text-2xl font-bold text-[#475d2a] mb-4">{current.title}</h3>
                        <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                            {current.description}
                        </p>
                    </div>

                    {/* Right - Illustration Placeholder */}
                    <div className="order-1 lg:order-2">
                        <div className="bg-white rounded-3xl p-4 md:p-8 flex items-center justify-center min-h-[120px] md:min-h-[250px] shadow-sm border border-gray-100 overflow-hidden relative">
                            <div className="absolute inset-0 bg-[#475d2a]/5"></div>
                            <div className="flex gap-4 md:gap-8 items-center relative z-10 transition-all duration-500 hover:scale-110">
                                {current.emojis.map((emoji, idx) => (
                                    <div key={idx} className="text-5xl md:text-7xl filter drop-shadow-md transform transition-transform hover:-translate-y-2 cursor-pointer">
                                        {emoji}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
