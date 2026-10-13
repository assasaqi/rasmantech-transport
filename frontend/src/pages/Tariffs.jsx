import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRoutes } from '@/services/api';
import { useTariff } from '@/context/TariffContext';

// Secara dinamis membaca semua berkas gambar hero dari folder /public/images/
const localImagesModules = import.meta.glob('/public/images/*.{png,jpg,jpeg,webp,avif}', {
    eager: true,
    import: 'default'
});

const localImageUrls = Object.keys(localImagesModules).map((filePath) =>
    filePath.replace('/public', '')
);

const Tariffs = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Mengambil state filter yang dikirim dari Home.jsx (jika ada)
    const initialFilter = location.state || {};

    const {
        visibleCount,
        setVisibleCount,
        searchQuery,
        setSearchQuery
    } = useTariff();

    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State untuk slider hero banner
    const [currentSlide, setCurrentSlide] = useState(0);
    const [heroSlides] = useState(localImageUrls);

    // State filter lokal dari pencarian Home
    const pickupFilter = initialFilter.pickup || '';
    const dropoffFilter = initialFilter.dropoff || initialFilter.drop || '';
    const travelDate = initialFilter.travelDate || initialFilter.date || '';
    const passengers = initialFilter.passengers || '';

    const getInitialLimit = useCallback(() => (window.innerWidth <= 768 ? 10 : 20), []);

    // Auto slide timer untuk Hero Banner
    useEffect(() => {
        if (heroSlides.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [heroSlides.length]);

    // Inisialisasi visibleCount jika null
    useEffect(() => {
        if (visibleCount === null) {
            setVisibleCount(getInitialLimit());
        }
    }, [visibleCount, setVisibleCount, getInitialLimit]);

    // Fetch data API rute antar-jemput
    useEffect(() => {
        let isMounted = true;

        getRoutes()
            .then((res) => {
                if (isMounted) {
                    if (res.data?.success) {
                        setRoutes(res.data.data || []);
                    } else {
                        setError('Gagal memuat data rute.');
                    }
                    setLoading(false);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    console.error('Gagal mengambil data rute:', err);
                    setError('Gagal memuat data tarif dari server.');
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const handleSelectTariff = (route) => {
        navigate('/pesan', {
            state: {
                jenisLayanan: 'Antar-Jemput',
                pickupLoc: route.pickup_location,
                dropLoc: route.dropoff_location,
                pickup: route.pickup_location,
                drop: route.dropoff_location,
                dropoff: route.dropoff_location,
                price: Number(route.price || 0),
                date: travelDate,
                passengers: passengers
            }
        });
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setVisibleCount(getInitialLimit());
    };

    const handleResetFilter = () => {
        setSearchQuery('');
        setVisibleCount(getInitialLimit());
        navigate(location.pathname, { replace: true, state: {} });
    };

    // Filter pencarian rute gabungan
    const filteredRoutes = useMemo(() => {
        let list = [...routes];

        if (pickupFilter.trim() || dropoffFilter.trim()) {
            const p = pickupFilter.toLowerCase().trim();
            const d = dropoffFilter.toLowerCase().trim();
            list = list.filter((r) => {
                const pickLoc = (r.pickup_location || '').toLowerCase().trim();
                const dropLoc = (r.dropoff_location || '').toLowerCase().trim();
                const matchPickup = !p || pickLoc.includes(p);
                const matchDrop = !d || dropLoc.includes(d);
                return matchPickup && matchDrop;
            });
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter((r) => {
                const dropLoc = (r.dropoff_location || '').toLowerCase();
                const pickupLoc = (r.pickup_location || '').toLowerCase();
                return dropLoc.includes(q) || pickupLoc.includes(q);
            });
        }

        return list;
    }, [routes, pickupFilter, dropoffFilter, searchQuery]);

    const currentLimit = visibleCount ?? getInitialLimit();
    const displayedRoutes = useMemo(
        () => filteredRoutes.slice(0, currentLimit),
        [filteredRoutes, currentLimit]
    );
    const hasMore = currentLimit < filteredRoutes.length;

    // Cek keberadaan filter aktif
    const hasActiveFilter = Boolean(pickupFilter || dropoffFilter || searchQuery);

    // Format Teks Filter Aktif
    const formatFilterText = () => {
        const parts = [];
        if (pickupFilter) parts.push(pickupFilter);
        if (dropoffFilter) parts.push(dropoffFilter);
        if (!pickupFilter && !dropoffFilter && searchQuery) parts.push(`"${searchQuery}"`);
        return parts.join(' ➔ ');
    };

    return (
        <div className="w-full overflow-x-hidden min-h-screen bg-[#F2F4F7] text-slate-800 pb-16">

            {/* HERO BANNER SECTION (TINGGI PROPORSI DAN TIDAK TERLALU KOSONG) */}
            <section className="relative min-h-[260px] sm:min-h-[320px] md:min-h-[360px] flex items-center justify-center px-4 sm:px-6 py-10 sm:py-14 bg-slate-900 pt-20 sm:pt-24">
                {/* BACKGROUND SLIDER IMAGES */}
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

                {/* JUDUL HERO BANNER */}
                <div className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-center text-center pb-2 sm:pb-4">
                    <h1 className="text-center text-white text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold drop-shadow-lg tracking-tight leading-snug">
                        Rute Perjalanan Lombok
                    </h1>
                </div>
            </section>

            {/* KOTAK PENCARIAN (MELAYANG DI PERTENGAHAN BANNER & TABEL) */}
            <div className="relative z-20 max-w-md sm:max-w-lg mx-auto px-4 -mt-6 sm:-mt-7">
                <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-2 shadow-xl focus-within:border-[#0194F3] focus-within:ring-2 focus-within:ring-sky-200 transition-all">
                    <i className="fa-solid fa-magnifying-glass text-[#0194F3] text-xs sm:text-sm shrink-0"></i>

                    {/* BADGE FILTER AKTIF */}
                    {hasActiveFilter && (
                        <div className="bg-sky-50 border border-sky-200 text-sky-900 text-[9px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-lg flex items-center gap-1 shrink-0 max-w-[130px] sm:max-w-[220px] truncate">
                            <span className="truncate">Filter: {formatFilterText()}</span>
                        </div>
                    )}

                    {/* INPUT TEKS PENCARIAN */}
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder={hasActiveFilter ? "Cari rute lagi..." : "Cari rute penjemputan / tujuan..."}
                        className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none min-w-0"
                    />

                    {/* TOMBOL CLEAR QUERY TEKS */}
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 shrink-0 cursor-pointer"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    )}

                    {/* TOMBOL RESET FILTER */}
                    {hasActiveFilter && (
                        <button
                            type="button"
                            onClick={handleResetFilter}
                            className="text-xs text-[#0194F3] hover:text-sky-700 font-extrabold shrink-0 transition-colors cursor-pointer pl-2.5 border-l border-slate-200"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* SECTION DAFTAR TABEL RUTE */}
            <section className="max-w-7xl mx-auto px-3 sm:px-6 pt-8 sm:pt-10">

                {/* INDIKATOR LOADING & ERROR */}
                {loading && (
                    <div className="text-center py-12 text-slate-500 text-[11px] sm:text-sm">
                        <i className="fa-solid fa-spinner fa-spin mr-2 text-[#0194F3]"></i> Memuat tarif rute...
                    </div>
                )}

                {error && (
                    <div className="text-center py-8 text-red-500 text-[11px] sm:text-sm font-semibold">
                        {error}
                    </div>
                )}

                {/* HASIL KOSONG */}
                {!loading && !error && displayedRoutes.length === 0 && (
                    <div className="bg-white rounded-2xl p-5 sm:p-8 text-center border border-slate-200 my-4 max-w-md mx-auto">
                        <i className="fa-solid fa-route text-2xl sm:text-4xl text-slate-300 mb-2 sm:mb-3"></i>
                        <p className="text-slate-600 font-bold text-[11px] sm:text-sm">
                            Tidak ada rute penjemputan yang ditemukan sesuai kriteria pencarian Anda.
                        </p>
                        <button
                            type="button"
                            onClick={handleResetFilter}
                            className="mt-3 text-[11px] sm:text-xs bg-[#0194F3] text-white px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl font-bold hover:bg-sky-600 transition-all cursor-pointer"
                        >
                            Tampilkan Semua Rute
                        </button>
                    </div>
                )}

                {/* TABEL TARIF RUTE */}
                {!loading && !error && displayedRoutes.length > 0 && (
                    <div className="w-full bg-white rounded-lg sm:rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                        <div className="max-h-[400px] sm:max-h-[520px] overflow-y-auto overflow-x-auto scrollbar-thin">
                            <table className="w-full text-left border-collapse min-w-[280px]">
                                {/* HEADER TABEL STICKY */}
                                <thead className="sticky top-0 bg-slate-100/95 backdrop-blur-xs text-slate-600 font-extrabold text-[8px] sm:text-xs uppercase tracking-wider border-b border-slate-200 z-10">
                                    <tr>
                                        <th className="py-2 px-2 sm:py-3 sm:px-4">Penjemputan</th>
                                        <th className="py-2 px-2 sm:py-3 sm:px-4">Tujuan</th>
                                        <th className="py-2 px-2 sm:py-3 sm:px-4">Tarif</th>
                                        <th className="py-2 px-1.5 sm:py-3 sm:px-4 text-center w-10 sm:w-20">Aksi</th>
                                    </tr>
                                </thead>

                                {/* BODY TABEL */}
                                <tbody className="divide-y divide-slate-100 text-[10px] sm:text-sm">
                                    {displayedRoutes.map((route) => (
                                        <tr
                                            key={route.id}
                                            onClick={() => handleSelectTariff(route)}
                                            className="hover:bg-sky-50/70 transition-colors cursor-pointer group"
                                        >
                                            {/* PENJEMPUTAN */}
                                            <td className="py-1.5 px-2 sm:py-3 sm:px-4 font-bold text-slate-800 group-hover:text-[#0194F3] transition-colors leading-tight">
                                                <div className="text-[10px] sm:text-sm line-clamp-2">
                                                    {route.pickup_location}
                                                </div>
                                            </td>

                                            {/* TUJUAN */}
                                            <td className="py-1.5 px-2 sm:py-3 sm:px-4 font-bold text-slate-800 group-hover:text-[#0194F3] transition-colors leading-tight">
                                                <div className="text-[10px] sm:text-sm line-clamp-2">
                                                    {route.dropoff_location}
                                                </div>
                                            </td>

                                            {/* HARGA TARIF */}
                                            <td className="py-1.5 px-2 sm:py-3 sm:px-4 font-extrabold text-[#F96D01] text-[10px] sm:text-base whitespace-nowrap">
                                                Rp {Number(route.price || 0).toLocaleString('id-ID')}
                                            </td>

                                            {/* TOMBOL PESAN (IKON SAJA) */}
                                            <td className="py-1.5 px-1.5 sm:py-3 sm:px-4 text-center">
                                                <button
                                                    type="button"
                                                    title="Pesan Rute"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectTariff(route);
                                                    }}
                                                    className="w-6 h-6 sm:w-8 sm:h-8 mx-auto bg-[#0194F3] hover:bg-sky-600 text-white font-bold rounded-md sm:rounded-lg transition-all shadow-2xs group-hover:shadow-xs active:scale-95 cursor-pointer flex items-center justify-center"
                                                >
                                                    <i className="fa-solid fa-chevron-right text-[9px] sm:text-xs"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TOMBOL TAMPILKAN LEBIH BANYAK RUTE */}
                {hasMore && (
                    <div className="text-center mt-4 sm:mt-6">
                        <button
                            type="button"
                            className="px-4 py-1.5 sm:px-6 sm:py-2.5 rounded-xl border border-[#0194F3] text-[#0194F3] hover:bg-[#0194F3] hover:text-white font-bold text-[10px] sm:text-xs transition-colors duration-200 cursor-pointer shadow-xs"
                            onClick={() => setVisibleCount((prev) => (prev ?? getInitialLimit()) + getInitialLimit())}
                        >
                            Tampilkan Lebih Banyak Rute
                        </button>
                    </div>
                )}

            </section>
        </div>
    );
};

export default Tariffs;
