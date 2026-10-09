'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Star, ArrowLeft, Shield, Leaf, Package, Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const mockProducts: any = {
    "himalayan-salt-makhana": {"name": "Himalayan Salt Makhana", "slug": "himalayan-salt-makhana", "description": "Lightly roasted makhanas seasoned with premium Himalayan pink salt for a clean and healthy snack.", "shortDescription": "Lightly roasted makhanas seasoned with premium Himalayan pink salt.", "price": 249, "originalPrice": 299, "category": "Flavoured Makhanas", "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267192/WhatsApp_Image_2026-09-21_at_2.23.25_PM.jpg", "images": ["https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267192/WhatsApp_Image_2026-09-21_at_2.23.25_PM.jpg"], "stock": 150, "weight": "100g", "ingredients": ["Fox Nuts (Makhana)", "Himalayan Pink Salt", "Cold Pressed Coconut Oil"], "nutritionFacts": {"calories": 347, "protein": 9.7, "carbs": 76.9, "fat": 0.1, "fiber": 0.5}, "tags": ["makhana", "healthy", "low-fat", "himalayan-salt"], "isFeatured": true, "isBestSeller": true, "ratings": 4.8, "numReviews": 124, "id": "1"},
    "crunchy-pepper-makhana": {"name": "Crunchy Pepper Makhana", "slug": "crunchy-pepper-makhana", "description": "Crunchy roasted makhanas seasoned with bold black pepper for a spicy, flavorful snack.", "shortDescription": "Crunchy roasted makhanas seasoned with bold black pepper.", "price": 249, "originalPrice": 299, "category": "Flavoured Makhanas", "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267193/WhatsApp_Image_2026-09-21_at_2.23.28_PM_2.jpg", "images": ["https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267193/WhatsApp_Image_2026-09-21_at_2.23.28_PM_2.jpg"], "stock": 120, "weight": "100g", "ingredients": ["Fox Nuts (Makhana)", "Black Pepper Seasoning", "Sunflower Oil", "Salt"], "nutritionFacts": {"calories": 355, "protein": 9.5, "carbs": 74.2, "fat": 2.1, "fiber": 0.5}, "tags": ["makhana", "spicy", "pepper", "crunchy-pepper"], "isFeatured": false, "isBestSeller": false, "ratings": 4.6, "numReviews": 89, "id": "2"},
    "black-pepper-makhana": {"name": "Crunchy Pepper Makhana", "slug": "crunchy-pepper-makhana", "description": "Crunchy roasted makhanas seasoned with bold black pepper for a spicy, flavorful snack.", "shortDescription": "Crunchy roasted makhanas seasoned with bold black pepper.", "price": 249, "originalPrice": 299, "category": "Flavoured Makhanas", "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267193/WhatsApp_Image_2026-09-21_at_2.23.28_PM_2.jpg", "images": ["https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267193/WhatsApp_Image_2026-09-21_at_2.23.28_PM_2.jpg"], "stock": 120, "weight": "100g", "ingredients": ["Fox Nuts (Makhana)", "Black Pepper Seasoning", "Sunflower Oil", "Salt"], "nutritionFacts": {"calories": 355, "protein": 9.5, "carbs": 74.2, "fat": 2.1, "fiber": 0.5}, "tags": ["makhana", "spicy", "pepper", "crunchy-pepper"], "isFeatured": false, "isBestSeller": false, "ratings": 4.6, "numReviews": 89, "id": "2"},
    "pudina-makhana": {"name": "Pudina Makhana", "slug": "pudina-makhana", "description": "Refreshing mint flavored makhana with aromatic pudina seasoning. Light, cooling, and perfect as an afternoon snack.", "shortDescription": "Refreshing mint flavored fox nuts.", "price": 249, "originalPrice": 299, "category": "Flavoured Makhanas", "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563590/shuddheats/products/pudina-makhana.jpg", "images": ["https://res.cloudinary.com/dyf00ptkk/image/upload/v1780563590/shuddheats/products/pudina-makhana.jpg"], "stock": 100, "weight": "100g", "ingredients": ["Fox Nuts (Makhana)", "Pudina (Mint) Seasoning", "Salt", "Cold Pressed Oil"], "nutritionFacts": {"calories": 347, "protein": 9.7, "carbs": 76.9, "fat": 0.13, "fiber": 0.5}, "tags": ["makhana", "pudina", "mint"], "isFeatured": false, "isBestSeller": false, "ratings": 4.5, "numReviews": 65, "id": "3"},
    "peri-peri-makhana": {"name": "Peri Peri Makhana", "slug": "peri-peri-makhana", "description": "Spicy and tangy peri peri flavoured makhana. Boldly seasoned with African spices for those who love a kick. Air-popped, never fried.", "shortDescription": "Spicy peri peri flavoured fox nuts.", "price": 249, "originalPrice": 299, "category": "Flavoured Makhanas", "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267192/WhatsApp_Image_2026-09-21_at_2.23.26_PM.jpg", "images": ["https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267192/WhatsApp_Image_2026-09-21_at_2.23.26_PM.jpg"], "stock": 110, "weight": "100g", "ingredients": ["Fox Nuts (Makhana)", "Peri Peri Seasoning", "Salt", "Sunflower Oil"], "nutritionFacts": {"calories": 347, "protein": 10, "carbs": 76.9, "fat": 0.28, "fiber": 0.5}, "tags": ["makhana", "peri-peri", "savory"], "isFeatured": false, "isBestSeller": true, "ratings": 4.7, "numReviews": 92, "id": "4"},
    "cream-onion-makhana": {"name": "Cream & Onion Makhana", "slug": "cream-onion-makhana", "description": "Decadent cream and onion flavor meets light, crispy makhana. A sophisticated snack for those who prefer refined taste.", "shortDescription": "Rich cream and onion flavored fox nuts.", "price": 249, "originalPrice": 299, "category": "Flavoured Makhanas", "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267197/WhatsApp_Image_2026-09-21_at_2.23.28_PM_1.jpg", "images": ["https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267197/WhatsApp_Image_2026-09-21_at_2.23.28_PM_1.jpg"], "stock": 95, "weight": "100g", "ingredients": ["Fox Nuts (Makhana)", "Cream and Onion Flavoring", "Salt", "Sunflower Oil"], "nutritionFacts": {"calories": 347, "protein": 9.7, "carbs": 76.9, "fat": 0.23, "fiber": 0.5}, "tags": ["makhana", "cream-onion", "premium"], "isFeatured": false, "isBestSeller": false, "ratings": 4.6, "numReviews": 75, "id": "5"},
    "beetroot-chips": {"name": "Beetroot Chips", "slug": "beetroot-chips", "description": "Crispy air-fried beetroot chips with just the right amount of salt. 70% less oil than regular chips. Crispy, crunchy, and completely guilt-free.", "shortDescription": "Air fried beetroot chips with minimal oil.", "price": 179, "originalPrice": 199, "category": "Air Fried Chips", "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267216/WhatsApp_Image_2026-09-21_at_2.51.41_PM.jpg", "images": ["https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267216/WhatsApp_Image_2026-09-21_at_2.51.41_PM.jpg"], "stock": 145, "weight": "120g", "ingredients": ["Beetroot", "Salt", "Sunflower Oil (minimal)"], "nutritionFacts": {"calories": 130, "protein": 2.1, "carbs": 27.8, "fat": 2.0, "fiber": 2.2}, "tags": ["chips", "beetroot", "air-fried", "healthy", "low-fat"], "isFeatured": true, "isBestSeller": true, "ratings": 4.7, "numReviews": 112, "id": "6"},
    "broccoli-chips": {"name": "Broccoli Chips", "slug": "broccoli-chips", "description": "Flavorful broccoli air-fried chips. 70% less oil than regular chips. Crispy, crunchy, and completely guilt-free.", "shortDescription": "Broccoli air-fried chips with minimal oil.", "price": 199, "originalPrice": 229, "category": "Air Fried Chips", "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1789320176/broc_chips_front.jpg", "images": ["https://res.cloudinary.com/dyf00ptkk/image/upload/v1789320176/broc_chips_front.jpg"], "stock": 135, "weight": "120g", "ingredients": ["Broccoli", "Spices", "Salt", "Sunflower Oil (minimal)"], "nutritionFacts": {"calories": 140, "protein": 2.3, "carbs": 28.5, "fat": 2.2, "fiber": 2.4}, "tags": ["chips", "broccoli", "air-fried", "healthy", "low-fat"], "isFeatured": false, "isBestSeller": true, "ratings": 4.8, "numReviews": 98, "id": "7"},
    "ragi-chips": {"name": "Ragi Chips", "slug": "ragi-chips", "description": "Perfectly salted and crispy air-fried ragi chips. 70% less oil than regular chips. Crispy, crunchy, and completely guilt-free.", "shortDescription": "Salted air-fried ragi chips with minimal oil.", "price": 179, "originalPrice": 199, "category": "Air Fried Chips", "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267215/WhatsApp_Image_2026-09-21_at_2.51.41_PM_1.jpg", "images": ["https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267215/WhatsApp_Image_2026-09-21_at_2.51.41_PM_1.jpg"], "stock": 125, "weight": "120g", "ingredients": ["Ragi", "Sea Salt", "Sunflower Oil (minimal)"], "nutritionFacts": {"calories": 130, "protein": 2.1, "carbs": 27.8, "fat": 2.0, "fiber": 2.2}, "tags": ["chips", "ragi", "air-fried", "healthy", "low-fat"], "isFeatured": false, "isBestSeller": false, "ratings": 4.6, "numReviews": 87, "id": "8"},
    "honey-oats-cookies": {"name": "Honey & Oats Cookies", "slug": "honey-oats-cookies", "description": "Delicious and nutritious honey and oats cookies with absolutely no added sugar or palm oil.", "shortDescription": "Nutritious honey oats cookies, zero sugar, no palm oil.", "price": 199, "originalPrice": 249, "category": "No Sugar No Palm Oil Millet Cookies", "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1789319726/millet_honey_front.jpg", "images": ["https://res.cloudinary.com/dyf00ptkk/image/upload/v1789319726/millet_honey_front.jpg", "https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267289/WhatsApp_Image_2026-09-24_at_3.00.20_PM_1.jpg"], "stock": 120, "weight": "120g", "ingredients": ["Oats", "Honey", "Coconut Oil", "Sea Salt", "Baking Powder"], "nutritionFacts": {"calories": 530, "protein": 5.7, "carbs": 62.4, "fat": 28.7, "fiber": 9.1}, "tags": ["cookies", "oats", "honey", "no-sugar", "no-palm-oil", "healthy"], "isFeatured": true, "isBestSeller": true, "ratings": 4.9, "numReviews": 134, "id": "9"},
    "jowar-nuts-cookies": {"name": "Jowar & Nuts Cookies", "slug": "jowar-nuts-cookies", "description": "Delicious and nutritious jowar and nuts cookies with absolutely no added sugar or palm oil.", "shortDescription": "Nutritious jowar and nuts cookies, zero sugar, no palm oil.", "price": 199, "originalPrice": 249, "category": "No Sugar No Palm Oil Millet Cookies", "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1789320106/jowar_front.jpg", "images": ["https://res.cloudinary.com/dyf00ptkk/image/upload/v1789320106/jowar_front.jpg"], "stock": 115, "weight": "120g", "ingredients": ["Jowar Flour", "Nuts", "Natural Sweetener (Stevia)", "Coconut Oil", "Sea Salt", "Baking Powder"], "nutritionFacts": {"calories": 410, "protein": 8.2, "carbs": 62.3, "fat": 14.5, "fiber": 3.1}, "tags": ["cookies", "jowar", "nuts", "no-sugar", "no-palm-oil", "healthy"], "isFeatured": false, "isBestSeller": true, "ratings": 4.8, "numReviews": 110, "id": "10"},
    "ragi-elaichi-cookies": {"name": "Ragi & Elaichi Cookies", "slug": "ragi-elaichi-cookies", "description": "Delicious and nutritious ragi and elaichi cookies with absolutely no added sugar or palm oil.", "shortDescription": "Nutritious ragi and elaichi cookies, zero sugar, no palm oil.", "price": 199, "originalPrice": 249, "category": "No Sugar No Palm Oil Millet Cookies", "thumbnail": "https://res.cloudinary.com/dyf00ptkk/image/upload/v1789319848/raji_image_front.jpg", "images": ["https://res.cloudinary.com/dyf00ptkk/image/upload/v1789319848/raji_image_front.jpg"], "stock": 125, "weight": "120g", "ingredients": ["Ragi Flour", "Elaichi", "Natural Sweetener (Stevia)", "Coconut Oil", "Sea Salt", "Baking Powder"], "nutritionFacts": {"calories": 410, "protein": 8.2, "carbs": 62.3, "fat": 14.5, "fiber": 3.1}, "tags": ["cookies", "ragi", "elaichi", "no-sugar", "no-palm-oil", "healthy"], "isFeatured": false, "isBestSeller": true, "ratings": 4.7, "numReviews": 98, "id": "11"},
};

export default function ProductDetailPage() {
    const { slug } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const { addToCart } = useCart();
    const { user, loading: authLoading } = useAuth();
    const [selectedWeight, setSelectedWeight] = useState<number>(100);
    const [selectedPackaging, setSelectedPackaging] = useState<'jar' | 'pouch'>('jar');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const touchStartXRef = useRef<number | null>(null);
    const touchEndXRef = useRef<number | null>(null);

    // Dynamic images array supporting any product with single or multiple images
    const productImages: string[] = (() => {
        if (!product) return [];
        // Honey & Oats Cookies: Image 1 is existing product image, Image 2 is WhatsApp image
        if (product.slug === 'honey-oats-cookies') {
            const img1 = product.thumbnail || (Array.isArray(product.images) && product.images[0]) || "https://res.cloudinary.com/dyf00ptkk/image/upload/v1789319726/millet_honey_front.jpg";
            return [img1, "https://res.cloudinary.com/dyf00ptkk/image/upload/v1790267289/WhatsApp_Image_2026-09-24_at_3.00.20_PM_1.jpg"];
        }
        if (Array.isArray(product.images) && product.images.length > 0) {
            return product.images;
        }
        if (typeof product.images === 'string') {
            try {
                const parsed = JSON.parse(product.images);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            } catch {
                if (product.images.trim()) return [product.images];
            }
        }
        if (product.thumbnail) return [product.thumbnail];
        if (product.image) return [product.image];
        return [];
    })();

    const hasMultipleImages = productImages.length > 1;

    // Reset current image index when product changes
    useEffect(() => {
        setCurrentImageIndex(0);
    }, [slug, product?.id]);

    const goToPrevImage = useCallback(() => {
        if (!hasMultipleImages) return;
        setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
    }, [hasMultipleImages, productImages.length]);

    const goToNextImage = useCallback(() => {
        if (!hasMultipleImages) return;
        setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
    }, [hasMultipleImages, productImages.length]);

    // Keyboard navigation support (ArrowLeft / ArrowRight)
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
                return;
            }
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                goToPrevImage();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                goToNextImage();
            }
        };

        if (hasMultipleImages) {
            window.addEventListener('keydown', handleGlobalKeyDown);
            return () => window.removeEventListener('keydown', handleGlobalKeyDown);
        }
    }, [hasMultipleImages, goToPrevImage, goToNextImage]);

    // Mobile touch swipe handling
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartXRef.current = e.touches[0].clientX;
        touchEndXRef.current = null;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndXRef.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (touchStartXRef.current === null || touchEndXRef.current === null) return;
        const diff = touchStartXRef.current - touchEndXRef.current;
        const swipeThreshold = 40;
        if (diff > swipeThreshold) {
            goToNextImage();
        } else if (diff < -swipeThreshold) {
            goToPrevImage();
        }
        touchStartXRef.current = null;
        touchEndXRef.current = null;
    };

    useEffect(() => {
        if (product) {
            const parsedWeight = parseInt(product.weight) || 100;
            setSelectedWeight(parsedWeight);
            setSelectedPackaging(parsedWeight >= 100 ? 'jar' : 'pouch');
        }
    }, [product]);

    const getDynamicPrice = () => {
        if (!product) return { price: 0, originalPrice: 0 };
        const isMakhana = product.category === 'Makhana' || product.category === 'Flavoured Makhanas' || product.name.toLowerCase().includes('makhana');
        
        if (isMakhana) {
            if (selectedWeight <= 50) {
                return { price: 99, originalPrice: 129 };
            } else if (selectedWeight === 90) {
                return { price: 199, originalPrice: 249 };
            } else {
                return { price: 249, originalPrice: 299 };
            }
        } else {
            return { price: product.price, originalPrice: product.originalPrice || (product.price + 40) };
        }
    };



    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await api.get(`/products/${slug}`);
                if (data && data.slug === 'honey-oats-cookies') {
                    data.nutritionFacts = {
                        calories: 530,
                        protein: 5.7,
                        carbs: 62.4,
                        fat: 28.7,
                        fiber: 9.1
                    };
                }
                setProduct(data);
                const rv = await api.get(`/reviews/product/${data.id}`);
                setReviews(rv.data);
            } catch (err: any) {
                // Fallback to mock products - API error is expected
                setProduct(mockProducts[slug as string] || null);
            } finally { setLoading(false); }
        };
        fetch();
    }, [slug]);

    const btnRef = useRef<HTMLButtonElement>(null);
    const [added, setAdded] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const spawnRipple = useCallback((e: React.MouseEvent) => {
        const btn = btnRef.current;
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 1.4;
        const span = document.createElement('span');
        span.style.cssText = `position:absolute;border-radius:50%;background:rgba(255,255,255,0.28);width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px;transform:scale(0);animation:cartRipple 0.6s linear forwards;pointer-events:none;z-index:3`;
        btn.appendChild(span);
        span.addEventListener('animationend', () => span.remove());
    }, []);

    const handleAddToCart = async (e: React.MouseEvent) => {
        if (!product || added || isAdding) return;
        spawnRipple(e);
        setIsAdding(true);
        try {
            const { price } = getDynamicPrice();
            await addToCart(product.id, product.name, product.thumbnail, price, qty, {
                weight: selectedWeight,
                packaging: selectedPackaging
            });
            setAdded(true);
            setTimeout(() => setAdded(false), 2400);
        } finally {
            setIsAdding(false);
        }
    };



    if (loading) return (
        <div className="min-h-screen flex items-center justify-center pt-20">
            <div className="w-12 h-12 border-4 border-[#475d2a] border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!product) return (
        <div className="min-h-screen pt-24 flex items-center justify-center flex-col gap-4">
            <div className="text-5xl">😔</div>
            <h2 className="text-xl font-bold">Product not found</h2>
            <Link href="/shop" className="btn-primary">Back to Shop</Link>
        </div>
    );

    return (
        <>
        <div className="min-h-screen pt-24 pb-16 bg-white">
            <div className="page-container">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-sm mb-8 hover:text-[#475d2a] transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Shop
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                    {/* Image Gallery */}
                    <div className="w-full flex flex-col">
                        <div
                            className="relative rounded-3xl overflow-hidden select-none focus:outline-none focus:ring-2 focus:ring-[#475d2a]"
                            style={{ aspectRatio: '1/1', background: '#f0f4ed' }}
                            tabIndex={hasMultipleImages ? 0 : undefined}
                            onKeyDown={(e) => {
                                if (!hasMultipleImages) return;
                                if (e.key === 'ArrowLeft') {
                                    e.preventDefault();
                                    goToPrevImage();
                                } else if (e.key === 'ArrowRight') {
                                    e.preventDefault();
                                    goToNextImage();
                                }
                            }}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            role="region"
                            aria-roledescription="carousel"
                            aria-label={`${product.name} gallery`}
                        >
                            {/* Slide container */}
                            <div
                                className="flex w-full h-full"
                                style={{
                                    transform: `translateX(-${currentImageIndex * 100}%)`,
                                    transition: 'transform 380ms cubic-bezier(0.25, 1, 0.5, 1)',
                                    willChange: 'transform',
                                }}
                            >
                                {productImages.map((imgSrc, idx) => (
                                    <div
                                        key={idx}
                                        className="w-full h-full flex-shrink-0 relative"
                                        style={{ minWidth: '100%', height: '100%' }}
                                    >
                                        <img
                                            src={imgSrc}
                                            alt={`${product.name} - image ${idx + 1}`}
                                            loading={idx === 0 ? 'eager' : 'lazy'}
                                            decoding={idx === 0 ? 'sync' : 'async'}
                                            draggable={false}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                objectPosition: 'center',
                                                display: 'block',
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Badge */}
                            {product.isBestSeller && (
                                <div
                                    className="absolute top-4 left-4 badge z-10 pointer-events-none"
                                    style={{ background: 'rgb(223, 196, 172)', color: '#1a1a1a' }}
                                >
                                    ⭐ Best Seller
                                </div>
                            )}

                            {/* Navigation Arrows */}
                            {hasMultipleImages && (
                                <>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            goToPrevImage();
                                        }}
                                        aria-label="Previous image"
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#475d2a]"
                                        style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.85)',
                                            backdropFilter: 'blur(8px)',
                                            WebkitBackdropFilter: 'blur(8px)',
                                            color: '#2d4a1e',
                                            border: '1px solid rgba(255, 255, 255, 0.7)',
                                        }}
                                    >
                                        <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            goToNextImage();
                                        }}
                                        aria-label="Next image"
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#475d2a]"
                                        style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.85)',
                                            backdropFilter: 'blur(8px)',
                                            WebkitBackdropFilter: 'blur(8px)',
                                            color: '#2d4a1e',
                                            border: '1px solid rgba(255, 255, 255, 0.7)',
                                        }}
                                    >
                                        <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Dot Indicators */}
                        {hasMultipleImages && (
                            <div
                                className="flex items-center justify-center gap-2 mt-4"
                                role="tablist"
                                aria-label="Image indicators"
                            >
                                {productImages.map((_, idx) => {
                                    const isActive = currentImageIndex === idx;
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            role="tab"
                                            aria-selected={isActive}
                                            aria-label={`Go to image ${idx + 1} of ${productImages.length}`}
                                            onClick={() => setCurrentImageIndex(idx)}
                                            className={`transition-all duration-300 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#475d2a] ${
                                                isActive
                                                    ? 'w-6 h-2.5 bg-[#475d2a]'
                                                    : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'
                                            }`}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div>
                        <span className="badge badge-primary mb-3">{product.category}</span>
                        <h1 className="text-3xl font-extrabold mb-2" style={{ color: '#475d2a' }}>{product.name}</h1>
                        <div className="flex items-center gap-2 mb-4">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < Math.round(product.ratings) ? 'fill-[rgb(223, 196, 172)] text-[rgb(223, 196, 172)]' : 'text-gray-300'}`} />
                            ))}
                            <span className="text-sm text-gray-500">({product.numReviews} reviews)</span>
                        </div>
                        <div className="flex items-baseline gap-3 mb-6">
                            <span className="text-4xl font-extrabold" style={{ color: '#475d2a' }}>₹{getDynamicPrice().price}</span>
                        </div>
                        <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

                        {/* Weight Selection */}
                        <div className="mb-6">
                            <span className="font-semibold text-sm block mb-3 text-gray-700">Select Weight:</span>
                            <div className="flex flex-wrap gap-2.5">
                                {(product.category?.includes('Makhana') || product.name?.toLowerCase().includes('makhana') ? [50, 90] : [120]).map((w) => {
                                    const displayWeight = w;
                                    const isSelected = selectedWeight === displayWeight;
                                    return (
                                        <button
                                            key={w}
                                            onClick={() => {
                                                setSelectedWeight(displayWeight);
                                                setSelectedPackaging(displayWeight >= 100 ? 'jar' : 'pouch');
                                            }}
                                            className={`py-2.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 border-2 flex items-center gap-1.5 ${
                                                isSelected
                                                    ? 'border-[#475d2a] text-white'
                                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                            }`}
                                            style={isSelected ? { background: '#475d2a', borderColor: '#475d2a' } : {}}
                                        >
                                            {displayWeight}g
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="flex items-center gap-4 mb-6">
                            <span className="font-semibold text-sm">Quantity:</span>
                            <div className="flex items-center border-2 border-[#f0f4ed] rounded-xl overflow-hidden">
                                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-3 hover:bg-[#f0f4ed] transition-colors"><Minus className="w-4 h-4" /></button>
                                <span className="px-4 font-bold text-lg min-w-[2.5rem] text-center">{qty}</span>
                                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-4 py-3 hover:bg-[#f0f4ed] transition-colors"><Plus className="w-4 h-4" /></button>
                            </div>
                            <span className="text-sm text-gray-400">{product.stock} in stock</span>
                        </div>

                        {/* ── Premium animated Add to Cart button ── */}
                        <button
                            ref={btnRef}
                            onClick={handleAddToCart}
                            disabled={!product || product.stock === 0}
                            aria-label="Add to cart"
                            style={{
                                position: 'relative',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                width: '100%',
                                border: '2px solid #2d4a1e',
                                borderRadius: '9999px',
                                background: added ? '#2d4a1e' : '#ffffff',
                                color: added ? '#ffffff' : '#2d4a1e',
                                padding: '16px 32px',
                                fontSize: '15px',
                                fontWeight: 700,
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                                cursor: (!product || product.stock === 0) ? 'not-allowed' : 'pointer',
                                opacity: (!product || product.stock === 0) ? 0.45 : 1,
                                transition: 'color 0.44s cubic-bezier(0.4,0,0.2,1), box-shadow 0.44s cubic-bezier(0.4,0,0.2,1), transform 0.18s cubic-bezier(0.4,0,0.2,1)',
                                boxShadow: added ? '0 8px 28px rgba(45,74,30,0.30)' : 'none',
                                marginBottom: '16px',
                            }}
                            onMouseEnter={e => {
                                if (!added) {
                                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 28px rgba(45,74,30,0.22)';
                                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!added) {
                                    (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                                    (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                                }
                            }}
                        >
                            {/* Slide fill */}
                            <span style={{
                                position: 'absolute', inset: 0,
                                background: '#2d4a1e',
                                borderRadius: '9999px',
                                transform: added ? 'translateX(0)' : 'translateX(-105%)',
                                transition: 'transform 0.48s cubic-bezier(0.4,0,0.2,1)',
                                zIndex: 0,
                            }} />
                            {/* Cart icon */}
                            {!added && (
                                <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, position: 'relative', zIndex: 1, stroke: 'currentColor', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', flexShrink: 0 }}>
                                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                                    <line x1="3" y1="6" x2="21" y2="6"/>
                                    <path d="M16 10a4 4 0 0 1-8 0"/>
                                </svg>
                            )}
                            {/* Check icon */}
                            {added && (
                                <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, position: 'relative', zIndex: 1, stroke: '#fff', fill: 'none', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round', flexShrink: 0 }}>
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                            )}
                            <span style={{ position: 'relative', zIndex: 1 }}>
                                {added
                                    ? `Added to Cart ✓`
                                    : isAdding
                                    ? 'Adding…'
                                    : `Add to Cart — ₹${getDynamicPrice().price * qty}`}
                            </span>
                        </button>
                        <style>{`@keyframes cartRipple { to { transform: scale(4); opacity: 0; } }`}</style>
                        <Link href="/cart" className="btn-outline w-full justify-center py-4 block text-center">View Cart</Link>

                        {/* Trust badges */}
                        <div className="grid grid-cols-3 gap-3 mt-6">
                            {[
                                { Icon: Leaf, label: 'Clean Ingredients' },
                                { Icon: Shield, label: 'Quality Assured' },
                                { Icon: Package, label: 'Eco Packaging' },
                            ].map(({ Icon, label }) => (
                                <div key={label} className="flex flex-col items-center gap-1 p-3 rounded-xl text-center" style={{ background: '#f0f4ed' }}>
                                    <Icon className="w-5 h-5" style={{ color: '#475d2a' }} />
                                    <span className="text-xs font-medium" style={{ color: '#475d2a' }}>{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div>
                    <div className="flex gap-2 mb-8 border-b border-gray-100">
                        {['description', 'nutrition', 'ingredients', 'reviews'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`px-5 py-3 text-sm font-semibold capitalize transition-all border-b-2 -mb-px ${activeTab === tab ? 'border-[#475d2a] text-[#475d2a]' : 'border-transparent text-gray-400'}`}>
                                {tab === 'reviews' ? `Reviews (${reviews.length})` : tab}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'description' && (
                        <p className="text-gray-600 leading-relaxed max-w-2xl">{product.description}</p>
                    )}
                    {activeTab === 'nutrition' && product.nutritionFacts && (
                        <div className="max-w-sm">
                            <h3 className="font-bold text-lg mb-4" style={{ color: '#475d2a' }}>Nutrition Facts (per 100g)</h3>
                            <div className="divide-y border border-gray-100 rounded-xl overflow-hidden">
                                {Object.entries(product.nutritionFacts).map(([k, v]) => (
                                    <div key={k} className="flex justify-between px-4 py-3 odd:bg-[#f9fbf7]">
                                        <span className="font-medium capitalize">{k}</span>
                                        <span className="text-gray-600">{v as string}{k === 'calories' ? ' kcal' : 'g'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'ingredients' && product.ingredients && (
                        <div className="flex flex-wrap gap-3">
                            {product.ingredients.map((ing: string) => (
                                <span key={ing} className="badge badge-primary px-4 py-2">{ing}</span>
                            ))}
                        </div>
                    )}
                    {activeTab === 'reviews' && (
                        <div>
                            {reviews.length === 0 ? (
                                <p className="text-gray-400">No reviews yet. Be the first to review!</p>
                            ) : (
                                <div className="space-y-4 mb-8">
                                    {reviews.map((r: any) => (
                                        <div key={r.id} className="card p-5">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm" style={{ background: '#475d2a' }}>
                                                    {r.name?.[0] || 'U'}
                                                </div>
                                                <span className="font-semibold">{r.name}</span>
                                                <div className="flex ml-auto">
                                                    {[...Array(r.rating)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-[rgb(223, 196, 172)] text-[rgb(223, 196, 172)]" />)}
                                                </div>
                                            </div>
                                            <p className="text-gray-600 text-sm">{r.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {user && (
                                <div className="card p-6 mt-4">
                                    <h4 className="font-bold mb-4" style={{ color: '#475d2a' }}>Write a Review</h4>
                                    <div className="flex gap-2 mb-4">
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <button key={n} onClick={() => setReviewForm(f => ({ ...f, rating: n }))}>
                                                <Star className={`w-6 h-6 ${n <= reviewForm.rating ? 'fill-[rgb(223, 196, 172)] text-[rgb(223, 196, 172)]' : 'text-gray-300'}`} />
                                            </button>
                                        ))}
                                    </div>
                                    <textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                                        placeholder="Share your experience..." rows={3} className="input-field mb-3 resize-none" />
                                    <button onClick={async () => {
                                        try {
                                            await api.post('/reviews', { productId: product.id, rating: reviewForm.rating, comment: reviewForm.comment });
                                            const rv = await api.get(`/reviews/product/${product.id}`);
                                            setReviews(rv.data);
                                            setReviewForm({ rating: 5, comment: '' });
                                        } catch (err: any) { alert(err.response?.data?.message || 'Error submitting review'); }
                                    }} className="btn-primary">Submit Review</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
        </>
    );
}
