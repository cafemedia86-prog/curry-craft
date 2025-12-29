import React, { useState, useEffect } from 'react';
import { Clock, Heart, MapPin, Award, Settings, ArrowLeft, LogOut, Wallet } from 'lucide-react';
import OrderHistory from './OrderHistory';
import AddressManager from './AddressManager';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const [activeSection, setActiveSection] = useState<'main' | 'orders' | 'loyalty' | 'addresses'>('main');

    if (!user) {
        return (
            <div className="p-10 text-center text-green-400/50">
                <div className="animate-pulse">Loading royal profile...</div>
            </div>
        );
    }

    const userName = user.name || 'Royal Guest';
    const initials = userName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

    if (activeSection === 'orders') {
        return (
            <div className="p-5 animate-in slide-in-from-right duration-300">
                <button
                    onClick={() => setActiveSection('main')}
                    className="flex items-center gap-2 text-amber-500 mb-6 hover:text-amber-400 transition-colors"
                >
                    <ArrowLeft size={20} /> <span className="font-bold">Back to Profile</span>
                </button>
                <OrderHistory />
            </div>
        );
    }

    if (activeSection === 'addresses') {
        return (
            <div className="p-5 animate-in slide-in-from-right duration-300">
                <button
                    onClick={() => setActiveSection('main')}
                    className="flex items-center gap-2 text-amber-500 mb-6 hover:text-amber-400 transition-colors"
                >
                    <ArrowLeft size={20} /> <span className="font-bold">Back to Profile</span>
                </button>
                <AddressManager />
            </div>
        );
    }
    if (activeSection === 'loyalty') {
        return (
            <div className="p-5 animate-in slide-in-from-right duration-300">
                <button
                    onClick={() => setActiveSection('main')}
                    className="flex items-center gap-2 text-amber-500 mb-6 hover:text-amber-400 transition-colors"
                >
                    <ArrowLeft size={20} /> <span className="font-bold">Back to Profile</span>
                </button>
                <div className="bg-[#034435] p-8 rounded-3xl border border-green-800/30 text-center">
                    <Award className="text-amber-500 mx-auto mb-4" size={64} />
                    <h3 className="text-2xl font-serif text-white mb-2">Loyalty Points</h3>
                    <div className="text-4xl font-bold text-amber-500 mb-4">{user.loyaltyPoints}</div>
                    <p className="text-green-400/60 text-sm mb-6">Earn more points by ordering your favorite dishes.</p>
                    <div className="bg-green-900/50 p-4 rounded-2xl text-left border border-green-800/20">
                        <div className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">Your Benefit</div>
                        <div className="text-white">Gold Tier: 1.25x Points on every order</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-5 animate-in slide-in-from-right duration-300">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center text-[#022c22] text-2xl font-bold">
                    {initials}
                </div>
                <div>
                    <div>
                        <h2 className="text-2xl font-serif text-green-950">{userName}</h2>
                        <p className="text-stone-500 text-sm">
                            {user.role === 'ADMIN' ? 'Administrator' :
                                user.role === 'MANAGER' ? 'Store Manager' : 'Gold Member'}
                        </p>
                    </div>
                </div>
            </div>

            {user.role === 'USER' && (
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-[#034435] p-4 rounded-2xl border border-green-800/30">
                        <div className="text-green-400/40 text-[10px] uppercase font-bold mb-1">Wallet</div>
                        <div className="text-white font-bold flex items-center gap-2">
                            <Wallet size={16} className="text-amber-500" /> ₹ {user.walletBalance}
                        </div>
                    </div>
                    <div className="bg-[#034435] p-4 rounded-2xl border border-green-800/30">
                        <div className="text-green-400/40 text-[10px] uppercase font-bold mb-1">Loyalty</div>
                        <div className="text-white font-bold flex items-center gap-2">
                            <Award size={16} className="text-amber-500" /> {user.loyaltyPoints} pts
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-1">
                {[
                    { icon: <Clock size={20} />, label: 'Order History', id: 'orders', hide: user.role === 'ADMIN' },
                    { icon: <Award size={20} />, label: 'Loyalty Points', id: 'loyalty', hide: user.role === 'ADMIN' },
                    { icon: <Heart size={20} />, label: 'Favorites', id: 'favorites', hide: user.role === 'ADMIN' },
                    { icon: <MapPin size={20} />, label: 'Saved Addresses', id: 'addresses', hide: user.role === 'ADMIN' },
                    { icon: <Settings size={20} />, label: 'Settings', id: 'settings' },
                ].filter(i => !i.hide).map((item, i) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            if (item.id === 'orders') setActiveSection('orders');
                            if (item.id === 'loyalty') setActiveSection('loyalty');
                            if (item.id === 'addresses') setActiveSection('addresses');
                        }}
                        className="w-full bg-[#034435] p-4 rounded-xl flex items-center gap-4 border border-green-800/30 hover:bg-[#045c48] transition-colors text-left mb-3"
                    >
                        <span className="text-amber-400">{item.icon}</span>
                        <span className="text-white font-medium">{item.label}</span>
                    </button>
                ))}

                <button
                    onClick={logout}
                    className="w-full bg-red-500/10 p-4 rounded-xl flex items-center gap-4 border border-red-500/20 hover:bg-red-500/20 transition-colors text-left mt-6"
                >
                    <span className="text-red-500"><LogOut size={20} /></span>
                    <span className="text-red-500 font-medium">Log out</span>
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;
