import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHome } from '@/context/HomeContext';
import { getRoutes, getBlogs, getVehicles } from '@/services/api';
import RouteCard from '@/components/cards/RouteCard';

// Import Komponen Form dari folder forms
import AirportSearchForm from '@/components/forms/AirportSearchForm';
import RentalSearchForm from '@/components/forms/RentalSearchForm';
import TourPackageTab from '@/components/forms/TourPackageTab';

// Secara dinamis membaca semua berkas gambar dari folder /public/images/
const localImagesModules = import.meta.glob('/public/images/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default'
});

const localImageUrls = Object.keys(localImagesModules).map((filePath) =>
  filePath.replace('/public', '')
);

const Home = () => {
  const navigate = useNavigate();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroSlides, setHeroSlides] = useState(localImageUrls);

  const { searchQuery } = useHome();

  const [routes, setRoutes] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [vehicles, setVehicles] = useState([]); // State untuk menampung data armada/mobil
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Tab Aktif: 'airport', 'rental', 'tour'
  const [activeTab, setActiveTab] = useState('airport');

  // State kriteria filter aktif untuk slider bawah
  const [searchFilter, setSearchFilter] = useState({ pickup: '', dropoff: '' });

  // Refs
  const sliderRef = useRef(null);

  const [showLeftBtn, setShowLeftBtn] = useState(false);
  const [showRightBtn, setShowRightBtn] = useState(true);

  useEffect(() => {
    // Ambil data Rute, Blog, dan Mobil sekaligus
    Promise.all([
      getRoutes().catch(() => ({ data: { success: false, data: [] } })),
      getBlogs().catch(() => ({ data: { success: false, data: [] } })),
      getVehicles().catch(() => ({ data: { success: false, data: [] } }))
    ])
      .then(([routesRes, blogsRes, vehiclesRes]) => {
        // Simpan data Rute
        if (routesRes.data?.success && Array.isArray(routesRes.data.data)) {
          setRoutes(routesRes.data.data);
        } else if (Array.isArray(routesRes?.data)) {
          setRoutes(routesRes.data);
        }

        // Simpan data Blog (3 artikel terbaru)
        if (blogsRes.data?.success && Array.isArray(blogsRes.data.data)) {
          setBlogs(blogsRes.data.data.slice(0, 3));
        } else if (Array.isArray(blogsRes?.data)) {
          setBlogs(blogsRes.data.slice(0, 3));
        }

        // Simpan data armada/mobil
        if (vehiclesRes.data?.success && Array.isArray(vehiclesRes.data.data)) {
          setVehicles(vehiclesRes.data.data);
        } else if (Array.isArray(vehiclesRes?.data)) {
          setVehicles(vehiclesRes.data);
        }

        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Gagal mengambil data:', err);
        setError('Gagal memuat data perjalanan.');
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
  };

  const getFilteredRoutes = () => {
    let routesList = [...routes];
    if (searchFilter.pickup.trim() !== '' || searchFilter.dropoff.trim() !== '') {
      const p = searchFilter.pickup.toLowerCase().trim();
      const d = searchFilter.dropoff.toLowerCase().trim();
      routesList = routesList.filter((r) => {
        const pickLoc = (r.pickup_location || r.origin || '').toLowerCase();
        const dropLoc = (r.dropoff_location || r.destination || '').toLowerCase();
        const matchPickup = p === '' || pickLoc.includes(p);
        const matchDrop = d === '' || dropLoc.includes(d);
        return matchPickup && matchDrop;
      });
    } else if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      routesList = routesList.filter((r) => {
        const pickLoc = (r.pickup_location || r.origin || '').toLowerCase();
        const dropLoc = (r.dropoff_location || r.destination || '').toLowerCase();
        return pickLoc.includes(q) || dropLoc.includes(q);
      });
    }
    return routesList;
  };

  const filteredRoutes = getFilteredRoutes();

  const updateScrollButtons = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setShowLeftBtn(scrollLeft > 5);
      setShowRightBtn(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    updateScrollButtons();
  }, [filteredRoutes]);

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const container = sliderRef.current;
      const cardWidth = container.firstElementChild?.clientWidth || 280;
      const gap = 16;
      const scrollAmount = cardWidth + gap;
      container.scrollBy({
        left: direction === 'next' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleSelectRoute = (route) => {
    navigate('/pesan', {
      state: {
        jenisLayanan: 'Antar-Jemput',
        pickup: route.pickup_location || route.origin,
        dropoff: route.dropoff_location || route.destination,
        price: Number(route.price || 0)
      }
    });
  };

  return (
    <div className="bg-[#F2F4F7] text-slate-800 min-h-screen">
      {/* HERO SECTION */}
      <section className="relative min-h-[480px] md:min-h-[520px] flex items-center justify-center px-3.5 sm:px-6 py-10 md:py-20 bg-slate-900 pt-20 sm:pt-24">
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
                style={{ imageRendering: 'auto' }}
              />
            ))
          ) : (
            <div className="absolute inset-0 bg-slate-800" />
          )}
          <div className="absolute inset-0 bg-slate-950/45 backdrop-brightness-95" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto">
          <h1 className="text-center text-white text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 sm:mb-8 drop-shadow-lg tracking-tight leading-snug">
            Pilihan Terbaik Jelajahi Keindahan Lombok
          </h1>

          <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-2xl border border-slate-200/80 relative z-20">

            {/* TAB NAVIGASI MOBILE */}
            <div className="block md:hidden bg-white rounded-2xl p-1 mb-4">
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-2.5 px-1">
                Pilih Layanan
              </p>
              <div className="grid grid-cols-3 gap-x-2 text-center items-start justify-items-center">
                <button
                  type="button"
                  onClick={() => handleTabClick('airport')}
                  className="flex flex-col items-center group w-full cursor-pointer"
                >
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center text-base transition-all mb-1 shrink-0 ${
                      activeTab === 'airport'
                        ? 'bg-[#0194F3] text-white shadow-md shadow-sky-500/20 scale-105'
                        : 'bg-sky-50 text-[#0194F3] border border-sky-100 hover:bg-sky-100/80'
                    }`}
                  >
                    <i className="fa-solid fa-plane-departure"></i>
                  </div>
                  <span
                    className={`text-[10px] leading-tight truncate w-full px-0.5 ${
                      activeTab === 'airport' ? 'font-extrabold text-[#0194F3]' : 'font-bold text-slate-700'
                    }`}
                  >
                    Antar-Jemput
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabClick('rental')}
                  className="flex flex-col items-center group w-full cursor-pointer"
                >
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center text-base transition-all mb-1 shrink-0 ${
                      activeTab === 'rental'
                        ? 'bg-[#0194F3] text-white shadow-md shadow-sky-500/20 scale-105'
                        : 'bg-sky-50 text-[#0194F3] border border-sky-100 hover:bg-sky-100/80'
                    }`}
                  >
                    <i className="fa-solid fa-car-side"></i>
                  </div>
                  <span
                    className={`text-[10px] leading-tight truncate w-full px-0.5 ${
                      activeTab === 'rental' ? 'font-extrabold text-[#0194F3]' : 'font-bold text-slate-700'
                    }`}
                  >
                    Sewa Mobil
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabClick('tour')}
                  className="flex flex-col items-center group w-full cursor-pointer"
                >
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center text-base transition-all mb-1 shrink-0 ${
                      activeTab === 'tour'
                        ? 'bg-[#0194F3] text-white shadow-md shadow-sky-500/20 scale-105'
                        : 'bg-sky-50 text-[#0194F3] border border-sky-100 hover:bg-sky-100/80'
                    }`}
                  >
                    <i className="fa-solid fa-map-location-dot"></i>
                  </div>
                  <span
                    className={`text-[10px] leading-tight truncate w-full px-0.5 ${
                      activeTab === 'tour' ? 'font-extrabold text-[#0194F3]' : 'font-bold text-slate-700'
                    }`}
                  >
                    Paket Tour
                  </span>
                </button>
              </div>
            </div>

            {/* TAB NAVIGASI DESKTOP */}
            <div className="hidden md:flex gap-2 border-b border-slate-200 pb-3.5 mb-5 overflow-x-auto">
              <button
                type="button"
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'airport'
                    ? 'bg-[#0194F3] text-white'
                    : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                onClick={() => handleTabClick('airport')}
              >
                <i className="fa-solid fa-plane-departure"></i> Antar-Jemput
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'rental'
                    ? 'bg-[#0194F3] text-white'
                    : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                onClick={() => handleTabClick('rental')}
              >
                <i className="fa-solid fa-car-side"></i> Sewa Mobil
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === 'tour'
                    ? 'bg-[#0194F3] text-white'
                    : 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                onClick={() => handleTabClick('tour')}
              >
                <i className="fa-solid fa-map-location-dot"></i> Paket Tour Lombok
              </button>
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'airport' && (
              <AirportSearchForm
                routes={routes}
                onSearch={(filter) => setSearchFilter(filter)}
              />
            )}
            {activeTab === 'rental' && (
              <RentalSearchForm
                routes={routes}
                armadas={vehicles}
                vehicles={vehicles}
              />
            )}
            {activeTab === 'tour' && <TourPackageTab />}
          </div>
        </div>
      </section>

      {/* SECTION HASIL RUTE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10" id="routes-section">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {searchFilter.pickup || searchFilter.dropoff ? 'Hasil Pencarian Perjalanan' : 'Rute Penjemputan Populer'}
          </h2>
        </div>

        {isLoading && (
          <div className="text-center py-12 text-slate-500">
            <i className="fa-solid fa-spinner fa-spin mr-2 text-[#0194F3]"></i> Memuat rute...
          </div>
        )}

        {error && <div className="text-center py-6 text-red-500">{error}</div>}

        {!isLoading && !error && filteredRoutes.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            Rute perjalanan yang Anda cari tidak ditemukan.
          </div>
        )}

        {/* SLIDER RUTE PERJALANAN */}
        {!isLoading && !error && filteredRoutes.length > 0 && (
          <div className="relative group/slider">
            {showLeftBtn && (
              <button
                type="button"
                onClick={() => scrollSlider('prev')}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 hover:bg-[#0194F3] text-slate-800 hover:text-white shadow-lg border border-slate-200 transition-all flex items-center justify-center cursor-pointer backdrop-blur-xs hover:scale-110"
                title="Sebelumnya"
              >
                <i className="fa-solid fa-chevron-left text-sm"></i>
              </button>
            )}

            {showRightBtn && (
              <button
                type="button"
                onClick={() => scrollSlider('next')}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/95 hover:bg-[#0194F3] text-slate-800 hover:text-white shadow-lg border border-slate-200 transition-all flex items-center justify-center cursor-pointer backdrop-blur-xs hover:scale-110"
                title="Berikutnya"
              >
                <i className="fa-solid fa-chevron-right text-sm"></i>
              </button>
            )}

            <div
              ref={sliderRef}
              onScroll={updateScrollButtons}
              className="flex gap-4 sm:gap-5 overflow-x-auto scroll-smooth pb-4 pt-1 px-1 no-scrollbar scrollbar-none snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filteredRoutes.map((route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  onSelectRoute={handleSelectRoute}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
