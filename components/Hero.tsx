import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
            // High quality dark Indian food table spread
            backgroundImage: `url('https://images.unsplash.com/photo-1517244683847-7454b94eefa4?q=80&w=2000&auto=format&fit=crop')` 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#022c22] via-[#022c22]/80 to-[#022c22]/60" />
      </div>

      {/* Decorative Frame */}
      <div className="absolute inset-4 md:inset-12 border border-amber-400/20 pointer-events-none z-10" />
      <div className="absolute inset-6 md:inset-14 border border-amber-400/10 pointer-events-none z-10" />

      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-16">
        <div className="mb-4 flex justify-center">
             {/* Simple ornamental flourish */}
             <svg width="100" height="20" viewBox="0 0 100 20" fill="none" className="text-amber-400">
                <path d="M0 10C25 10 25 0 50 0C75 0 75 10 100 10" stroke="currentColor" strokeWidth="1" />
                <path d="M0 10C25 10 25 20 50 20C75 20 75 10 100 10" stroke="currentColor" strokeWidth="1" />
             </svg>
        </div>

        <h2 className="text-amber-400 font-serif text-lg md:text-xl tracking-[0.2em] uppercase mb-4">Welcome to</h2>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 drop-shadow-lg leading-tight">
          DDH <br className="md:hidden" />
          <span className="text-amber-400">Curry Craft</span>
        </h1>
        <p className="text-green-100/90 text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto leading-relaxed">
          Experience the royal essence of traditional Indian cuisine. 
          Rich spices, slow-cooked gravies, and authentic clay oven breads.
        </p>

        <a 
          href="#menu"
          className="inline-block px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-serif uppercase tracking-widest text-sm transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-amber-500/30"
        >
          Explore Menu
        </a>

         <div className="mt-4 flex justify-center">
             <svg width="100" height="20" viewBox="0 0 100 20" fill="none" className="text-amber-400 rotate-180">
                <path d="M0 10C25 10 25 0 50 0C75 0 75 10 100 10" stroke="currentColor" strokeWidth="1" />
                <path d="M0 10C25 10 25 20 50 20C75 20 75 10 100 10" stroke="currentColor" strokeWidth="1" />
             </svg>
        </div>
      </div>
    </section>
  );
};

export default Hero;