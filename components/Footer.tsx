import React from 'react';
import { Phone, MapPin, Clock, Instagram, Facebook } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer id="contact" className="bg-[#012019] text-green-100/70 pt-20 pb-10 border-t border-green-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          
          {/* Brand */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
               <div className="w-12 h-12 border-2 border-amber-500/50 rounded-full flex items-center justify-center">
                    <span className="text-amber-500 font-serif font-bold text-2xl">D</span>
                </div>
                <div>
                     <h3 className="text-xl font-serif text-amber-400 tracking-widest">DDH</h3>
                     <p className="text-xs uppercase tracking-[0.3em] text-white">Curry Craft</p>
                </div>
            </div>
            <p className="leading-relaxed mb-6 font-light">
              We bring the royal heritage of Indian culinary art to your plate. 
              Authenticity, quality, and passion in every bite.
            </p>
            <div className="flex gap-4 justify-center md:justify-start">
               <a href="#" className="w-10 h-10 rounded-full bg-green-900 flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all"><Instagram size={18} /></a>
               <a href="#" className="w-10 h-10 rounded-full bg-green-900 flex items-center justify-center hover:bg-amber-600 hover:text-white transition-all"><Facebook size={18} /></a>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center">
            <h4 className="text-white font-serif text-lg mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex flex-col items-center gap-2">
                <MapPin className="text-amber-500" size={20} />
                <span>123 Culinary Avenue, Food District</span>
              </li>
              <li className="flex flex-col items-center gap-2">
                <Phone className="text-amber-500" size={20} />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex flex-col items-center gap-2">
                 <span className="text-amber-500 font-bold">@</span>
                <span>info@ddhcurrycraft.com</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div className="text-center md:text-right">
            <h4 className="text-white font-serif text-lg mb-6">Opening Hours</h4>
            <ul className="space-y-2">
              <li className="flex items-center justify-center md:justify-end gap-2">
                <Clock size={16} className="text-amber-500" />
                <span>Mon - Sun</span>
              </li>
              <li className="text-xl text-white font-serif">11:00 AM - 11:00 PM</li>
              <li className="mt-4 text-sm text-amber-500/80 italic">Happy Hours: 4 PM - 7 PM</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-green-900/50 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} DDH Curry Craft. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
