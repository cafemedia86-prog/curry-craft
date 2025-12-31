import React from 'react';
import { X, Check } from 'lucide-react';
import { DishFilter } from '../types';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    filters: DishFilter;
    onApply: (filters: DishFilter) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, filters, onApply }) => {
    const [tempFilters, setTempFilters] = React.useState<DishFilter>(filters);

    if (!isOpen) return null;

    const handleApply = () => {
        onApply(tempFilters);
        onClose();
    };

    const Option: React.FC<{
        label: string,
        active: boolean,
        onClick: () => void
    }> = ({ label, active, onClick }) => (
        <button
            onClick={onClick}
            className={`flex items-center justify-between w-full p-4 rounded-2xl transition-all duration-300 border ${active
                    ? 'bg-[#0F2E1A] border-[#D4A017] text-[#D4A017] shadow-lg shadow-black/10'
                    : 'bg-white border-[#E6E0D5] text-[#0F2E1A]/70 hover:border-[#0F2E1A]/30'
                }`}
        >
            <span className="font-medium">{label}</span>
            {active && <Check size={20} />}
        </button>
    );

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-0 sm:p-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md bg-[#F5F1E8] rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom duration-500 overflow-hidden border-t sm:border border-[#D4A017]/20">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-serif font-bold text-[#0F2E1A]">Refine Menu</h2>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                        <X size={24} className="text-[#0F2E1A]" />
                    </button>
                </div>

                <div className="space-y-6 max-h-[70vh] overflow-y-auto hide-scrollbar pb-6">
                    {/* Dish Type */}
                    <div>
                        <h3 className="text-sm font-bold text-[#0F2E1A]/40 uppercase tracking-widest mb-3 px-1">Dietary Preference</h3>
                        <div className="grid grid-cols-1 gap-2">
                            <Option
                                label="All Dishes"
                                active={tempFilters.type === 'all'}
                                onClick={() => setTempFilters({ ...tempFilters, type: 'all' })}
                            />
                            <Option
                                label="Pure Veg"
                                active={tempFilters.type === 'veg'}
                                onClick={() => setTempFilters({ ...tempFilters, type: 'veg' })}
                            />
                            <Option
                                label="Non-Veg"
                                active={tempFilters.type === 'non-veg'}
                                onClick={() => setTempFilters({ ...tempFilters, type: 'non-veg' })}
                            />
                        </div>
                    </div>

                    {/* Sorting */}
                    <div>
                        <h3 className="text-sm font-bold text-[#0F2E1A]/40 uppercase tracking-widest mb-3 px-1">Sort By</h3>
                        <div className="grid grid-cols-1 gap-2">
                            <Option
                                label="Popularity"
                                active={tempFilters.sortBy === 'popularity'}
                                onClick={() => setTempFilters({ ...tempFilters, sortBy: 'popularity' })}
                            />
                            <Option
                                label="Price: Low to High"
                                active={tempFilters.sortBy === 'priceLow'}
                                onClick={() => setTempFilters({ ...tempFilters, sortBy: 'priceLow' })}
                            />
                            <Option
                                label="Price: High to Low"
                                active={tempFilters.sortBy === 'priceHigh'}
                                onClick={() => setTempFilters({ ...tempFilters, sortBy: 'priceHigh' })}
                            />
                            <Option
                                label="Customer Rating"
                                active={tempFilters.sortBy === 'rating'}
                                onClick={() => setTempFilters({ ...tempFilters, sortBy: 'rating' })}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex pt-4 border-t border-[#E6E0D5]">
                    <button
                        onClick={handleApply}
                        className="w-full bg-[#0F2E1A] text-[#FAF7F0] py-4 rounded-2xl font-bold text-lg shadow-lg shadow-[#0F2E1A]/20 hover:bg-[#1F4A2E] transition-all transform active:scale-95 translate-y-0"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;
