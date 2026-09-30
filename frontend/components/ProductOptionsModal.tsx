'use client';
import { useState, useEffect, useRef } from 'react';
import { X, ShoppingCart } from 'lucide-react';
import { toast } from 'react-hot-toast';
// @ts-ignore
import confetti from 'canvas-confetti';

interface ProductOption {
  weight: number;
  packaging: 'jar' | 'pouch';
  quantity: number;
}

interface ProductOptionsModalProps {
  isOpen: boolean;
  productName: string;
  onClose: () => void;
  onConfirm: (option: ProductOption) => void;
  weight?: number;
  onCartOpen?: () => void;
  productImage?: string;
  price?: number;
  productId?: string;
}

export default function ProductOptionsModal({
  isOpen,
  productName,
  onClose,
  onConfirm,
  weight,
  onCartOpen,
  productImage,
  price,
  productId = 'default',
}: ProductOptionsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
      onConfirm({
        weight: weight || 100,
        packaging: 'pouch',
        quantity: 1,
      });
      toast.success('✨ Added to Cart!', {
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
      }, 400);
    } catch (error) {
      setIsLoading(false);
      toast.error('Failed to add to cart');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${
          isAnimatingIn ? 'bg-black/30 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none'
        }`}
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 transition-all duration-300 ease-out ${
          isAnimatingIn ? 'translate-y-0' : 'translate-y-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-t-3xl max-w-2xl mx-auto w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold" style={{ color: '#475d2a' }}>
              {productName}
            </h2>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 flex flex-col items-center justify-center" style={{ WebkitOverflowScrolling: 'touch' }}>
            {/* Product Image */}
            {productImage && (
              <div
                className="rounded-2xl flex items-center justify-center overflow-hidden w-full h-48"
                style={{ background: 'linear-gradient(135deg, #f0f4ed 0%, #e8f5e9 100%)' }}
              >
                <img
                  src={productImage}
                  alt={productName}
                  className="h-full w-full object-contain"
                />
              </div>
            )}

            {/* Price */}
            {price && (
              <div className="flex items-baseline justify-between px-4 py-3 rounded-xl" style={{ background: '#f0f4ed' }}>
                <span className="text-sm text-gray-600">Price</span>
                <span className="text-3xl font-bold" style={{ color: '#475d2a' }}>
                  ₹{price}
                </span>
              </div>
            )}

            {/* Confirmation Message */}
            <div className="text-center py-6">
              <p className="text-gray-600 mb-2">Ready to add this item to your cart?</p>
              <p className="text-sm text-gray-500">{productName}</p>
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex-shrink-0 border-t border-gray-100 px-5 py-4 flex gap-3"
            style={{ boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.06)' }}
          >
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-lg font-bold text-gray-700 text-base transition-all duration-200 border-2 border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              ref={buttonRef}
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded-lg font-bold text-white text-base transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: isLoading ? '#ccc' : '#475d2a',
              }}
            >
              <ShoppingCart className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Adding...' : 'Add to Cart'}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

