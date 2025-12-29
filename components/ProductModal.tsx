import React, { useState } from 'react';
import { MenuItem } from '../types';
import { ArrowLeft, Heart, Star, MessageSquare, Phone, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface ProductModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ item, onClose }) => {
  const { addToCart } = useCart();
  const [selectedWeight, setSelectedWeight] = useState('Full');
  
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#022c22] flex flex-col animate-in slide-in-from-bottom duration-300">
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
        <button onClick={onClose} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30">
            <ArrowLeft size={20} />
        </button>
        <div className="flex gap-4">
             <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30">
                <Heart size={20} />
            </button>
            <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30">
                <ShoppingBag size={20} />
            </button>
        </div>
      </div>

      {/* Main Image Area */}
      <div className="h-[45vh] w-full relative">
        <img 
            src={item.image || `https://picsum.photos/seed/${item.id}/600/600`} 
            alt={item.name} 
            className="w-full h-full object-cover" 
        />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#022c22] to-transparent"></div>
        
        {/* Thumbnails Floating */}
        <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-3 px-4">
            {[1,2,3,4].map((i) => (
                <div key={i} className={`w-14 h-14 rounded-xl border-2 overflow-hidden bg-green-900 ${i===1 ? 'border-amber-500' : 'border-green-800'}`}>
                    <img src={item.image || `https://picsum.photos/seed/${item.id}/100/100`} className="w-full h-full object-cover" />
                </div>
            ))}
        </div>
      </div>

      {/* Content Body */}
      <div className="flex-1 bg-[#022c22] px-6 pt-12 pb-6 flex flex-col overflow-y-auto rounded-t-[2rem] -mt-6">
        
        {/* Title & Rating */}
        <div className="flex justify-between items-start mb-6">
            <div>
                <span className="text-green-400 text-sm font-medium uppercase tracking-wider">{item.category}</span>
                <h2 className="text-2xl font-serif font-bold text-white mt-1">{item.name}</h2>
            </div>
            <div className="flex items-center gap-1">
                <Star className="fill-amber-400 text-amber-400" size={18} />
                <span className="text-white font-bold text-lg">4.8</span>
            </div>
        </div>

        {/* Seller Info */}
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-green-800/50">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-200 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80" className="w-full h-full object-cover" />
                </div>
                <div>
                    <h4 className="text-white font-bold text-sm">Chef Anjali</h4>
                    <p className="text-green-400/60 text-xs">Curry Specialist</p>
                </div>
            </div>
            <div className="flex gap-3">
                <button className="w-10 h-10 rounded-full bg-green-800 flex items-center justify-center text-amber-400 hover:bg-green-700">
                    <MessageSquare size={18} />
                </button>
                 <button className="w-10 h-10 rounded-full bg-green-800 flex items-center justify-center text-amber-400 hover:bg-green-700">
                    <Phone size={18} />
                </button>
            </div>
        </div>

        {/* Description */}
        <div className="mb-6">
            <h3 className="text-white font-bold mb-2">Description</h3>
            <p className="text-green-200/60 text-sm leading-relaxed">
                {item.description} Prepared with authentic spices and slow-cooked to perfection in our traditional clay vessels to bring out the royal flavors.
            </p>
        </div>

        {/* Select Portion/Weight (Mock) */}
        <div className="mb-8">
            <h3 className="text-white font-bold mb-3">Select Portion</h3>
            <div className="flex gap-3">
                {['Half', 'Full', 'Family'].map((w) => (
                    <button 
                        key={w}
                        onClick={() => setSelectedWeight(w)}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${
                            selectedWeight === w 
                            ? 'bg-amber-600 border-amber-600 text-white' 
                            : 'bg-transparent border-green-800 text-green-400 hover:border-amber-500/50'
                        }`}
                    >
                        {w}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="bg-green-950 p-6 rounded-t-3xl border-t border-green-900 shadow-2xl flex items-center justify-between">
            <div className="flex flex-col">
                <span className="text-green-400/60 text-xs">Total Price</span>
                <span className="text-2xl font-serif font-bold text-white">₹{item.price}</span>
            </div>

            <button 
                onClick={() => { addToCart(item); onClose(); }}
                className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-4 rounded-full font-bold flex items-center gap-3 shadow-lg shadow-amber-900/40 transition-transform transform active:scale-95"
            >
                <ShoppingBag size={20} className="fill-white/20" />
                Add to Cart
            </button>
      </div>
    </div>
  );
};

export default ProductModal;