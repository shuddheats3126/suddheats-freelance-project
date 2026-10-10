'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Sparkles, Flame, Clock, Check, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import api from '@/lib/api';

export interface LaunchCombo {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice: number;
    thumbnail: string;
    badge: string;
    subtitle?: string;
    description: string;
    itemsCount?: number;
    stock: number;
}

export const LAUNCH_COMBOS: LaunchCombo[] = [
    {
        id: 'combo-1',
        name: 'The Ultimate Snack Combo',
        slug: 'ultimate-snack-combo',
        price: 999,
        originalPrice: 1299,
        thumbnail: 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1791552421/ultimate_snakc_combo.jpg',
        badge: 'ALL 6 @ ₹999',
        subtitle: 'Air Fried Chips & Millet Cookies (All 6 Varieties)',
        description: 'The mega celebration pack: Air Fried Beetroot, Broccoli & Ragi Chips + Classic Jowar Nutty, Premium Ragi Elaichi & Millet Honey Oats Cookies.',
        itemsCount: 6,
        stock: 100
    },
    {
        id: 'combo-2',
        name: '3 Pack Combo',
        slug: '3-pack-makhana-combo',
        price: 569,
        originalPrice: 749,
        thumbnail: 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1791552422/3_pack_combo.jpg',
        badge: 'ONLY ₹569',
        subtitle: 'Ghee Roasted Flavoured Makhana Trio',
        description: 'Pure roasted fox nuts trio: Cream & Onion, Himalayan Pink Salt & Fiery Peri Peri Makhana.',
        itemsCount: 3,
        stock: 100
    },
    {
        id: 'combo-3',
        name: '2 Cookies Combo',
        slug: '2-cookies-combo',
        price: 369,
        originalPrice: 499,
        thumbnail: 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1791552422/2_cokkie_combo.jpg',
        badge: 'ONLY ₹369',
        subtitle: 'No Maida • Rich in Fibre • Baked with Care',
        description: 'Millet cookie duo: Classic Jowar Nutty Cookies & Premium Ragi Elaichi Cookies. Zero refined sugar.',
        itemsCount: 2,
        stock: 100
    },
    {
        id: 'combo-4',
        name: 'Classic Combo',
        slug: 'classic-combo',
        price: 369,
        originalPrice: 499,
        thumbnail: 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1791552422/classical_combo.jpg',
        badge: 'ONLY ₹369',
        subtitle: 'No Maida • Rich in Fibre • Baked with Care',
        description: 'Timeless favorites duo: Classic Jowar Nutty Cookies & Millet Honey Oats Cookies.',
        itemsCount: 2,
        stock: 100
    },
    {
        id: 'combo-5',
        name: 'Ragi + Broccoli Combo',
        slug: 'ragi-broccoli-combo',
        price: 349,
        originalPrice: 429,
        thumbnail: 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1791552421/WhatsApp_Image_2026-10-06_at_7.57.15_PM.jpg',
        badge: 'ONLY ₹349',
        subtitle: 'Not Deep Fried • No Added Sugar',
        description: 'Crunchy guilt-free air fried chips: Air Fried Ragi Chips & Air Fried Broccoli Chips.',
        itemsCount: 2,
        stock: 100
    },
    {
        id: 'combo-6',
        name: '2 Chips Combo',
        slug: '2-chips-combo',
        price: 349,
        originalPrice: 429,
        thumbnail: 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1791552421/WhatsApp_Image_2026-10-06_at_7.57.14_PM.jpg',
        badge: 'ONLY ₹349',
        subtitle: 'Not Deep Fried • No Added Sugar',
        description: 'Vibrant & healthy chips duo: Air Fried Beetroot Chips & Air Fried Broccoli Chips.',
        itemsCount: 2,
        stock: 100
    },
    {
        id: 'combo-7',
        name: '3 Cookies Combo',
        slug: '3-cookies-combo',
        price: 549,
        originalPrice: 749,
        thumbnail: 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1791552421/3_cookie_combo.jpg',
        badge: 'ONLY ₹549',
        subtitle: 'No Maida • Rich in Fibre • Baked with Care',
        description: 'Complete millet cookie trio: Classic Jowar Nutty, Premium Ragi Elaichi & Millet Honey Oats Cookies.',
        itemsCount: 3,
        stock: 100
    },
    {
        id: 'combo-8',
        name: '3 Chips Combo',
        slug: '3-chips-combo',
        price: 499,
        originalPrice: 649,
        thumbnail: 'https://res.cloudinary.com/dyf00ptkk/image/upload/v1791552421/3_chips_combo.jpg',
        badge: 'ONLY ₹499',
        subtitle: 'Not Deep Fried • No Added Sugar • Zero Trans Fat',
        description: 'The ultimate guilt-free chips trio: Air Fried Beetroot Chips, Air Fried Ragi Chips & Air Fried Broccoli Chips.',
        itemsCount: 3,
        stock: 100
    }
];

export default function LaunchOffersPage() {
    const { addToCart } = useCart();
    const [combos, setCombos] = useState<LaunchCombo[]>(LAUNCH_COMBOS);
    const [addingId, setAddingId] = useState<string | null>(null);
    const [addedId, setAddedId] = useState<string | null>(null);

    // Fetch dynamic combos if served by backend, fallback and smart-merge with verified static data
    useEffect(() => {
        const fetchCombos = async () => {
            try {
                const { data } = await api.get('/products/launch-offers');
                if (Array.isArray(data) && data.length > 0) {
                    const apiMap = new Map<string, any>();
                    data.forEach((p: any) => {
                        if (p.slug) apiMap.set(p.slug, p);
                        if (p.id) apiMap.set(p.id, p);
                    });

                    // Ensure all 8 LAUNCH_COMBOS are always preserved and enriched
                    const merged = LAUNCH_COMBOS.map((combo) => {
                        const matched = apiMap.get(combo.slug) || apiMap.get(combo.id);
                        if (!matched) return combo;
                        return {
                            ...combo,
                            id: matched.id || combo.id,
                            name: matched.name || combo.name,
                            price: matched.price ?? combo.price,
                            originalPrice: matched.originalPrice ?? combo.originalPrice,
                            thumbnail: matched.thumbnail || combo.thumbnail,
                            badge: matched.badge || matched.shortDescription || combo.badge,
                            subtitle: combo.subtitle || matched.subtitle || '',
                            description: matched.description || combo.description,
                            stock: matched.stock ?? combo.stock,
                            itemsCount: combo.itemsCount || matched.itemsCount,
                        };
                    });

                    // Append any additional offers created in backend
                    data.forEach((p: any) => {
                        const exists = merged.some((m) => m.slug === p.slug || m.id === p.id);
                        if (!exists) {
                            merged.push({
                                id: p.id,
                                name: p.name,
                                slug: p.slug,
                                price: p.price,
                                originalPrice: p.originalPrice || p.price,
                                thumbnail: p.thumbnail,
                                badge: p.badge || p.shortDescription || 'LAUNCH SPECIAL',
                                subtitle: p.description,
                                description: p.description,
                                stock: p.stock ?? 100,
                            });
                        }
                    });

                    setCombos(merged);
                }
            } catch {
                // Keep default static launch combos
            }
        };
        fetchCombos();
    }, []);

    const handleAddToCart = async (combo: LaunchCombo) => {
        setAddingId(combo.id);
        try {
            await addToCart(combo.id, combo.name, combo.thumbnail, combo.price, 1);
            setAddedId(combo.id);
            setTimeout(() => setAddedId(null), 2500);
        } finally {
            setAddingId(null);
        }
    };

    return (
        <div className="min-h-screen pt-20 sm:pt-24 pb-16" style={{ background: '#fafaf7' }}>
            {/* Header Hero Banner */}
            <div className="relative overflow-hidden mb-10 sm:mb-14" style={{ background: 'linear-gradient(135deg, #2d3e1a 0%, #475d2a 50%, #5d7a36 100%)' }}>
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                <div className="page-container relative z-10 py-10 sm:py-16 text-center text-white">
                    {/* Breadcrumb */}
                    <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-white/70 mb-4">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <span>/</span>
                        <span className="text-white font-semibold">Launch Offers</span>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-4 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-sm"
                        style={{ background: 'rgba(246,201,28,0.25)', color: '#ffe79a', border: '1px solid rgba(255,231,154,0.4)' }}>
                        <Flame className="w-4 h-4 text-[#ffd036] animate-pulse" />
                        Exclusive Launch Celebration
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-sm">
                        Special Launch Combos
                    </h1>

                    <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed font-light">
                        Handcrafted snacking combos at exclusive launch celebration prices. Authentic clean ingredients, zero refined sugar, and 100% guilt-free delight.
                    </p>

                    {/* Trust Badges */}
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 text-xs sm:text-sm text-white/80">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-[#ffd036]" />
                            <span>Limited Time Deals</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-[#ffd036]" />
                            <span>Up to 35% Savings</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-[#ffd036]" />
                            <span>100% Clean Ingredients</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Combos Grid */}
            <div className="page-container">
                <div className="flex items-center justify-between mb-6 sm:mb-8 pb-3 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-extrabold" style={{ color: '#475d2a' }}>
                            Exclusive Combo Packs
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                            Showing all {combos.length} exclusive launch celebration bundles
                        </p>
                    </div>
                    <span className="badge px-3 py-1 text-xs font-bold" style={{ background: '#f0f4ed', color: '#475d2a' }}>
                        🎁 Free Shipping over ₹499
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 lg:gap-7">
                    {combos.map((combo) => {
                        const savings = combo.originalPrice - combo.price;
                        const isAdding = addingId === combo.id;
                        const isAdded = addedId === combo.id;

                        return (
                            <div
                                key={combo.id}
                                className="card group cursor-pointer flex flex-col h-full hover:shadow-2xl transition-all duration-300 ease-out border border-gray-100/80 bg-white rounded-2xl overflow-hidden"
                            >
                                {/* Image Container */}
                                <div className="relative overflow-hidden flex-shrink-0 flex items-center justify-center bg-[#f7f8f5]" style={{ aspectRatio: '1 / 1' }}>
                                    <img
                                        src={combo.thumbnail}
                                        alt={combo.name}
                                        loading="lazy"
                                        className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                    {/* Launch Offer Badge (Printed text badge) */}
                                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                                        <span
                                            className="px-2.5 py-1 rounded-lg text-xs font-black tracking-wide shadow-md"
                                            style={{ background: '#f6c91c', color: '#1a1a1a' }}
                                        >
                                            {combo.badge}
                                        </span>
                                    </div>

                                    {/* Limited Time Tag */}
                                    <div className="absolute top-3 right-3 z-10">
                                        <span className="badge text-[11px] font-bold px-2 py-0.5 bg-black/70 text-white backdrop-blur-sm shadow-sm">
                                            ⏳ Limited Time
                                        </span>
                                    </div>

                                    {/* Savings Tag */}
                                    {savings > 0 && (
                                        <div className="absolute bottom-3 left-3 z-10">
                                            <span className="badge text-[11px] font-extrabold px-2 py-0.5" style={{ background: '#475d2a', color: '#ffffff' }}>
                                                Save ₹{savings}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Body */}
                                <div className="p-4 sm:p-5 flex flex-col flex-grow">
                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                        <span className="badge text-[10px] font-bold uppercase tracking-wider" style={{ background: '#f0f4ed', color: '#475d2a' }}>
                                            Launch Special
                                        </span>
                                        {combo.itemsCount && (
                                            <span className="text-[11px] text-gray-400 font-medium">
                                                {combo.itemsCount} Pack Bundle
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="font-extrabold text-base sm:text-lg mb-1 leading-snug line-clamp-2" style={{ color: '#2d3e1a' }}>
                                        {combo.name}
                                    </h3>

                                    {combo.subtitle && (
                                        <p className="text-xs text-gray-500 line-clamp-1 mb-2 font-medium">
                                            {combo.subtitle}
                                        </p>
                                    )}

                                    <p className="text-xs text-gray-600 line-clamp-2 mb-4 leading-relaxed flex-grow">
                                        {combo.description}
                                    </p>

                                    {/* Pricing */}
                                    <div className="flex items-baseline gap-2 mb-4 pt-3 border-t border-gray-100">
                                        <span className="text-2xl font-black" style={{ color: '#475d2a' }}>
                                            ₹{combo.price}
                                        </span>
                                        {combo.originalPrice > combo.price && (
                                            <span className="text-sm text-gray-400 line-through font-medium">
                                                ₹{combo.originalPrice}
                                            </span>
                                        )}
                                        <span className="ml-auto text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                                            Launch Deal
                                        </span>
                                    </div>

                                    {/* Add to Cart Button */}
                                    <button
                                        type="button"
                                        onClick={() => handleAddToCart(combo)}
                                        disabled={isAdding}
                                        className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#475d2a] ${
                                            isAdded
                                                ? 'bg-[#2d4a1e] text-white'
                                                : 'text-white'
                                        }`}
                                        style={{
                                            backgroundColor: isAdded ? '#2d4a1e' : '#475d2a',
                                        }}
                                    >
                                        {isAdded ? (
                                            <>
                                                <Check className="w-4 h-4 stroke-[3]" />
                                                <span>Added to Cart ✓</span>
                                            </>
                                        ) : isAdding ? (
                                            <>
                                                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                <span>Adding…</span>
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart className="w-4 h-4" />
                                                <span>Add to Cart — ₹{combo.price}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom CTA Banner */}
                <div className="mt-14 sm:mt-20 p-6 sm:p-10 rounded-3xl text-center relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #f0f4ed 0%, #e2ebd9 100%)', border: '1px solid #d5e3c8' }}>
                    <div className="max-w-2xl mx-auto relative z-10">
                        <span className="text-3xl mb-2 block">🌿</span>
                        <h3 className="text-xl sm:text-2xl font-extrabold mb-2" style={{ color: '#2d3e1a' }}>
                            Pure, Guilt-Free Snacking for Every Occasion
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
                            Every ShuddhEats combo is carefully roasted and packaged using eco-friendly materials. Zero palm oil, no artificial preservatives, and 100% natural flavour.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link href="/cart" className="btn-primary text-sm px-6 py-3 font-bold">
                                View Your Cart <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link href="/shop" className="btn-outline text-sm px-6 py-3 font-bold bg-white">
                                Explore Individual Packs
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
