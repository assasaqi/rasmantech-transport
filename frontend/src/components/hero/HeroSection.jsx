import React, { useState, useEffect } from 'react';

const localImagesModules = import.meta.glob('/public/images/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default'
});

const localImageUrls = Object.keys(localImagesModules).map((filePath) =>
  filePath.replace('/public', '')
);

const HeroSection = ({ children, activeTab, onTabChange }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroSlides] = useState(localImageUrls);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <section className="relative min-h-[480px] md:min-h-[520px] flex items-center justify-center px-4 py-12 md:py-20 bg-slate-900 pt-20 sm:pt-24">
      <div className="absolute inset-0 z-0 overflow-hidden">
        {heroSlides.length > 0 ? (
          heroSlides.map((imagePath, index) => (
            <img
              key={index}
              src={imagePath}
              alt="Lombok Background"
              translate="no"
              className={`notranslate absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ease-in-out blur-xs scale-105 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))
        ) : (
          <div className="absolute inset-0 bg-slate-800" />
        )}
        <div className="absolute inset-0 bg-slate-950/45 backdrop-brightness-95" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <h1 className="text-center text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-8 drop-shadow-lg tracking-tight leading-snug">
          Pilihan Terbaik Jelajahi Keindahan Lombok
        </h1>

        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-2xl border border-white/20 relative z-20">
          <div className="flex gap-2 border-b border-slate-200 pb-3.5 mb-5 overflow-x-auto">
            <button
              type="button"
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'airport'
                  ? 'bg-[#0194F3] text-white'
                  : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              onClick={() => onTabChange('airport')}
            >
              <i className="fa-solid fa-plane-arrival"></i> Antar-Jemput
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'rental'
                  ? 'bg-[#0194F3] text-white'
                  : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              onClick={() => onTabChange('rental')}
            >
              <i className="fa-solid fa-car"></i> Sewa Mobil
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === 'tour'
                  ? 'bg-[#0194F3] text-white'
                  : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              onClick={() => onTabChange('tour')}
            >
              <i className="fa-solid fa-route"></i> Paket Tour Lombok
            </button>
          </div>

          {children}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
