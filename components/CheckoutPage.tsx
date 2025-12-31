import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { CreditCard, Wallet, ArrowLeft, CheckCircle2, ShoppingBag, MapPin, Plus, ChevronDown, Ticket, TicketSlash } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAddresses } from '../context/AddressContext';
import { useLoyalty } from '../context/LoyaltyContext';
import AddressPickerModal from './AddressPickerModal';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { calculateDistance, calculateDeliveryFee } from '../utils/geoUtils';

interface CheckoutPageProps {
    onBack: () => void;
    onOrderPlaced: (order: any) => Promise<void>;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBack, onOrderPlaced }) => {
    const { items, cartTotal, clearCart, applyCoupon, removeCoupon, couponCode, discountAmount } = useCart();
    const { user, updateWallet, addLoyaltyPoints } = useAuth();
    const { calculatePointsToAward, settings } = useLoyalty();
    const { addresses, addAddress } = useAddresses();
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
        addresses.find(a => a.isDefault)?.id || (addresses.length > 0 ? addresses[0].id : null)
    );
    const { settings: storeSettings } = useStoreSettings();
    const [deliveryFee, setDeliveryFee] = useState(0);
    const [distanceKm, setDistanceKm] = useState(0);

    const selectedAddress = addresses.find(a => a.id === selectedAddressId);

    React.useEffect(() => {
        if (selectedAddress && storeSettings) {
            const dist = calculateDistance(
                storeSettings.outlet_latitude,
                storeSettings.outlet_longitude,
                selectedAddress.latitude,
                selectedAddress.longitude
            );
            setDistanceKm(Number(dist.toFixed(1))); // Round to 1 decimal place for display
            setDeliveryFee(calculateDeliveryFee(dist));
        } else {
            setDeliveryFee(0);
            setDistanceKm(0);
        }
    }, [selectedAddress, storeSettings]);

    const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card'>('wallet');
    const [redeemPoints, setRedeemPoints] = useState(false);

    // Loyalty Logic
    const pointsAvailable = user?.loyaltyPoints || 0;
    // Max 50% of the total can be paid via points? Or just straight up. Let's assume 1 point = 1 rupee for now as per sql, but let's check settings if we had conversion rate.
    // For simplicity: 1 Point = 1 Rupee Discount (Configurable in future, but hardcoded in SQL redeem_points function too)
    // Check min redemption
    const canRedeem = pointsAvailable >= (settings?.min_redemption_points || 100);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [couponInput, setCouponInput] = useState('');
    const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

    const subTotalAfterDiscount = Math.max(0, cartTotal - discountAmount);
    // Apply loyalty discount if enabled - use configurable redemption rate
    const maxRedeemableValue = pointsAvailable * (settings?.redemption_rate || 1.0);
    const loyaltyDiscount = redeemPoints ? Math.min(maxRedeemableValue, subTotalAfterDiscount) : 0;
    const pointsActuallyUsed = settings?.redemption_rate ? Math.ceil(loyaltyDiscount / settings.redemption_rate) : loyaltyDiscount;
    const taxableAmount = Math.max(0, subTotalAfterDiscount - loyaltyDiscount);

    const tax = Math.round(taxableAmount * 0.05);
    const total = taxableAmount + tax + deliveryFee;

    const pointsToEarn = calculatePointsToAward(total);

    const handleApplyCoupon = async () => {
        if (!couponInput.trim()) return;
        setIsValidatingCoupon(true);
        setCouponMessage(null);
        const result = await applyCoupon(couponInput);
        setCouponMessage({ type: result.success ? 'success' : 'error', text: result.message });
        setIsValidatingCoupon(false);
        if (result.success) setCouponInput('');
    };

    const handleRemoveCoupon = () => {
        removeCoupon();
        setCouponMessage(null);
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            alert("Please select or add a delivery address!");
            return;
        }

        if (paymentMethod === 'wallet' && user && user.walletBalance < total) {
            alert("Insufficient wallet balance!");
            return;
        }

        setIsPlacingOrder(true);
        try {
            if (paymentMethod === 'wallet') {
                await updateWallet(-total);
            }

            // Deduct redeemed points
            if (redeemPoints && pointsActuallyUsed > 0) {
                // Deduct the actual points used (not the discount amount)
                await addLoyaltyPoints(-pointsActuallyUsed);
            }

            // Add loyalty points for this order
            if (pointsToEarn > 0) {
                await addLoyaltyPoints(pointsToEarn);
            }

            const orderData = {
                items: items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price })),
                total: total,
                deliveryAddress: selectedAddress?.addressLine || 'Self Pickup',
                discountAmount: discountAmount,
                appliedOfferCode: couponCode, // Changed key to match Order interface
                deliveryFee: deliveryFee,
                deliveryDistance: distanceKm
            };

            await onOrderPlaced(orderData);

            setIsPlacingOrder(false);
            setOrderSuccess(true);
            clearCart();
        } catch (error) {
            console.error("Error placing order:", error);
            alert("Something went wrong while placing your order.");
            setIsPlacingOrder(false);
        }
    };

    const handleSaveAddress = async (data: { label: string, addressLine: string, lat: number, lng: number }) => {
        try {
            await addAddress({
                label: data.label,
                addressLine: data.addressLine,
                latitude: data.lat,
                longitude: data.lng,
                isDefault: addresses.length === 0
            });
            setIsPickerOpen(false);
        } catch (error) {
            alert('Error saving address');
        }
    };



    if (orderSuccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] p-5 text-center animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-[#D4A017]/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={60} className="text-[#D4A017] animate-bounce" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-[#0F2E1A] mb-2">Order Placed!</h2>
                <p className="text-[#0F2E1A]/60 mb-8">Your royal feast is being prepared with love.</p>
                <div className="text-[#D4A017] font-bold tracking-widest animate-pulse">Redirecting to home...</div>
            </div>
        );
    }

    return (
        <div className="p-5 animate-in slide-in-from-right duration-300">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 bg-[#0F2E1A] rounded-full text-[#D4A017] shadow-lg shadow-black/10">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-serif font-bold text-[#0F2E1A]">Checkout</h2>
            </header>

            <div className="space-y-6">
                {/* Delivery Address */}
                <section className="bg-white rounded-[2rem] p-6 border border-[#E6E0D5] shadow-sm">
                    <div className="flex justify-between items-center mb-5">
                        <h3 className="text-[#D4A017] font-sans font-bold text-lg flex items-center gap-2">
                            <MapPin size={22} className="fill-[#D4A017]/20" /> Delivery Address
                        </h3>
                        <button
                            onClick={() => setIsPickerOpen(true)}
                            className="text-[#0F2E1A] text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:text-[#D4A017] transition-colors"
                        >
                            <Plus size={14} /> Add New
                        </button>
                    </div>

                    {addresses.length === 0 ? (
                        <button
                            onClick={() => setIsPickerOpen(true)}
                            className="w-full py-8 border-2 border-dashed border-[#E6E0D5] rounded-[1.5rem] text-[#0F2E1A]/40 text-sm flex flex-col items-center gap-2 hover:bg-[#F5F1E8] transition-all"
                        >
                            <MapPin size={32} className="opacity-20 translate-y-1" />
                            <span>No address saved. Click to add.</span>
                        </button>
                    ) : (
                        <div className="space-y-3">
                            {addresses.map(addr => (
                                <button
                                    key={addr.id}
                                    onClick={() => setSelectedAddressId(addr.id)}
                                    className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedAddressId === addr.id
                                        ? 'bg-[#0F2E1A] border-[#D4A017] shadow-lg shadow-black/10'
                                        : 'bg-[#F5F1E8] border-[#E6E0D5] hover:border-[#0F2E1A]/30'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedAddressId === addr.id ? 'text-[#D4A017]' : 'text-[#0F2E1A]/40'}`}>
                                            {addr.label}
                                        </span>
                                        {selectedAddressId === addr.id && <CheckCircle2 size={16} className="text-[#D4A017]" />}
                                    </div>
                                    <p className={`text-xs line-clamp-1 ${selectedAddressId === addr.id ? 'text-[#FAF7F0] font-medium' : 'text-[#0F2E1A]/80'}`}>
                                        {addr.addressLine}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                {/* Coupon Code Section */}
                <section className="bg-white rounded-[2rem] p-6 border border-[#E6E0D5] shadow-sm">
                    <h3 className="text-[#D4A017] font-sans font-bold text-lg mb-4 flex items-center gap-2">
                        <Ticket size={22} className="fill-[#D4A017]/20" /> Coupon Code
                    </h3>

                    {couponCode ? (
                        <div className="bg-[#DCEFE4] border border-green-200 rounded-2xl p-4 flex justify-between items-center">
                            <div>
                                <div className="text-[#0F2E1A] font-bold tracking-wider">{couponCode}</div>
                                <div className="text-green-700 text-xs">Discount applied</div>
                            </div>
                            <button onClick={handleRemoveCoupon} className="text-red-600 hover:text-red-500 p-2">
                                <TicketSlash size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={couponInput}
                                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                placeholder="ENTER CODE"
                                className="flex-1 bg-[#F5F1E8] border border-[#E6E0D5] rounded-[1.25rem] px-5 py-4 text-[#0F2E1A] placeholder:text-[#0F2E1A]/30 focus:outline-none focus:border-[#D4A017] transition-colors uppercase font-mono text-sm"
                            />
                            <button
                                onClick={handleApplyCoupon}
                                disabled={isValidatingCoupon || !couponInput}
                                className="bg-[#0F2E1A] disabled:bg-stone-300 text-[#D4A017] px-6 rounded-[1.25rem] font-bold text-sm shadow-md"
                            >
                                {isValidatingCoupon ? '...' : 'Apply'}
                            </button>
                        </div>
                    )}
                    {couponMessage && (
                        <p className={`text-xs mt-3 font-bold ${couponMessage.type === 'success' ? 'text-green-700' : 'text-red-600'}`}>
                            {couponMessage.text}
                        </p>
                    )}
                </section>

                {/* Order Summary */}
                <section className="bg-white rounded-[2rem] p-6 border border-[#E6E0D5] shadow-sm">
                    <h3 className="text-[#D4A017] font-sans font-bold text-lg mb-4 flex items-center gap-2">
                        <ShoppingBag size={22} className="fill-[#D4A017]/20" /> Order Summary
                    </h3>
                    <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar border-b border-[#E6E0D5] pb-4">
                        {items.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-[#0F2E1A] font-medium">{item.name} x {item.quantity}</span>
                                <span className="text-[#0F2E1A] font-bold">₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-[#0F2E1A]/70">
                            <span className="font-medium">Subtotal</span>
                            <span className="font-bold">₹{cartTotal}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between text-sm text-green-700 font-bold">
                                <span>Discount Applied</span>
                                <span>- ₹{discountAmount}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm text-[#0F2E1A]/70">
                            <span className="font-medium">Taxes (5%)</span>
                            <span className="font-bold">₹{tax}</span>
                        </div>
                        <div className="flex justify-between text-sm text-[#0F2E1A]/70">
                            <span className="font-medium">Delivery Fee ({distanceKm} km)</span>
                            <span className="font-bold">₹{deliveryFee}</span>
                        </div>

                        {/* Loyalty Redemption Toggle */}
                        {user && settings && pointsAvailable > 0 && (
                            <div className="py-3 border-t border-dotted border-[#E6E0D5]">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-sm text-[#0F2E1A]">
                                        <CheckCircle2 size={16} className={canRedeem ? "text-[#D4A017]" : "text-gray-300"} />
                                        <span className="font-medium">Redeem Points ({pointsAvailable})</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={redeemPoints}
                                            disabled={!canRedeem}
                                            onChange={(e) => setRedeemPoints(e.target.checked)}
                                        />
                                        <div className={`w-9 h-5 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#D4A017]/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${!canRedeem ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-200 peer-checked:bg-[#0F2E1A]'}`}></div>
                                    </label>
                                </div>
                                {!canRedeem && (
                                    <div className="text-[10px] text-red-500 pl-6">Min. {settings.min_redemption_points} points required</div>
                                )}
                                {redeemPoints && (
                                    <div className="flex justify-between text-sm text-[#D4A017] font-bold pl-6">
                                        <span>Points Redeemed ({pointsActuallyUsed} pts)</span>
                                        <span>- ₹{loyaltyDiscount.toFixed(0)}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex justify-between text-xl font-bold text-[#D4A017] pt-4 border-t-2 border-[#E6E0D5] mt-2">
                            <span>Total Amount</span>
                            <span>₹{total}</span>
                        </div>
                        <div className="text-center mt-4">
                            <span className="text-[10px] uppercase tracking-widest text-[#0F2E1A]/50 bg-[#F5F1E8] px-3 py-1.5 rounded-full font-bold">
                                You will earn <span className="text-[#D4A017]">{pointsToEarn}</span> Royal Points
                            </span>
                        </div>
                    </div>
                </section>

                {/* Payment Method */}
                <section>
                    <h3 className="text-[#0F2E1A] font-sans font-bold mb-4">Payment Method</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setPaymentMethod('wallet')}
                            className={`p-5 rounded-[1.5rem] border flex flex-col items-center gap-3 transition-all ${paymentMethod === 'wallet'
                                ? 'bg-[#0F2E1A] border-[#D4A017] text-[#D4A017] shadow-lg shadow-black/10'
                                : 'bg-white border-[#E6E0D5] text-[#0F2E1A]/40'
                                }`}
                        >
                            <Wallet size={28} />
                            <span className="text-xs font-bold uppercase tracking-widest">Wallet</span>
                        </button>
                        <button
                            onClick={() => setPaymentMethod('card')}
                            className={`p-5 rounded-[1.5rem] border flex flex-col items-center gap-3 transition-all ${paymentMethod === 'card'
                                ? 'bg-[#0F2E1A] border-[#D4A017] text-[#D4A017] shadow-lg shadow-black/10'
                                : 'bg-white border-[#E6E0D5] text-[#0F2E1A]/40'
                                }`}
                        >
                            <CreditCard size={28} />
                            <span className="text-xs font-bold uppercase tracking-widest">Credit Card</span>
                        </button>
                    </div>
                </section>

                {/* Place Order Button */}
                <button
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder || items.length === 0}
                    className="w-full bg-[#0F2E1A] hover:bg-[#12422A] disabled:bg-[#0F2E1A]/50 text-[#FAF7F0] font-serif py-5 rounded-[1.5rem] uppercase tracking-widest font-bold shadow-xl shadow-[#0F2E1A]/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 mt-4"
                >
                    {isPlacingOrder ? (
                        <div className="w-6 h-6 border-2 border-[#FAF7F0]/30 border-t-[#FAF7F0] rounded-full animate-spin" />
                    ) : (
                        <>Pay ₹{total} & Place Order</>
                    )}
                </button>
            </div>

            {isPickerOpen && (
                <AddressPickerModal
                    onClose={() => setIsPickerOpen(false)}
                    onSave={handleSaveAddress}
                />
            )}
        </div>
    );
};

export default CheckoutPage;
