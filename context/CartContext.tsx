import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { CartItem, MenuItem } from '../types';
import { supabase } from '../lib/supabase';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  // Coupon Logic
  couponCode: string | null;
  discountAmount: number;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  finalTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  const addToCart = useCallback((product: MenuItem) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
    // Reset coupon on cart change to re-validate? Or just keep it. 
    // Ideally we should re-validate, but for now let's keep it simple.
    // If strict, we remove coupon on cart modification.
    if (couponCode) removeCoupon();
  }, [couponCode]);

  const removeFromCart = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    if (couponCode) removeCoupon();
  }, [couponCode]);

  const updateQuantity = useCallback((itemId: string, delta: number) => {
    setItems((prev) => {
      return prev.map((item) => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + delta;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      });
    });
    if (couponCode) removeCoupon();
  }, [couponCode]);

  const clearCart = useCallback(() => {
    setItems([]);
    removeCoupon();
  }, []);

  const removeCoupon = () => {
    setCouponCode(null);
    setDiscountAmount(0);
  };

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return { success: false, message: 'Invalid coupon code' };
      }

      // Validate Expiry
      if (data.valid_until && new Date(data.valid_until) < new Date()) {
        return { success: false, message: 'Coupon has expired' };
      }

      // Validate Min Order
      if (cartTotal < (data.min_order_value || 0)) {
        return { success: false, message: `Minimum order of ₹${data.min_order_value} required` };
      }

      // Calculate Discount
      let discount = 0;
      if (data.discount_type === 'PERCENTAGE') {
        discount = (cartTotal * data.discount_value) / 100;
        // Cap logic if max_discount_value existed (assuming schema support or simple logic)
        if (data.max_discount_value && discount > data.max_discount_value) {
          discount = data.max_discount_value;
        }
      } else {
        discount = data.discount_value;
      }

      // Ensure discount doesn't exceed total
      if (discount > cartTotal) discount = cartTotal;

      setDiscountAmount(Math.floor(discount));
      setCouponCode(code.toUpperCase());
      return { success: true, message: `Coupon applied! You saved ₹${Math.floor(discount)}` };

    } catch (err) {
      return { success: false, message: 'Error validating coupon' };
    }
  };

  const finalTotal = Math.max(0, cartTotal - discountAmount);

  const cartCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        couponCode,
        discountAmount,
        applyCoupon,
        removeCoupon,
        finalTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
