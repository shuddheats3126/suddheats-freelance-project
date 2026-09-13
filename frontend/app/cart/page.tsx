'use client';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package } from 'lucide-react';

export default function CartPage() {
    const { items, totalItems, subtotal, removeFromCart, updateQuantity, updateItemOptions } = useCart();
    const shipping = subtotal > 499 ? 0 : 49;
    const total = subtotal + shipping;

    const getDynamicPrice = (itemName: string, weight: number, currentPrice: number, currentWeight: number) => {
        const name = itemName.toLowerCase();
        const isMakhana = name.includes('makhana');
        
        if (isMakhana) {
            if (weight <= 50) return 99;
            if (weight === 90) return 199;
            return 249;
        } else {
            let basePrice = currentPrice;
            return basePrice;
        }
    };

    if (items.length === 0) return (
        <div className="min-h-screen pt-24 flex items-center justify-center bg-white">
            <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: '#f0f4ed' }}>
                    <ShoppingCart className="w-12 h-12" style={{ color: '#475d2a' }} />
                </div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#475d2a' }}>Your cart is empty</h2>
                <p className="text-gray-500 mb-8">Looks like you haven't added any snacks yet!</p>
                <Link href="/shop" className="btn-primary">Start Shopping <ArrowRight className="w-4 h-4" /></Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen pt-24 pb-16" style={{ background: '#fafaf7' }}>
            <div className="page-container">
                <h1 className="section-title mb-6 sm:mb-8">Your Cart ({totalItems} items)</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Items */}
                    <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                        {items.map((item, index) => (
                            <div key={`${item.product}-${item.weight}-${item.packaging}-${index}`} className="card p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center">
                                <img src={item.image} alt={item.name} className="w-24 h-24 sm:w-20 sm:h-20 object-cover rounded-lg sm:rounded-xl shrink-0 animate-scaleIn" />
                                <div className="flex-1 min-w-0 w-full">
                                    <h3 className="font-bold text-sm sm:text-base line-clamp-2" style={{ color: '#475d2a' }}>{item.name}</h3>
                                    
                                    {/* Inline Interactive Options */}
                                    <div className="flex flex-col gap-2.5 mt-2.5 mb-3 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Weight:</span>
                                            <div className="flex gap-2">
                                                {(item.name.toLowerCase().includes('makhana') ? [50, 90] : [120]).map((w) => {
                                                    const displayWeight = w;
                                                    const isSelected = item.weight === displayWeight;
                                                    return (
                                                        <button
                                                            key={w}
                                                            onClick={async () => {
                                                                const packaging = displayWeight >= 100 ? 'jar' : 'pouch';
                                                                const price = getDynamicPrice(item.name, displayWeight, item.price, item.weight || 100);
                                                                await updateItemOptions(item.product, displayWeight, packaging, price);
                                                            }}
                                                            className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all border ${
                                                                isSelected
                                                                    ? 'bg-[#475d2a] border-[#475d2a] text-white shadow-sm'
                                                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                                            }`}
                                                        >
                                                            {displayWeight}g
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                            <span>Packaging:</span>
                                            <span className="font-bold" style={{ color: '#475d2a' }}>
                                                {item.packaging === 'jar' ? '🏺 Glass Jar' : '📦 Eco Pouch'}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-base sm:text-lg font-extrabold mt-2 sm:mt-1" style={{ color: '#475d2a' }}>₹{item.price}</p>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <button onClick={() => updateQuantity(item.product, item.quantity - 1)}
                                        className="w-10 h-10 sm:w-9 sm:h-9 border-2 border-[#f0f4ed] rounded-lg flex items-center justify-center hover:bg-[#f0f4ed] transition-colors flex-shrink-0">
                                        <Minus className="w-4 h-4 sm:w-3 sm:h-3" />
                                    </button>
                                    <span className="font-bold w-8 text-center text-sm">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.product, item.quantity + 1)}
                                        className="w-10 h-10 sm:w-9 sm:h-9 border-2 border-[#f0f4ed] rounded-lg flex items-center justify-center hover:bg-[#f0f4ed] transition-colors flex-shrink-0">
                                        <Plus className="w-4 h-4 sm:w-3 sm:h-3" />
                                    </button>
                                    <div className="ml-auto sm:ml-4 text-right">
                                        <p className="font-bold text-sm sm:text-base" style={{ color: '#475d2a' }}>₹{item.price * item.quantity}</p>
                                        <button onClick={() => removeFromCart(item.product)} className="text-red-400 hover:text-red-600 mt-1 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary - Reordered on mobile */}
                    <div className="card p-4 sm:p-6 h-fit lg:sticky lg:top-28 order-first lg:order-last">
                        <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6" style={{ color: '#475d2a' }}>Order Summary</h2>
                        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                            <div className="flex justify-between text-xs sm:text-sm"><span className="text-gray-500">Subtotal</span><span>₹{subtotal}</span></div>
                            <div className="flex justify-between text-xs sm:text-sm">
                                <span className="text-gray-500">Shipping</span>
                                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                                    {shipping === 0 ? 'FREE 🎉' : `₹${shipping}`}
                                </span>
                            </div>
                            {subtotal < 499 && <p className="text-xs text-gray-400">Add ₹{499 - subtotal} more for free shipping!</p>}
                            <div className="border-t border-gray-100 pt-2 sm:pt-3 flex justify-between font-bold text-base sm:text-lg">
                                <span>Total</span><span style={{ color: '#475d2a' }}>₹{total}</span>
                            </div>
                        </div>
                        <Link href="/checkout" className="btn-accent w-full justify-center mb-2 sm:mb-3 py-3 sm:py-4 block text-center font-bold text-sm sm:text-base">
                            Proceed to Checkout <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Link>
                        <Link href="/shop" className="btn-outline w-full justify-center block text-center py-2.5 sm:py-3 text-sm sm:text-base">Continue Shopping</Link>
                        <div className="flex items-center gap-2 mt-3 sm:mt-4 text-xs text-gray-400 justify-center">
                            <Package className="w-3.5 h-3.5 flex-shrink-0" /> Free returns within 7 days
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
