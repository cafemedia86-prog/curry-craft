import React from 'react';
import { Package, Calendar, ChevronRight, MapPin, Truck, Phone } from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';

const OrderHistory: React.FC = () => {
    const { orders, isLoading } = useOrders();
    const { user } = useAuth();

    // Managers and Admins see all orders
    const displayOrders = (user && (user.role === 'ADMIN' || user.role === 'MANAGER'))
        ? orders
        : orders.filter(o => o.userId === user?.id);

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-serif text-white mb-4 flex items-center gap-2">
                <Package className="text-amber-500" size={20} /> Past Orders
            </h3>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-10">
                    <div className="w-8 h-8 border-3 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-3" />
                    <p className="text-green-400/40 text-sm">Fetching orders...</p>
                </div>
            ) : displayOrders.length === 0 ? (
                <div className="bg-[#034435] rounded-3xl p-10 text-center border border-dashed border-green-800/50 text-green-400/40">
                    <p>No past orders found.</p>
                </div>
            ) : (
                displayOrders.map(order => (
                    <div key={order.id} className="bg-[#034435] rounded-xl p-4 border border-green-800/30 hover:bg-[#045c48] transition-colors cursor-pointer group animate-in fade-in duration-300">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="text-white font-bold">{order.id.split('-')[0].toUpperCase()}</div>
                                <div className="text-green-400/50 text-xs flex items-center gap-1 mt-1">
                                    <Calendar size={12} /> {order.date}
                                </div>
                            </div>
                            <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${order.status === 'Delivered' || order.status === 'Ready' ? 'bg-green-500/20 text-green-400' :
                                order.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                                }`}>
                                {order.status}
                            </div>
                        </div>

                        <div className="text-sm text-green-100/70 line-clamp-1 mb-2">
                            {order.items.map(i => i.name).join(', ')}
                        </div>

                        <div className="text-[10px] text-green-400/40 mb-3 flex items-center gap-1 italic">
                            <MapPin size={10} /> {order.deliveryAddress}
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-green-800/30">
                            <div className="flex items-center gap-3">
                                {order.status === 'Dispatched' && order.trackingUrl && (
                                    <a
                                        href={order.trackingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="bg-emerald-600/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-500/30 flex items-center gap-2 hover:bg-emerald-600 hover:text-white transition-all animate-pulse"
                                    >
                                        <Truck size={14} /> Active Tracking
                                    </a>
                                )}
                                {order.status === 'Dispatched' && order.courierDetails && (
                                    <div className="flex items-center gap-2 bg-green-500/5 px-2 py-1 rounded-lg border border-green-500/10">
                                        <div className="text-[10px] text-green-400 font-medium">
                                            {order.courierDetails}
                                        </div>
                                        <a
                                            href={`tel:${order.courierDetails.replace(/[^\d+]/g, '')}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-1 bg-green-500/20 text-green-400 rounded-full hover:bg-green-500 hover:text-white transition-colors"
                                            title="Call Driver"
                                        >
                                            <Phone size={12} />
                                        </a>
                                    </div>
                                )}
                                <div className="text-amber-400 font-bold">₹ {order.total}</div>
                            </div>
                            <div className="text-green-400 group-hover:translate-x-1 transition-transform">
                                <ChevronRight size={18} />
                            </div>
                        </div>
                        {order.status === 'Rejected' && order.rejectionReason && (
                            <div className="text-xs text-red-400 mt-2 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                                <strong>Reason:</strong> {order.rejectionReason}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default OrderHistory;
