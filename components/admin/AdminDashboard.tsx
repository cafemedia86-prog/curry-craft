import React, { useState } from 'react';
import { Package, ChefHat, Award, TrendingUp, Users, ShoppingBag, Clock } from 'lucide-react';
import OrderManager from './OrderManager';
import DishManager from './DishManager';
import LoyaltyManager from './LoyaltyManager';
import StaffManager from './StaffManager';
import OfferManager from './OfferManager';
import StoreSettings from './StoreSettings';
import { useAuth } from '../../context/AuthContext';

interface AdminDashboardProps {
    activeSubTab: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeSubTab }) => {

    const { user } = useAuth();

    const renderContent = () => {
        switch (activeSubTab) {
            case 'home':
                return <AdminHome />;
            case 'orders':
                return <OrderManager />;
            case 'dishes':
                return <DishManager />;
            case 'loyalty':
                return <LoyaltyManager />;
            case 'offers':
                return <OfferManager />;
            case 'staff':
                return user?.role === 'ADMIN' ? <StaffManager /> : <AdminHome />;
            case 'settings':
                return user?.role === 'ADMIN' ? <StoreSettings /> : <AdminHome />;
            default:
                return <AdminHome />;
        }
    };

    return (
        <div className="min-h-screen bg-[#022c22] pb-24">
            <div className="max-w-6xl mx-auto">
                {renderContent()}
            </div>
        </div>
    );
};

const AdminHome = () => {
    const stats = [
        { label: 'Total Revenue', value: '₹ 1,24,500', icon: <TrendingUp className="text-green-400" />, change: '+12%' },
        { label: 'Total Orders', value: '542', icon: <ShoppingBag className="text-amber-500" />, change: '+8%' },
        { label: 'Active Users', value: '1,205', icon: <Users className="text-blue-400" />, change: '+15%' },
        { label: 'Avg Prep Time', value: '18 min', icon: <Clock className="text-pink-400" />, change: '-2 min' },
    ];

    return (
        <div className="p-6">
            <header className="mb-10">
                <h2 className="text-3xl font-serif text-white">Admin Dashboard</h2>
                <p className="text-green-400/50">Overview of Curry Craft performance</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-[#034435] p-6 rounded-3xl border border-green-800/30">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-green-900/50 rounded-2xl">
                                {stat.icon}
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                }`}>
                                {stat.change}
                            </span>
                        </div>
                        <div className="text-green-100/50 text-sm mb-1">{stat.label}</div>
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-amber-600/20 to-transparent p-8 rounded-3xl border border-amber-500/20">
                    <h3 className="text-xl font-serif text-white mb-2 underline decoration-amber-500/50 underline-offset-8">Royal Alert</h3>
                    <p className="text-green-100/70 mb-6">3 orders have been waiting for over 25 minutes. Please check the Orders tab immediately.</p>
                    <button className="bg-amber-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-500 transition-colors">
                        View Delayed Orders
                    </button>
                </div>

                <div className="bg-[#034435] p-8 rounded-3xl border border-green-800/30">
                    <h3 className="text-xl font-serif text-white mb-6">Popular Category</h3>
                    <div className="space-y-4">
                        {['Paneer Specialties', 'Main Course', 'Tandoori Starters'].map((cat, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-green-100/70">{cat}</span>
                                    <span className="text-amber-400 font-bold">{85 - i * 15}%</span>
                                </div>
                                <div className="h-2 bg-green-900 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500" style={{ width: `${85 - i * 15}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
