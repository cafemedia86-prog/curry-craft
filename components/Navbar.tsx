import React, { useState, useEffect } from 'react';
import { MapPin, ShoppingCart, User, Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  onSearch: (query: string) => void;
  searchTerm: string;
}

const Navbar: React.FC<NavbarProps> = ({ onSearch, searchTerm }) => {
  const { cartCount, setIsCartOpen } = useCart();
  const [location, setLocation] = useState('New York, USA');
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    if ("geolocation" in navigator) {
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            if (data.city || data.locality) {
              setLocation(`${data.city || data.locality}, ${data.countryCode}`);
            } else {
              setLocation('Current Location');
            }
          } catch (error) {
            console.error("Error fetching city name:", error);
            setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
          } finally {
            setLoadingLocation(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setLoadingLocation(false);
        }
      );
    }
  }, []);

  return (
    <div className="sticky top-0 z-40 bg-[#022c22] pt-6 pb-4 px-5 shadow-xl rounded-b-3xl">
      {/* Top Row: Location & Actions */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-green-300/80 text-xs font-medium">
            <MapPin size={14} className="text-green-400" />
            <span>Location</span>
          </div>
          <div className="flex items-center gap-1 text-white">
            {loadingLocation ? (
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-amber-500" />
                <span className="font-sans font-bold text-lg tracking-wide">Locating...</span>
              </div>
            ) : (
              <>
                <span className="font-sans font-bold text-lg tracking-wide">{location}</span>
                <span className="text-green-400/60 text-[10px] ml-1">▼</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCartOpen(true)}
            className="p-2.5 bg-green-900/40 rounded-xl text-green-100 hover:bg-green-800 transition-colors relative border border-green-800/50 backdrop-blur-sm"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-[#022c22] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('switchTab', { detail: 'profile' }))}
            className="p-2.5 bg-green-900/40 rounded-xl text-green-100 hover:bg-green-800 transition-colors border border-green-800/50 backdrop-blur-sm"
          >
            <User size={20} />
          </button>
        </div>
      </div>

      {/* Search Bar Row */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-green-400/70" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search"
            className="w-full bg-[#034435] text-white placeholder-green-400/50 pl-12 pr-4 py-3.5 rounded-xl border-none focus:outline-none focus:ring-1 focus:ring-amber-500/50 shadow-inner"
          />
        </div>
        <button className="bg-amber-500 text-[#022c22] p-3.5 rounded-xl hover:bg-amber-400 transition-colors shadow-lg shadow-amber-900/20">
          <SlidersHorizontal size={22} />
        </button>
      </div>
    </div>
  );
};

export default Navbar;