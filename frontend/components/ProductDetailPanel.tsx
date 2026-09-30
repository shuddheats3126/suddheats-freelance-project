'use client';
import { useState, useEffect, useRef } from 'react';
import { X, Check, ShoppingCart, Heart, Plus, Minus } from 'lucide-react';
import { toast } from 'react-hot-toast';
// @ts-ignore
import confetti from 'canvas-confetti';

interface ProductOption {
  weight: number;
  packaging: 'jar' | 'pouch';
}

interface ProductDetailPanelProps {
  isOpen: boolean;
  productName: string;
  onClose: () => void;
  onConfirm: (option: ProductOption) => void;
  weight?: number;
  onCartOpen?: () => void;
  productImage?: string;
  price?: number;
  originalPrice?: number;
  rating?: number;
  numReviews?: number;
  description?: string;
}

export default function ProductDetailPanel({
  isOpen,
  productName,
  onClose,
  onConfirm,
  weight,
  onCartOpen,
  productImage,
  price,
  originalPrice,
  rating = 4.5,
  numReviews = 0,
  description,
}: ProductDetailPanelProps) {
  const [selectedWeight, setSelectedWeight] = useState(weight || 100);
  const [selectedPackaging, setSelectedPackaging] = useState<'jar' | 'pouch'>('pouch');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const sizeOptions = [35, 75, 100];

  const getPackagingOptions = () => {
    const baseOptions = [
      { value: 'pouch', label: '📦 Pouch', description: 'Eco-friendly packaging' },
    ];
    if (selectedWeight === 100) {
      baseOptions.push({ value: 'jar', label: '🏺 Jar', description: 'Premium glass jar' });
    }
    return baseOptions;
  };

  // Open/Close animation and scroll lock
  useEffect(() => {
    if (isOpen) {
      setIsAnimatingIn(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimatingIn(false);
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Auto-switch packaging based on weight
  useEffect(() => {
    if (selectedWeight !== 100 && selectedPackaging === 'jar') {
      setSelectedPackaging('pouch');
    }
  }, [selectedWeight, selectedPackaging]);

  const triggerConfetti = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    confetti({
      particleCount: 50,
      spread: 50,
      origin: {
        x: rect.left + rect.width / 2 / window.innerWidth,
        y: rect.top + rect.height / 2 / window.innerHeight,
      },
      colors: ['#475d2a', '#dfc4ac', '#f0f4ed'],
    });
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      triggerConfetti();
      // Add multiple quantities
      for (let i = 0; i < quantity; i++) {
        onConfirm({
          weight: selectedWeight,
          packaging: selectedPackaging as 'jar' | 'pouch',
        });
      }
      toast.success(`✨ Added ${quantity} item${quantity > 1 ? 's' : ''} to Cart!`, {
        duration: 2000,
        icon: '🛒',
        style: {
          background: '#475d2a',
          color: 'white',
          borderRadius: '8px',
          padding: '12px 16px',
          fontWeight: '600',
        },
      });
      setTimeout(() => {
        onClose();
        onCartOpen?.();
        setIsLoading(false);
        setQuantity(1);
      }, 500);
    } catch (error) {
      setIsLoading(false);
      toast.error('Failed to add to cart');
    }
  };

  const discount = originalPrice && price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - Visible only on mobile */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 lg:hidden ${
          isAnimatingIn ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none'
        }`}
        onClick={onClose}
      />

      {/* Desktop Backdrop - Subtle */}
      <div
        className={`hidden lg:block fixed inset-0 z-40 transition-all duration-300 ${
          isAnimatingIn ? 'bg-black/20' : 'bg-black/0'
        }`}
        onClick={onClose}
      />

      {/* Panel - Right Slide on Desktop, Bottom Sheet on Mobile */}
      <div
        className={`fixed bottom-0 right-0 z-50 w-full lg:w-[420px] lg:top-0 lg:bottom-auto bg-white flex flex-col max-h-[90vh] transition-all duration-300 ease-out
          ${isAnimatingIn
            ? 'lg:translate-x-0 translate-y-0'
            : 'lg:translate-x-full translate-y-full'
          }
          rounded-t-3xl lg:rounded-none shadow-2xl lg:shadow-xl
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed at Top */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold truncate" style={{ color: '#475d2a' }}>
              {productName}
            </h2>
            {rating && (
              <div className="flex items-center gap-1 mt-1">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={`text-xs ${i < Math.round(rating) ? '⭐' : '☆'}`} />
                  ))}
                </div>
                <span className="text-xs text-gray-500">({numReviews})</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content - Only This Scrolls */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5" style={{ WebkitOverflowScrolling: 'touch' }}>
          {/* Product Image */}
          {productImage && (
            <div
              className="rounded-2xl flex items-center justify-center overflow-hidden w-full h-48 sm:h-56"
              style={{ background: 'linear-gradient(135deg, #f0f4ed 0%, #e8f5e9 100%)' }}
            >
              <img
                src={productImage}
                alt={productName}
                className="h-full w-full object-contain"
              />
            </div>
          )}

          {/* Price Section */}
          {price && (
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold" style={{ color: '#475d2a' }}>
                  ₹{price}
                </span>
                {originalPrice && (
                  <span className="text-lg text-gray-400 line-through">₹{originalPrice}</span>
                )}
              </div>
              {discount && (
                <div className="inline-block px-3 py-1 rounded-lg text-sm font-bold text-white" style={{ background: '#475d2a' }}>
                  {discount}% OFF
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {description && (
            <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
          )}

          {/* Size Selection */}
          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: '#475d2a' }}>
              📏 Select Size
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {sizeOptions.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedWeight(size)}
                  className={`py-3 px-2 rounded-lg font-bold text-sm transition-all duration-200 border-2 ${
                    selectedWeight === size
                      ? 'border-[#475d2a] text-white'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                  style={
                    selectedWeight === size
                      ? { background: '#475d2a', borderColor: '#475d2a' }
                      : {}
                  }
                >
                  {size}g
                </button>
              ))}
            </div>
          </div>

          {/* Packaging Selection */}
          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: '#475d2a' }}>
              📦 Packaging
            </h3>
            <div className="space-y-2">
              {getPackagingOptions().map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedPackaging(option.value as 'jar' | 'pouch')}
                  className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left flex items-center justify-between ${
                    selectedPackaging === option.value
                      ? 'border-[#475d2a]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={
                    selectedPackaging === option.value
                      ? { background: '#f0f4ed' }
                      : {}
                  }
                >
                  <div>
                    <div className="font-bold text-sm" style={{ color: '#475d2a' }}>
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                  {selectedPackaging === option.value && (
                    <Check className="w-5 h-5" style={{ color: '#475d2a' }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div>
            <h3 className="text-sm font-bold mb-3" style={{ color: '#475d2a' }}>
              <span>🛒</span> Quantity
            </h3>
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#f0f4ed' }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-white rounded-lg transition-colors"
                title="Decrease"
              >
                <Minus className="w-5 h-5" style={{ color: '#475d2a' }} />
              </button>
              <span
                className="flex-1 text-center text-xl font-bold py-2"
                style={{ color: '#475d2a' }}
              >
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 hover:bg-white rounded-lg transition-colors"
                title="Increase"
              >
                <Plus className="w-5 h-5" style={{ color: '#475d2a' }} />
              </button>
            </div>
          </div>

          {/* Extra spacing for scrollable content */}
          <div className="h-4" />
        </div>

        {/* Fixed Footer - Action Buttons */}
        <div
          className="flex-shrink-0 border-t border-gray-100 px-5 py-4 space-y-3 bg-white"
          style={{ boxShadow: '0 -3px 12px rgba(0, 0, 0, 0.08)' }}
        >
          {/* Add to Cart Button */}
          <button
            ref={buttonRef}
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl font-bold text-white text-base transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              background: isLoading ? '#999' : '#475d2a',
              opacity: isLoading ? 0.8 : 1,
            }}
          >
            <ShoppingCart className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Adding...' : 'Add to Cart'}</span>
          </button>

          {/* Wishlist Button */}
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="w-full py-3 px-4 rounded-xl font-bold border-2 transition-all duration-200 flex items-center justify-center gap-2"
            style={{
              borderColor: isWishlisted ? '#475d2a' : '#e5e7eb',
              color: isWishlisted ? '#475d2a' : '#999',
              background: isWishlisted ? '#f0f4ed' : 'transparent',
            }}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            <span>{isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
          </button>
        </div>
      </div>
    </>
  );
}

