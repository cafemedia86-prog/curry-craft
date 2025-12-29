import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

export type OrderStatus = 'Pending' | 'Confirmed' | 'Preparing' | 'Ready' | 'Dispatched' | 'Delivered' | 'Rejected' | 'Refunded';

export interface Order {
    id: string;
    userId: string;
    userName: string;
    date: string;
    items: { id: string, name: string, quantity: number, price: number }[];
    total: number;
    status: OrderStatus;
    deliveryAddress: string;
    rejectionReason?: string;
    appliedOfferCode?: string;
    discountAmount?: number;
}

interface OrderContextType {
    orders: Order[];
    isLoading: boolean;
    placeOrder: (order: Partial<Order>) => Promise<void>;
    updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
    refundOrder: (orderId: string) => Promise<void>;
    rejectOrder: (orderId: string, reason: string) => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user, updateWallet } = useAuth();

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            let query = supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            // If not admin/manager, only fetch user's orders
            if (user?.role === 'USER') {
                query = query.eq('user_id', user?.id);
            }

            const { data, error } = await query;

            if (error) throw error;

            if (data) {
                const mappedOrders: Order[] = data.map((order: any) => ({
                    id: order.id,
                    userId: order.user_id,
                    userName: order.user_name,
                    date: new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    items: order.items,
                    total: Number(order.total),
                    status: order.status as OrderStatus,
                    deliveryAddress: order.delivery_address || 'Takeaway',
                    rejectionReason: order.rejection_reason
                }));
                setOrders(mappedOrders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchOrders();

            // Set up real-time subscription
            const subscription = supabase
                .channel('orders-channel')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'orders'
                }, (payload) => {
                    console.log('Order changed:', payload);
                    fetchOrders(); // Refresh orders on any change
                })
                .subscribe();

            return () => {
                supabase.removeChannel(subscription);
            };
        } else {
            setOrders([]);
            setIsLoading(false);
        }
    }, [user]);

    const placeOrder = async (orderData: Partial<Order>) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('orders')
                .insert([{
                    user_id: user.id,
                    user_name: user.name || 'Royal Guest',
                    items: orderData.items,
                    total: orderData.total,
                    status: 'Pending',
                    delivery_address: orderData.deliveryAddress,
                    applied_offer_code: orderData.appliedOfferCode,
                    discount_amount: orderData.discountAmount || 0
                }]);

            if (error) throw error;
            // No need to manually update state, the subscription will handle it or we can re-fetch
            await fetchOrders();
        } catch (error) {
            console.error('Error placing order:', error);
            console.error('Error placing order:', error);
            alert('Failed to place order. Please try again.');
        }
    };

    const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status })
                .eq('id', orderId);

            if (error) throw error;
            await fetchOrders();
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update status');
        }
    };

    const refundOrder = async (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        if (order && order.status !== 'Refunded') {
            try {
                const { error } = await supabase.rpc('process_refund', { order_id_input: orderId });
                if (error) throw error;
                await fetchOrders();
            } catch (error) {
                console.error('Error processing refund:', error);
                alert('Failed to process refund');
            }
        }
    };

    const rejectOrder = async (orderId: string, reason: string) => {
        try {
            const { error } = await supabase.rpc('reject_order', { order_id_input: orderId, reason_input: reason });
            if (error) throw error;
            await fetchOrders();
        } catch (error) {
            console.error('Error rejecting order:', error);
            alert('Failed to reject order');
        }
    };

    return (
        <OrderContext.Provider value={{ orders, isLoading, placeOrder, updateOrderStatus, refundOrder, rejectOrder }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrders = () => {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrders must be used within an OrderProvider');
    }
    return context;
};
