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
                <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={60} className="text-amber-500 animate-bounce" />
                </div>
                <h2 className="text-3xl font-serif text-white mb-2">Order Placed!</h2>
                <p className="text-green-400/70 mb-8">Your royal feast is being prepared.</p>
                <div className="text-amber-400 font-bold">Redirecting to home...</div>
            </div>
        );
    }

    return (
        <div className="p-5 animate-in slide-in-from-right duration-300">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={onBack} className="p-2 bg-green-900/50 rounded-full text-amber-400">
                    <ArrowLeft size={20} />
                </button>
                <h2 className="text-2xl font-serif text-white">Checkout</h2>
            </header>

            <div className="space-y-6">
                {/* Delivery Address */}
                <section className="bg-green-900/30 rounded-2xl p-5 border border-green-800/30">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-amber-400 font-serif text-lg flex items-center gap-2">
                            <MapPin size={20} /> Delivery Address
                        </h3>
                        <button
                            onClick={() => setIsPickerOpen(true)}
                            className="text-amber-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:text-amber-400 transition-colors"
                        >
                            <Plus size={14} /> Add New
                        </button>
                    </div>

                    {addresses.length === 0 ? (
                        <button
                            onClick={() => setIsPickerOpen(true)}
                            className="w-full py-6 border-2 border-dashed border-green-800/50 rounded-xl text-green-400/50 text-sm flex flex-col items-center gap-2 hover:bg-green-900/20 transition-all"
                        >
                            <MapPin size={24} className="opacity-30" />
                            <span>No address saved. Click to add.</span>
                        </button>
                    ) : (
                        <div className="space-y-3">
                            {addresses.map(addr => (
                                <button
                                    key={addr.id}
                                    onClick={() => setSelectedAddressId(addr.id)}
                                    className={`w-full text-left p-3 rounded-xl border transition-all ${selectedAddressId === addr.id
                                        ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-900/10'
                                        : 'bg-green-900/20 border-green-800/30 hover:border-green-800/50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedAddressId === addr.id ? 'text-amber-500' : 'text-green-400/40'}`}>
                                            {addr.label}
                                        </span>
                                        {selectedAddressId === addr.id && <div className="w-2 h-2 bg-amber-500 rounded-full" />}
                                    </div>
                                    <p className={`text-xs line-clamp-1 ${selectedAddressId === addr.id ? 'text-white font-medium' : 'text-green-100/50'}`}>
                                        {addr.addressLine}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                {/* Coupon Code Section */}
                <section className="bg-green-900/30 rounded-2xl p-5 border border-green-800/30">
                    <h3 className="text-amber-400 font-serif text-lg mb-4 flex items-center gap-2">
                        <Ticket size={20} /> Coupon Code
                    </h3>

                    {couponCode ? (
                        <div className="bg-amber-500/10 border border-amber-500/50 rounded-xl p-3 flex justify-between items-center">
                            <div>
                                <div className="text-amber-400 font-bold tracking-wider">{couponCode}</div>
                                <div className="text-green-300 text-xs">Discount applied</div>
                            </div>
                            <button onClick={handleRemoveCoupon} className="text-red-400 hover:text-red-300 p-2">
                                <TicketSlash size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={couponInput}
                                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                placeholder="Enter code"
                                className="flex-1 bg-green-950/50 border border-green-800/50 rounded-xl px-4 py-3 text-white placeholder:text-green-700/50 focus:outline-none focus:border-amber-500/50 transition-colors uppercase font-mono"
                            />
                            <button
                                onClick={handleApplyCoupon}
                                disabled={isValidatingCoupon || !couponInput}
                                className="bg-amber-600 disabled:bg-stone-700 text-white px-4 rounded-xl font-bold text-sm"
                            >
                                {isValidatingCoupon ? '...' : 'Apply'}
                            </button>
                        </div>
                    )}
                    {couponMessage && (
                        <p className={`text-xs mt-2 ${couponMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                            {couponMessage.text}
                        </p>
                    )}
                </section>

                {/* Order Summary */}
                <section className="bg-green-900/30 rounded-2xl p-5 border border-green-800/30">
                    <h3 className="text-amber-400 font-serif text-lg mb-4 flex items-center gap-2">
                        <ShoppingBag size={20} /> Order Summary
                    </h3>
                    <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {items.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-green-100/70">{item.name} x {item.quantity}</span>
                                <span className="text-white font-medium">₹ {item.price * item.quantity}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-green-800/50 pt-4 space-y-2">
                        <div className="flex justify-between text-sm text-green-400/60">
                            <span>Subtotal</span>
                            <span>₹ {cartTotal}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between text-sm text-amber-400 font-medium">
                                <span>Discount</span>
                                <span>- ₹ {discountAmount}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm text-green-400/60">
                            <span>Taxes (5%)</span>
                            <span>₹ {tax}</span>
                        </div>
                        <div className="flex justify-between text-sm text-green-400/60">
                            <span>Delivery Fee ({distanceKm} km)</span>
                            <span>₹ {deliveryFee}</span>
                        </div>

                        {/* Loyalty Redemption Toggle */}
                        {user && settings && pointsAvailable > 0 && (
                            <div className="py-3 border-t border-dotted border-green-800/30">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-sm text-green-200">
                                        <CheckCircle2 size={16} className={canRedeem ? "text-amber-500" : "text-gray-500"} />
                                        <span>Redeem Points ({pointsAvailable})</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={redeemPoints}
                                            disabled={!canRedeem}
                                            onChange={(e) => setRedeemPoints(e.target.checked)}
                                        />
                                        <div className={`w-9 h-5 rounded-full peer peer-focus:ring-2 peer-focus:ring-amber-500/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${!canRedeem ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-700 peer-checked:bg-amber-600'}`}></div>
                                    </label>
                                </div>
                                {!canRedeem && (
                                    <div className="text-[10px] text-red-400 pl-6">Min. {settings.min_redemption_points} points required</div>
                                )}
                                {redeemPoints && (
                                    <div className="flex justify-between text-sm text-amber-400 font-medium pl-6">
                                        <span>Points Redeemed ({pointsActuallyUsed} pts)</span>
                                        <span>- ₹ {loyaltyDiscount.toFixed(0)}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex justify-between text-lg font-bold text-amber-400 pt-2 border-t border-dashed border-green-800/30 mt-2">
                            <span>Total Amount</span>
                            <span>₹ {total}</span>
                        </div>
                        <div className="text-center mt-2">
                            <span className="text-[10px] uppercase tracking-widest text-green-400/50 bg-green-900/30 px-2 py-1 rounded-full">
                                You will earn {pointsToEarn} Royal Points
                            </span>
                        </div>
                    </div>
                </section>

                {/* Payment Method */}
                <section>
                    <h3 className="text-white font-bold mb-4">Payment Method</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setPaymentMethod('wallet')}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'wallet'
                                ? 'bg-amber-600/20 border-amber-500 text-amber-400'
                                : 'bg-[#034435] border-green-800/30 text-green-400/50'
                                }`}
                        >
                            <Wallet size={24} />
                            <span className="text-xs font-bold uppercase tracking-wider">Wallet</span>
                        </button>
                        <button
                            onClick={() => setPaymentMethod('card')}
                            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${paymentMethod === 'card'
                                ? 'bg-amber-600/20 border-amber-500 text-amber-400'
                                : 'bg-[#034435] border-green-800/30 text-green-400/50'
                                }`}
                        >
                            <CreditCard size={24} />
                            <span className="text-xs font-bold uppercase tracking-wider">Credit Card</span>
                        </button>
                    </div>
                </section>

                {/* Place Order Button */}
                <button
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder || items.length === 0}
                    className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-amber-800/50 text-white font-serif py-4 rounded-xl uppercase tracking-widest font-bold shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-3"
                >
                    {isPlacingOrder ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>Pay ₹ {total} & Place Order</>
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
