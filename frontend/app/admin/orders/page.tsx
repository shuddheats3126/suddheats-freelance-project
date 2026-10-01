'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { 
    ArrowLeft, X, User, Phone, MapPin, Calendar, Clock, 
    CreditCard, ShoppingBag, Receipt, CheckCircle, AlertTriangle, 
    Search, RefreshCw, Hash, Tag, Truck
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

const STATUSES = ['Pending', 'PLACED', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'FAILED'];
const STATUS_COLORS: any = { 
    Pending: '#fef3c7', 
    PLACED: '#ffedd5', 
    Processing: '#dbeafe', 
    Shipped: '#e0ffe0', 
    'Out for Delivery': '#f3e8ff', 
    Delivered: '#d1fae5', 
    Cancelled: '#fee2e2',
    FAILED: '#fee2e2',
    Failed: '#fee2e2'
};
const STATUS_TEXT: any = { 
    Pending: '#92400e', 
    PLACED: '#c2410c', 
    Processing: '#1e40af', 
    Shipped: '#166534', 
    'Out for Delivery': '#6b21a8', 
    Delivered: '#065f46', 
    Cancelled: '#991b1b',
    FAILED: '#991b1b',
    Failed: '#991b1b'
};

function CustomerDetailsModal({ order, onClose }: { order: any; onClose: () => void }) {
    const addr = order.shippingAddress || {};
    const orderDate = new Date(order.createdAt);
    const updatedDate = order.updatedAt ? new Date(order.updatedAt) : null;
    const items = Array.isArray(order.items) ? order.items : [];
    const payment = order.payment || {};

    const transactionId = order.transactionId || payment.transactionId || order.trackingId;
    const cashfreeOrderId = order.cashfreeOrderId || payment.cashfreeOrderId;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.55)' }} onClick={onClose}>
            <div className="relative w-full max-w-2xl my-auto rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" style={{ background: '#fff', border: '2px solid #f0f4ed' }} onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div className="flex items-center justify-between px-5 sm:px-6 py-4 shrink-0" style={{ background: '#475d2a' }}>
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-white" />
                        <span className="font-bold text-white text-base sm:text-lg">Order & Customer Details</span>
                    </div>
                    <button onClick={onClose} className="text-white hover:opacity-75 transition-opacity p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Order ID & Status Strip */}
                <div className="px-5 sm:px-6 py-2.5 text-xs font-mono font-bold flex items-center justify-between flex-wrap gap-2 shrink-0" style={{ background: '#f0f4ed', color: '#475d2a' }}>
                    <div className="flex items-center gap-2">
                        <Hash className="w-3.5 h-3.5" />
                        <span>Order ID: <strong className="font-mono">{order.id}</strong></span>
                    </div>
                    <span className="badge text-xs px-2.5 py-0.5" style={{ background: STATUS_COLORS[order.status] || '#f3f4f6', color: STATUS_TEXT[order.status] || '#374151' }}>
                        {order.status}
                    </span>
                </div>

                {/* Modal Scrollable Body */}
                <div className="px-5 sm:px-6 py-5 space-y-6 overflow-y-auto">
                    
                    {/* Section 1: Customer Information */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" style={{ color: '#475d2a' }} /> Customer Information
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Full Name</p>
                                <p className="font-bold text-sm" style={{ color: '#475d2a' }}>{addr.fullName || order.user?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Email Address</p>
                                <p className="font-semibold text-sm text-gray-700 break-all">{order.user?.email || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Phone Number</p>
                                <p className="font-semibold text-sm text-gray-700">{addr.phone || order.user?.phone || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Customer ID</p>
                                <p className="font-mono text-xs text-gray-500">{order.user?.id || order.userId || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Delivery Information */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" style={{ color: '#475d2a' }} /> Delivery Information
                        </h4>
                        <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Address Line 1</p>
                                <p className="font-semibold text-sm text-gray-700">{addr.addressLine1 || 'N/A'}</p>
                            </div>
                            {addr.addressLine2 && (
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">Address Line 2</p>
                                    <p className="text-sm text-gray-600">{addr.addressLine2}</p>
                                </div>
                            )}
                            {addr.landmark && (
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">Landmark</p>
                                    <p className="text-sm text-gray-600">{addr.landmark}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-100">
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">City</p>
                                    <p className="font-semibold text-xs sm:text-sm text-gray-700">{addr.city || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">State</p>
                                    <p className="font-semibold text-xs sm:text-sm text-gray-700">{addr.state || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">PIN Code</p>
                                    <p className="font-bold text-xs sm:text-sm" style={{ color: '#475d2a' }}>{addr.pincode || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Products Ordered */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5" style={{ color: '#475d2a' }} /> Products Ordered ({items.length})
                        </h4>
                        <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden bg-white">
                            {items.length === 0 ? (
                                <p className="text-xs text-gray-400 p-4 text-center">No item records available</p>
                            ) : (
                                items.map((item: any, idx: number) => {
                                    const itemPrice = Number(item.price || 0);
                                    const itemQty = Number(item.quantity || 1);
                                    const itemSubtotal = itemPrice * itemQty;
                                    return (
                                        <div key={idx} className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors">
                                            {item.image ? (
                                                <img 
                                                    src={item.image} 
                                                    alt={item.name} 
                                                    className="w-12 h-12 rounded-lg object-cover shrink-0 bg-gray-50 border border-gray-200"
                                                    onError={(e: any) => { e.target.style.display = 'none'; }}
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs" style={{ background: '#f0f4ed', color: '#475d2a' }}>
                                                    {item.name ? item.name.charAt(0) : 'P'}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm text-gray-800 line-clamp-1">{item.name || 'Unnamed Product'}</p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 flex-wrap">
                                                    {item.variant && item.variant !== 'Standard' && (
                                                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[11px] font-medium">{item.variant}</span>
                                                    )}
                                                    <span>Qty: <strong>{itemQty}</strong></span>
                                                    <span>×</span>
                                                    <span>₹{itemPrice}</span>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="font-extrabold text-sm" style={{ color: '#475d2a' }}>₹{itemSubtotal}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Section 4: Pricing Breakdown */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                            <Receipt className="w-3.5 h-3.5" style={{ color: '#475d2a' }} /> Pricing Breakdown
                        </h4>
                        <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Product Total:</span>
                                <span className="font-semibold text-gray-800">₹{order.itemsPrice ?? (order.totalPrice - (order.shippingPrice || 0))}</span>
                            </div>
                            {Number(order.discount || 0) > 0 && (
                                <div className="flex justify-between text-green-700">
                                    <span>Discount Applied:</span>
                                    <span className="font-semibold">-₹{order.discount}</span>
                                </div>
                            )}
                            {order.coupon && (
                                <div className="flex justify-between text-green-700">
                                    <span>Coupon Used:</span>
                                    <span className="font-mono font-bold text-xs bg-green-100 px-2 py-0.5 rounded">{order.coupon}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-600">
                                <span>Delivery Charges:</span>
                                <span className="font-semibold text-gray-800">
                                    {(order.shippingPrice === 0 || !order.shippingPrice) ? 'Free' : `₹${order.shippingPrice}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-base font-extrabold pt-2 border-t border-gray-200" style={{ color: '#475d2a' }}>
                                <span>Final Amount:</span>
                                <span>₹{order.totalPrice}</span>
                            </div>
                        </div>
                    </div>

                    {/* Section 5: Payment & Order Metadata */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5" style={{ color: '#475d2a' }} /> Payment & Transaction
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-sm">
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Payment Status</p>
                                <span className={`inline-block font-bold text-xs px-2.5 py-0.5 rounded-full mt-1 ${order.isPaid ? 'bg-green-100 text-green-800' : (order.paymentMethod === 'COD' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800')}`}>
                                    {payment.status || (order.isPaid ? 'Paid' : (order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Unpaid'))}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Payment Method</p>
                                <p className="font-semibold text-gray-800 mt-1">{order.paymentMethod || 'Online'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Cashfree Transaction ID</p>
                                <p className="font-mono text-xs text-gray-700 mt-1 break-all">{transactionId || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Cashfree Order ID</p>
                                <p className="font-mono text-xs text-gray-700 mt-1 break-all">{cashfreeOrderId || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Created Date</p>
                                <p className="text-xs text-gray-700 mt-1 flex items-center gap-1 font-medium">
                                    <Calendar className="w-3 h-3 text-gray-400" />
                                    {orderDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at {orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Last Updated</p>
                                <p className="text-xs text-gray-700 mt-1 flex items-center gap-1 font-medium">
                                    <Clock className="w-3 h-3 text-gray-400" />
                                    {updatedDate ? `${updatedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at ${updatedDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}` : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="px-5 sm:px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end shrink-0">
                    <button 
                        onClick={onClose} 
                        className="px-6 py-2 rounded-xl font-bold text-sm transition-all hover:opacity-90" 
                        style={{ background: '#475d2a', color: 'white' }}>
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AdminOrdersPage() {
    const { user, isAdmin, loading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [fetching, setFetching] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    useEffect(() => { 
        if (!loading && (!user || !isAdmin)) router.push('/auth/login'); 
    }, [user, isAdmin, loading]);

    const loadOrders = async () => {
        try {
            setFetching(true);
            const res = await api.get('/admin/orders');
            const data = Array.isArray(res.data) ? res.data : (res.data?.orders || []);
            setOrders(data);
        } catch (err: any) {
            console.error('Failed to load orders from database:', err);
            toast.error(err?.response?.data?.message || 'Failed to load orders from database');
            setOrders([]);
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => { 
        if (isAdmin) loadOrders(); 
    }, [isAdmin]);

    const updateStatus = async (orderId: string, status: string) => {
        try {
            await api.put(`/admin/orders/${orderId}/status`, { status });
            setOrders(prev => prev.map(ord => ord.id === orderId ? { ...ord, status } : ord));
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder((prev: any) => ({ ...prev, status }));
            }
            toast.success(`Order status updated to ${status}`);
        } catch (err: any) {
            console.error('Error updating status:', err);
            toast.error(err?.response?.data?.message || 'Error updating order status');
        }
    };

    // Client-side filtering across status and search query (orderId, customer name, email, phone, city)
    const filtered = orders.filter(order => {
        const matchesStatus = filter === 'All' || order.status === filter;
        if (!matchesStatus) return false;

        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        const id = (order.id || '').toLowerCase();
        const customerName = (order.shippingAddress?.fullName || order.user?.name || '').toLowerCase();
        const email = (order.user?.email || '').toLowerCase();
        const phone = (order.shippingAddress?.phone || order.user?.phone || '').toLowerCase();
        const city = (order.shippingAddress?.city || '').toLowerCase();
        const state = (order.shippingAddress?.state || '').toLowerCase();

        return id.includes(q) || customerName.includes(q) || email.includes(q) || phone.includes(q) || city.includes(q) || state.includes(q);
    });

    return (
        <div className="min-h-screen pt-24 pb-16" style={{ background: '#fafaf7' }}>
            {selectedOrder && (
                <CustomerDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            )}
            
            <div className="page-container">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                    <div className="flex items-center gap-3">
                        <Link href="/admin" className="p-2 rounded-xl hover:bg-[#f0f4ed] transition-colors">
                            <ArrowLeft className="w-5 h-5" style={{ color: '#475d2a' }} />
                        </Link>
                        <div>
                            <h1 className="section-title text-2xl sm:text-3xl">Customer Orders ({filtered.length})</h1>
                            <p className="section-subtitle text-xs sm:text-sm">Real-time orders stored in PostgreSQL database</p>
                        </div>
                    </div>
                    <button 
                        onClick={loadOrders}
                        className="btn-outline text-xs sm:text-sm py-2 px-3 flex items-center gap-2 self-stretch sm:self-auto justify-center"
                        title="Refresh orders">
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                </div>

                {/* Search Bar */}
                <div className="card p-3 sm:p-4 mb-6">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search by Order ID, Customer Name, Phone, Email, City..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#475d2a] transition-colors"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {['All', ...STATUSES].map(s => {
                        const count = s === 'All' ? orders.length : orders.filter(o => o.status === s).length;
                        return (
                            <button 
                                key={s} 
                                onClick={() => setFilter(s)}
                                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${filter === s ? 'text-white' : 'bg-white text-gray-600 hover:bg-[#f0f4ed]'}`}
                                style={filter === s ? { background: '#475d2a' } : {}}>
                                <span>{s}</span>
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filter === s ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Order List / Empty State */}
                {fetching ? (
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="card p-6 animate-pulse flex flex-col gap-3">
                                <div className="h-4 bg-gray-200 rounded w-1/3" />
                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="card p-12 text-center">
                        <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="font-bold text-gray-600 text-base">No orders found in database</h3>
                        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                            {orders.length === 0 
                                ? 'No customer has placed an order yet, or the database currently has 0 orders.'
                                : 'No orders matched your active filter or search query.'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map(order => {
                            const customerName = order.shippingAddress?.fullName || order.user?.name || 'Customer';
                            const customerPhone = order.shippingAddress?.phone || order.user?.phone;
                            const customerEmail = order.user?.email;
                            const city = order.shippingAddress?.city;
                            const state = order.shippingAddress?.state;
                            const items = Array.isArray(order.items) ? order.items : [];

                            return (
                                <div key={order.id} className="card p-4 sm:p-5 hover:shadow-md transition-shadow">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        
                                        {/* Left: ID & Customer & Items */}
                                        <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-sm"
                                                style={{ background: '#475d2a', fontSize: '0.65rem' }}>
                                                #{order.id.slice(-4).toUpperCase()}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-bold text-sm sm:text-base" style={{ color: '#475d2a' }}>{customerName}</p>
                                                    <span className="font-mono text-xs text-gray-400">({order.id.slice(-8)})</span>
                                                    {city && (
                                                        <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                            <MapPin className="w-3 h-3 text-gray-400" /> {city}{state ? `, ${state}` : ''}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5 flex-wrap">
                                                    {customerEmail && <span>{customerEmail}</span>}
                                                    {customerPhone && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1 font-medium text-gray-700">
                                                                <Phone className="w-3 h-3 text-gray-400" /> {customerPhone}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Items summary */}
                                                <div className="flex gap-1.5 mt-2 flex-wrap items-center">
                                                    {items.slice(0, 3).map((item: any, i: number) => (
                                                        <span key={i} className="badge text-[11px] py-0.5 px-2 bg-[#f0f4ed] text-[#475d2a] font-medium border border-[#e2ebd9]">
                                                            {item.name} ×{item.quantity}
                                                        </span>
                                                    ))}
                                                    {items.length > 3 && (
                                                        <span className="badge bg-gray-100 text-gray-500 text-[11px]">
                                                            +{items.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Price, Actions, Status Dropdown, Date */}
                                        <div className="flex items-center justify-between lg:justify-end gap-3 sm:gap-4 flex-wrap pt-3 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                                            
                                            {/* Price & Paid Indicator */}
                                            <div className="text-left sm:text-right">
                                                <p className="font-extrabold text-base sm:text-lg" style={{ color: '#475d2a' }}>₹{order.totalPrice}</p>
                                                <p className={`text-xs font-bold ${order.isPaid ? 'text-green-600' : (order.paymentMethod === 'COD' ? 'text-blue-600' : 'text-orange-500')}`}>
                                                    {order.isPaid ? '✓ Paid' : (order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Unpaid')}
                                                </p>
                                            </div>

                                            {/* Details Button */}
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all hover:bg-[#475d2a] hover:text-white"
                                                style={{ borderColor: '#475d2a', color: '#475d2a', background: '#f0f4ed' }}>
                                                Details
                                            </button>

                                            {/* Status Dropdown */}
                                            <select 
                                                value={order.status} 
                                                onChange={e => updateStatus(order.id, e.target.value)}
                                                className="px-3 py-2 rounded-xl border-2 border-[#f0f4ed] text-xs sm:text-sm font-bold focus:outline-none focus:border-[#475d2a] transition-colors cursor-pointer"
                                                style={{ background: STATUS_COLORS[order.status] || '#f3f4f6', color: STATUS_TEXT[order.status] || '#374151' }}>
                                                {STATUSES.map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>

                                            {/* Date + Time */}
                                            <div className="text-right min-w-[75px] hidden sm:block">
                                                <p className="text-xs text-gray-500 font-medium">
                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                </p>
                                                <p className="text-[11px] text-gray-400 flex items-center gap-1 justify-end">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                </p>
                                            </div>

                                        </div>

                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
