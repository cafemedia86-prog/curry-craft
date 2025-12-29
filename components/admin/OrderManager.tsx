import React, { useState } from 'react';
import { useOrders, OrderStatus } from '../../context/OrderContext';
import { CheckCircle2, XCircle, Package, Truck, RotateCcw, Search, Filter, ShoppingBag } from 'lucide-react';

const OrderManager: React.FC = () => {
    const { orders, updateOrderStatus, refundOrder, rejectOrder } = useOrders();
    const [filter, setFilter] = useState<OrderStatus | 'All'>('All');
    const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const filteredOrders = filter === 'All' ? orders : orders.filter(o => o.status === filter);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'Confirmed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'Preparing': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'Ready': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'Delivered': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'Rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'Refunded': return 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20';
            default: return 'bg-green-500/10 text-green-500 border-green-500/20';
        }
    };

    const handleReject = async () => {
        if (rejectingOrderId && rejectionReason.trim()) {
            await rejectOrder(rejectingOrderId, rejectionReason);
            setRejectingOrderId(null);
            setRejectionReason('');
        }
    };

    return (
        <div className="p-6">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-serif text-white">Order Management</h2>
                    <p className="text-green-400/50">Manage active orders and customer requests</p>
                </div>

                <div className="flex bg-[#034435] p-1 rounded-xl border border-green-800/30 overflow-x-auto max-w-full">
                    {['All', 'Pending', 'Confirmed', 'Preparing', 'Ready', 'Refunded', 'Rejected'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status as any)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filter === status ? 'bg-amber-500 text-green-950' : 'text-green-400/60 hover:text-white'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </header>

            <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-20 bg-[#034435] rounded-3xl border border-dashed border-green-800/50 text-green-400/40">
                        <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No orders found in this category.</p>
                    </div>
                ) : (
                    filteredOrders.map(order => (
                        <div key={order.id} className="bg-[#034435] rounded-3xl border border-green-800/30 overflow-hidden animate-in slide-in-from-bottom duration-300">
                            <div className="p-6 flex flex-col lg:flex-row justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-white font-bold text-lg">{order.id}</span>
                                        <span className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="text-green-400/60 text-sm mb-2">
                                        {order.userName} • {order.date}
                                    </div>
                                    <div className="text-[10px] text-amber-500/60 mb-4 italic flex items-center gap-1">
                                        <Package size={10} /> {order.deliveryAddress}
                                    </div>
                                    {(order.rejectionReason || order.status === 'Rejected') && (
                                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                                            <strong>Rejection Reason:</strong> {order.rejectionReason || 'No reason provided'}
                                        </div>
                                    )}
                                    <div className="space-y-1">
                                        {order.items.map((item, i) => (
                                            <div key={i} className="text-sm text-green-100/80">
                                                {item.name} <span className="text-amber-500">x{item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col justify-between items-end gap-4 min-w-[200px]">
                                    <div className="text-2xl font-bold text-white">₹ {order.total}</div>

                                    <div className="flex flex-wrap justify-end gap-2">
                                        {order.status === 'Pending' && (
                                            <>
                                                <button
                                                    onClick={() => setRejectingOrderId(order.id)}
                                                    className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                                                    title="Reject Order"
                                                >
                                                    <XCircle size={20} />
                                                </button>
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'Confirmed')}
                                                    className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-xl transition-all"
                                                    title="Confirm Order"
                                                >
                                                    <CheckCircle2 size={20} />
                                                </button>
                                            </>
                                        )}

                                        {order.status === 'Confirmed' && (
                                            <button
                                                onClick={() => updateOrderStatus(order.id, 'Preparing')}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition-all flex items-center gap-2"
                                            >
                                                <Package size={16} /> Mark Preparing
                                            </button>
                                        )}

                                        {order.status === 'Preparing' && (
                                            <button
                                                onClick={() => updateOrderStatus(order.id, 'Ready')}
                                                className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-500 transition-all flex items-center gap-2"
                                            >
                                                <CheckCircle2 size={16} /> Mark Ready
                                            </button>
                                        )}

                                        {order.status === 'Ready' && (
                                            <button
                                                onClick={() => updateOrderStatus(order.id, 'Dispatched')}
                                                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition-all flex items-center gap-2"
                                            >
                                                <Truck size={16} /> Mark Dispatched
                                            </button>
                                        )}

                                        {order.status !== 'Refunded' && order.status !== 'Rejected' && (
                                            <button
                                                onClick={() => refundOrder(order.id)}
                                                className="px-4 py-2 border border-amber-500/50 text-amber-500 rounded-xl text-xs font-bold hover:bg-amber-500 hover:text-white transition-all flex items-center gap-2"
                                            >
                                                <RotateCcw size={16} /> Refund to Wallet
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {rejectingOrderId && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-5 z-50">
                    <div className="bg-[#022c22] p-8 rounded-3xl w-full max-w-md border border-red-500/30">
                        <h3 className="text-xl font-serif text-white mb-4">Reject Order</h3>
                        <p className="text-green-400/60 text-sm mb-4">
                            Please provide a reason for rejecting this order. The customer will be automatically refunded.
                        </p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full bg-[#034435] text-white p-4 rounded-xl border border-green-800/30 focus:border-red-500 outline-none mb-6 h-32"
                            placeholder="e.g. Out of stock, Kitchen closed..."
                        />
                        <div className="flex gap-4">
                            <button
                                onClick={() => { setRejectingOrderId(null); setRejectionReason(''); }}
                                className="flex-1 py-3 rounded-xl border border-green-800/30 text-green-400 font-bold hover:bg-green-900/50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={!rejectionReason.trim()}
                                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 disabled:opacity-50"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManager;
