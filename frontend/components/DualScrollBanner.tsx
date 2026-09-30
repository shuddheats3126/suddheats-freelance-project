'use client';

export default function DualScrollBanner() {
    const topMessages = [
        'Guilt Free Crunch',
        'Loved by Families',
        'Made by Moms',
        'Honest Indian Ingredients',
    ];

    const bottomMessages = [
        'Trust Every Bite',
        'Real Kitchen Goodness',
        'Crafted at Home',
        'Wholesome Kid Approved',
    ];

    return (
        <div className="w-full py-8 overflow-hidden relative" style={{ background: '#1C1917' }}>
            {/* Subtle top and bottom border accent */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-white/5"></div>
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/5"></div>

            <style>{`
                @keyframes scrollRight {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes scrollLeft {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .scroll-right {
                    animation: scrollRight 40s linear infinite;
                    display: flex;
                    gap: 3.5rem;
                    white-space: nowrap;
                    align-items: center;
                }
                .scroll-left {
                    animation: scrollLeft 40s linear infinite;
                    display: flex;
                    gap: 3.5rem;
                    white-space: nowrap;
                    align-items: center;
                }
            `}</style>

            {/* Top Row - Scrolls Right (Champagne Gold Text) */}
            <div className="mb-6 overflow-hidden">
                <div className="scroll-right">
                    {[...topMessages, ...topMessages, ...topMessages, ...topMessages].map((msg, i) => (
                        <div key={`top-${i}`} className="flex items-center gap-6 flex-shrink-0">
                            <span className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-[#D4BA9E]">
                                {msg}
                            </span>
                            <span className="text-xs opacity-60">✨</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Row - Scrolls Left (Off-White Cream Text) */}
            <div className="overflow-hidden">
                <div className="scroll-left">
                    {[...bottomMessages, ...bottomMessages, ...bottomMessages, ...bottomMessages].map((msg, i) => (
                        <div key={`bottom-${i}`} className="flex items-center gap-6 flex-shrink-0">
                            <span className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-[#FCFBF8]">
                                {msg}
                            </span>
                            <span className="text-xs opacity-60">💫</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

