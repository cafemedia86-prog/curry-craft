import React from 'react';
import { CATEGORIES } from '../constants';
import {
  UtensilsCrossed,
  Pizza,
  Soup,
  Salad,
  Sandwich,
  Wine,
  Flame,
  CookingPot,
  Layers,
  Wheat
} from 'lucide-react';

interface CategoryRailProps {
  activeCategory: string;
  onSelect: (id: string) => void;
  onSeeAll?: () => void;
}

const CategoryRail: React.FC<CategoryRailProps> = ({ activeCategory, onSelect }) => {

  const getIcon = (id: string) => {
    switch (id) {
      case 'main-course': return <CookingPot size={22} />;
      case 'paneer': return <UtensilsCrossed size={22} />; // Paneer dishes
      case 'breads': return <Wheat size={22} />; // Roti/Naan
      case 'rice': return <Soup size={22} />; // Bowl shape for rice
      case 'combos': return <Layers size={22} />;
      case 'parathas': return <Pizza size={22} />; // Flatbread shape
      case 'tandoori': return <Flame size={22} />;
      case 'sides': return <Salad size={22} />;
      case 'sandwich': return <Sandwich size={22} />;
      case 'drinks': return <Wine size={22} />;
      default: return <UtensilsCrossed size={22} />;
    }
  };

  return (
    <section className="mb-2">
      <div className="flex items-center px-5 mb-4">
        <h3 className="text-xl font-sans font-bold text-[#0F2E1A] tracking-wide">Categories</h3>
      </div>

      <div className="flex overflow-x-auto gap-5 px-5 pb-4">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className="flex flex-col items-center gap-3 flex-shrink-0 group"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 border ${isActive
                  ? 'bg-[#0F2E1A] border-[#D4A017] text-[#D4A017] shadow-lg shadow-black/10'
                  : 'bg-white border-[#E6E0D5] text-[#1F4A2E] hover:border-[#1F4A2E]/40'
                }`}>
                {getIcon(cat.id)}
              </div>
              <span className={`text-xs font-medium text-center truncate w-20 ${isActive ? 'text-[#D4A017] font-bold' : 'text-[#0F2E1A]/70'}`}>
                {cat.label.split(' ')[0]}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  );
};

export default CategoryRail;