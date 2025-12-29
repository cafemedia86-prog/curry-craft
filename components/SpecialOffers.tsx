import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Copy, Check } from 'lucide-react';

interface Offer {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  discount_type: 'PERCENTAGE' | 'FIXED';
  discount_value: number;
  image_url: string;
}

const SpecialOffers: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchOffers = async () => {
      const { data } = await supabase
        .from('offers')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setOffers(data);
      }
      setLoading(false);
    };

    fetchOffers();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading || offers.length === 0) return null;

  return (
    <section className="pt-6 pb-4 pl-5">
      <div className="flex items-end pr-5 mb-4">
        <h3 className="text-xl font-sans font-bold text-green-50 tracking-wide">Special Offers</h3>
      </div>

      <div className="overflow-x-auto flex gap-4 pb-4 pr-5 snap-x hide-scrollbar">
        {offers.map((offer) => (
          <div key={offer.id} className="snap-center min-w-[85%] md:min-w-[380px] h-44 bg-[#034435] rounded-3xl relative overflow-hidden shadow-lg shadow-black/20 flex-shrink-0 flex items-center p-5 border border-green-800/30 group">
            {/* Left Content */}
            <div className="flex-1 z-10 flex flex-col items-start gap-1">
              <span className="text-green-300/80 text-xs font-medium uppercase tracking-wider">{offer.subtitle || 'Limited Time'}</span>
              <h4 className="text-xl font-serif text-white leading-tight line-clamp-2">{offer.title}</h4>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-green-200 text-sm">{offer.discount_type === 'PERCENTAGE' ? 'Up to' : 'Flat'}</span>
                <span className="text-3xl font-bold text-amber-400">
                  {offer.discount_type === 'PERCENTAGE' ? `${offer.discount_value}%` : `₹${offer.discount_value}`}
                </span>
              </div>
              <button
                onClick={() => handleCopy(offer.code)}
                className="bg-amber-500 text-[#022c22] px-4 py-2 rounded-full text-xs font-bold shadow-lg hover:bg-amber-400 transition-colors flex items-center gap-2 active:scale-95 transform"
              >
                {copiedCode === offer.code ? <Check size={14} /> : <Copy size={14} />}
                {copiedCode === offer.code ? 'Copied!' : `Code: ${offer.code}`}
              </button>
            </div>

            {/* Right Image */}
            <div className="w-36 h-36 rounded-full border-4 border-[#022c22]/50 shadow-2xl overflow-hidden -mr-8 flex-shrink-0 bg-stone-800">
              <img
                src={offer.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80'}
                alt={offer.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>

            {/* Decorative bg blobs */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-green-500/5 rounded-full blur-2xl"></div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SpecialOffers;