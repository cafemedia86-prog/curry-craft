import React from 'react';
import { Home, Compass, Wallet, User, ShieldCheck, Package, ChefHat, Award, Users, Tag, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isAdmin?: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, isAdmin }) => {
  const { user } = useAuth(); // We need role to distinguish Admin vs Manager
  const isSuperAdmin = user?.role === 'ADMIN';

  const getTabClass = (tabName: string) => {
    const isActive = activeTab === tabName;
    return `flex flex-col items-center gap-1.5 transition-colors ${isActive ? 'text-amber-500' : 'text-green-400/40 hover:text-green-200'
      }`;
  };

  if (isAdmin || user?.role === 'MANAGER') {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-[#022c22] border-t border-green-900/50 py-4 px-6 flex justify-between items-center z-50 rounded-t-3xl shadow-[0_-5px_25px_rgba(0,0,0,0.5)]">
        <button onClick={() => onTabChange('home')} className={getTabClass('home')}>
          <ShieldCheck size={24} className={activeTab === 'home' ? "fill-amber-500/20" : ""} />
          <span className="text-[10px] font-bold tracking-wide">Dashboard</span>
        </button>

        <button onClick={() => onTabChange('orders')} className={getTabClass('orders')}>
          <Package size={24} className={activeTab === 'orders' ? "fill-amber-500/20" : ""} />
          <span className="text-[10px] font-medium tracking-wide">Orders</span>
        </button>

        <button onClick={() => onTabChange('dishes')} className={getTabClass('dishes')}>
          <ChefHat size={24} className={activeTab === 'dishes' ? "fill-amber-500/20" : ""} />
          <span className="text-[10px] font-medium tracking-wide">Dishes</span>
        </button>

        {isSuperAdmin && (
          <button onClick={() => onTabChange('staff')} className={getTabClass('staff')}>
            <Users size={24} className={activeTab === 'staff' ? "fill-amber-500/20" : ""} />
            <span className="text-[10px] font-medium tracking-wide">Staff</span>
          </button>
        )}

        {isSuperAdmin && (
          <button onClick={() => onTabChange('settings')} className={getTabClass('settings')}>
            <Settings size={24} className={activeTab === 'settings' ? "fill-amber-500/20" : ""} />
            <span className="text-[10px] font-medium tracking-wide">Settings</span>
          </button>
        )}

        <button onClick={() => onTabChange('offers')} className={getTabClass('offers')}>
          <Tag size={24} className={activeTab === 'offers' ? "fill-amber-500/20" : ""} />
          <span className="text-[10px] font-medium tracking-wide">Offers</span>
        </button>

        <button onClick={() => onTabChange('loyalty')} className={getTabClass('loyalty')}>
          <Award size={24} className={activeTab === 'loyalty' ? "fill-amber-500/20" : ""} />
          <span className="text-[10px] font-medium tracking-wide">Loyalty</span>
        </button>

        <button onClick={() => onTabChange('profile')} className={getTabClass('profile')}>
          <User size={24} className={activeTab === 'profile' ? "fill-amber-500/20" : ""} />
          <span className="text-[10px] font-medium tracking-wide">Profile</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#022c22] border-t border-green-900/50 py-4 px-6 flex justify-between items-center z-50 rounded-t-3xl shadow-[0_-5px_25px_rgba(0,0,0,0.5)]">
      <button onClick={() => onTabChange('home')} className={getTabClass('home')}>
        <Home size={24} className={activeTab === 'home' ? "fill-amber-500/20" : ""} />
        <span className="text-[10px] font-bold tracking-wide">Home</span>
      </button>

      <button onClick={() => onTabChange('explore')} className={getTabClass('explore')}>
        <Compass size={24} className={activeTab === 'explore' ? "fill-amber-500/20" : ""} />
        <span className="text-[10px] font-medium tracking-wide">Explore</span>
      </button>

      <button onClick={() => onTabChange('wallet')} className={getTabClass('wallet')}>
        <Wallet size={24} className={activeTab === 'wallet' ? "fill-amber-500/20" : ""} />
        <span className="text-[10px] font-medium tracking-wide">Wallet</span>
      </button>

      <button onClick={() => onTabChange('profile')} className={getTabClass('profile')}>
        <User size={24} className={activeTab === 'profile' ? "fill-amber-500/20" : ""} />
        <span className="text-[10px] font-medium tracking-wide">Profile</span>
      </button>
    </div>
  );
};

export default BottomNav;