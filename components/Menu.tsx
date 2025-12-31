import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../constants';
import { MenuItem, DishFilter } from '../types';
import { Heart, Star, Plus, SearchX, ShoppingBag, Leaf, Circle } from 'lucide-react';
import CategoryRail from './CategoryRail';
import { useCart } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';

interface MenuProps {
    onProductClick: (product: MenuItem) => void;
    searchQuery: string;
    onSeeAll?: () => void;
    filters: DishFilter;
}

const Menu: React.FC<MenuProps> = ({ onProductClick, searchQuery, filters }) => {
    const { addToCart } = useCart();
    const { menu, isLoading } = useMenu();
    const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);

    // Search Logic
    const isSearching = searchQuery.length > 0;

    // Filter items based on search OR active category
    let displayedItems = isSearching
        ? menu.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : menu.filter(item => item.category === activeCategory);

    // Apply dietary filter
    if (filters.type === 'veg') {
        displayedItems = displayedItems.filter(item => item.isVeg);
    } else if (filters.type === 'non-veg') {
        displayedItems = displayedItems.filter(item => !item.isVeg);
    }

    // Apply sorting
    displayedItems = [...displayedItems].sort((a, b) => {
        switch (filters.sortBy) {
            case 'priceLow': return a.price - b.price;
            case 'priceHigh': return b.price - a.price;
            case 'rating': return (b.rating || 0) - (a.rating || 0);
            case 'popularity':
            default: return 0; // Keep original order
        }
    });

    // Get featured items specific to the CURRENT view (displayed items)
    const featuredItems = displayedItems.slice(0, 5);

    const currentCategoryLabel = CATEGORIES.find(c => c.id === activeCategory)?.label || 'Menu';

    return (
        <div className="pb-28">

            {!isSearching && (
                <CategoryRail
                    activeCategory={activeCategory}
                    onSelect={setActiveCategory}
                />
            )}

            {/* Featured Horizontal Scroll (Hide when searching) */}
            {!isSearching && featuredItems.length > 0 && (
                <section className="mb-8 pl-5 animate-in slide-in-from-right duration-500">
                    <div className="flex items-center pr-5 mb-5">
                        <h3 className="text-xl font-sans font-bold text-[#0F2E1A] tracking-wide">
                            {activeCategory === 'main-course' ? 'Featured Products' : `Top ${currentCategoryLabel}`}
                        </h3>
                    </div>

                    <div className="flex overflow-x-auto gap-5 pb-4 pr-5 snap-x">
                        {featuredItems.map(item => (
                            <div
                                key={`feat-${item.id}`}
                                onClick={() => onProductClick(item)}
                                className="snap-start min-w-[220px] w-[220px] bg-white rounded-[2rem] p-3 shadow-md shadow-black/5 flex-shrink-0 group cursor-pointer border border-[#E6E0D5] hover:border-[#D4A017]/30 transition-all"
                            >
                                <div className="relative mb-3">
                                    <div className="h-32 w-full rounded-[1.5rem] overflow-hidden">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    </div>

                                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 shadow-sm border border-[#E6E0D5]/50">
                                        <Star size={10} className="text-[#D4A017] fill-[#D4A017]" />
                                        <span className="text-[#0F2E1A] text-[10px] font-bold">{item.rating || '4.5'}</span>
                                    </div>

                                    <button className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center text-red-500 shadow-sm">
                                        <Heart size={14} fill="currentColor" />
                                    </button>
                                </div>

                                <div className="px-1 mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 border ${item.isVeg ? 'border-green-500' : 'border-red-500'} flex items-center justify-center p-[1px]`}>
                                            <div className={`w-full h-full rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        </div>
                                        <h4 className="text-[#0F2E1A] font-serif text-lg font-bold truncate leading-tight flex-1">{item.name}</h4>
                                    </div>
                                    <p className="text-[#0F2E1A]/60 text-xs mt-1 capitalize">{item.category.replace('-', ' ')}</p>
                                </div>

                                <div className="flex justify-between items-center px-1 mt-3">
                                    <span className="text-[#D4A017] font-bold text-lg">₹{item.price}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart(item);
                                        }}
                                        className="w-9 h-9 bg-[#0F2E1A] rounded-full flex items-center justify-center text-white hover:bg-[#D4A017] transition-colors shadow-lg shadow-[#0F2E1A]/10"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Main List / Search Results */}
            <section className="px-5">
                {isSearching && (
                    <h3 className="text-xl font-sans font-bold text-[#0F2E1A] tracking-wide mb-4">
                        {displayedItems.length > 0 ? `Results for "${searchQuery}"` : `No results for "${searchQuery}"`}
                    </h3>
                )}

                {!isSearching && (
                    <h3 className="text-xl font-sans font-bold text-[#0F2E1A] tracking-wide mb-4 animate-in fade-in duration-300">
                        {currentCategoryLabel}
                    </h3>
                )}

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mb-4" />
                        <p className="text-green-800/50 animate-pulse">Loading menu...</p>
                    </div>
                ) : displayedItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-green-800/50">
                        {isSearching ? (
                            <>
                                <SearchX size={48} className="mb-4 opacity-50" />
                                <p>No matches found.</p>
                            </>
                        ) : (
                            <>
                                <ShoppingBag size={48} className="mb-4 opacity-50" />
                                <p>Coming Soon!</p>
                                <p className="text-sm mt-1">We are updating this section.</p>
                            </>
                        )}
                    </div>
                ) : (
                    <div key={activeCategory} className="animate-in slide-in-from-right-4 fade-in duration-500">
                        {displayedItems.map(item => (
                            <div
                                key={item.id}
                                onClick={() => onProductClick(item)}
                                className="bg-white rounded-3xl p-3 mb-4 flex gap-4 shadow-sm border border-[#E6E0D5] hover:border-[#D4A017]/30 transition-all cursor-pointer group"
                            >
                                <div className="h-28 w-28 rounded-2xl overflow-hidden flex-shrink-0 relative">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-md px-1.5 py-0.5 rounded-md flex items-center gap-0.5 border border-[#E6E0D5]/50 shadow-sm">
                                        <Star size={8} className="text-[#D4A017] fill-[#D4A017]" />
                                        <span className="text-[#0F2E1A] text-[9px] font-bold">{item.rating || '4.5'}</span>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <div className={`w-3 h-3 border ${item.isVeg ? 'border-green-500' : 'border-red-500'} flex items-center justify-center p-[1px]`}>
                                                <div className={`w-full h-full rounded-full ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            </div>
                                            <h4 className="text-[#0F2E1A] font-serif text-lg font-bold line-clamp-1">{item.name}</h4>
                                        </div>
                                        <p className="text-[#0F2E1A]/60 text-xs capitalize mb-1">{item.category.replace('-', ' ')}</p>
                                        <p className="text-[#0F2E1A]/50 text-[10px] line-clamp-2 leading-relaxed font-medium">{item.description}</p>
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-[#D4A017] font-bold text-lg">₹{item.price}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart(item);
                                            }}
                                            className="w-8 h-8 bg-[#0F2E1A] rounded-full flex items-center justify-center text-white hover:bg-[#D4A017] transition-colors shadow-lg shadow-[#0F2E1A]/10"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Menu;