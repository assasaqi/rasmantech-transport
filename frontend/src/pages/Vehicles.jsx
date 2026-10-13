import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { getVehicles } from '@/services/api';
import RentalCard from '@/components/cards/RentalCard';

// Secara dinamis membaca semua berkas gambar hero dari folder /public/images/
const localImagesModules = import.meta.glob('/public/images/*.{png,jpg,jpeg,webp,avif}', {
    eager: true,
    import: 'default'
});

const localImageUrls = Object.keys(localImagesModules).map((filePath) =>
    filePath.replace('/public', '')
);

const Mobil = () => {
    const navigate = useNavigate();
    const locationState = useLocation().state || {};
    const [searchParams, setSearchParams] = useSearchParams();

    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State untuk slider hero banner
    const [currentSlide, setCurrentSlide] = useState(0);
    const [heroSlides] = useState(localImageUrls);

    // Ambil parameter pencarian dari Query URL atau Location State
    const filterLocation = searchParams.get('location') || locationState.location || locationState.pickupLoc || '';
    const filterArmada = searchParams.get('armada') || locationState.armada || locationState.armadaName || '';
    const filterDuration = searchParams.get('duration') || locationState.duration || '';

    // State pencarian teks langsung (Search Input)
    const [searchTerm, setSearchTerm] = useState('');

    // Auto slide timer untuk Hero Banner
    useEffect(() => {
        if (heroSlides.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [heroSlides.length]);

    useEffect(() => {
        let isMounted = true;

        getVehicles()
            .then((res) => {
                if (isMounted) {
                    if (res.data?.success) {
                        setVehicles(res.data.data || []);
                    } else {
                        setError('Gagal memuat data armada.');
                    }
                    setLoading(false);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    console.error('Gagal mengambil data armada:', err);
                    setError('Gagal memuat data armada dari server.');
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    // Filter Armada berdasarkan Filter dari Form + Teks Pencarian Input
    const filteredVehicles = useMemo(() => {
        return vehicles.filter((car) => {
            const carName = (car.name || car.nama_armada || '').toLowerCase();

            // Filter Armada dari Form
            const matchesArmadaFilter = !filterArmada || carName.includes(filterArmada.toLowerCase());

            // Filter Kata Kunci Teks dari Search Input Bar
            const matchesSearchInput = !searchTerm || carName.includes(searchTerm.toLowerCase());

            return matchesArmadaFilter && matchesSearchInput;
        });
    }, [vehicles, filterArmada, searchTerm]);

    const handleResetFilter = () => {
        setSearchTerm('');
        setSearchParams({});
        navigate(window.location.pathname, { replace: true, state: {} });
    };

    const handleSelectCar = (car) => {
        const durationNumber = Number(filterDuration) || 1;
        const pricePerDay = Number(car.price_per_day || 0);

        navigate('/pesan', {
            state: {
                jenisLayanan: 'Sewa Mobil',
                carType: car.name,
                namaArmada: car.name,
                price: pricePerDay,
                totalPrice: pricePerDay * durationNumber,
                location: filterLocation || 'Area Lombok',
                duration: durationNumber,
                vehicleId: car.id
            }
        });
    };

    const hasActiveFilter = Boolean(filterLocation || filterArmada || filterDuration);

    // Format Teks Filter Aktif
    const formatFilterText = () => {
        const parts = [];
        if (filterLocation) parts.push(filterLocation);
        if (filterArmada) parts.push(filterArmada);
        if (filterDuration) parts.push(`${filterDuration} Hari`);
        return parts.join(' ➔ ');
    };

    return (
        <div className="w-full min-h-screen bg-[#F2F4F7] text-slate-800 pb-16">

            {/* HERO BANNER SECTION (TINGGI DISESUAIKAN PRESISI) */}
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

                {/* JUDUL HERO BANNER SESUAI ISI HALAMAN */}
                <div className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-center text-center pb-2 sm:pb-4">
                    <h1 className="text-center text-white text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold drop-shadow-lg tracking-tight leading-snug">
                        Armada Mobil di Lombok
                    </h1>
                </div>
            </section>

            {/* KOTAK PENCARIAN (MELAYANG DI PERTENGAHAN BANNER & KONTAINER CARD) */}
            <div className="relative z-20 max-w-md sm:max-w-lg mx-auto px-4 -mt-6 sm:-mt-7">
                <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl px-3.5 sm:px-4 py-2.5 flex items-center gap-2 shadow-xl focus-within:border-[#00a2ff] focus-within:ring-2 focus-within:ring-sky-200 transition-all">
                    <i className="fa-solid fa-magnifying-glass text-[#0194F3] text-xs sm:text-sm shrink-0"></i>

                    {/* BADGE FILTER AKTIF */}
                    {hasActiveFilter && (
                        <div className="bg-sky-50 border border-sky-200 text-sky-900 text-[11px] font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 shrink-0 max-w-[140px] sm:max-w-[220px] truncate">
                            <span className="truncate">Filter: {formatFilterText()}</span>
                        </div>
                    )}

                    {/* INPUT TEKS PENCARIAN */}
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={hasActiveFilter ? "Cari lagi..." : "Cari armada / jenis mobil..."}
                        className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none min-w-0"
                    />

                    {/* TOMBOL CLEAR QUERY TEKS */}
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm('')}
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
                            className="text-xs text-[#00a2ff] hover:text-blue-700 font-extrabold shrink-0 transition-colors cursor-pointer pl-2.5 border-l border-slate-200"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* SECTION DAFTAR ARMADA */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">

                {/* INDIKATOR LOADING & ERROR */}
                {loading && (
                    <div className="text-center py-16 text-slate-500">
                        <i className="fa-solid fa-spinner fa-spin mr-2 text-[#00a2ff] text-xl"></i>
                        <span className="font-semibold text-sm">Memuat daftar armada...</span>
                    </div>
                )}

                {error && (
                    <div className="text-center py-10 text-red-500 font-semibold bg-red-50 rounded-2xl border border-red-100">
                        {error}
                    </div>
                )}

                {/* TAMPILAN JIKA TIDAK ADA HASIL */}
                {!loading && !error && filteredVehicles.length === 0 && (
                    <div className="bg-white rounded-3xl p-8 text-center border border-slate-200/80 shadow-xs my-6 max-w-md mx-auto">
                        <i className="fa-solid fa-car-side text-4xl text-slate-300 mb-3"></i>
                        <p className="text-slate-700 font-bold text-sm">
                            Armada mobil tidak ditemukan.
                        </p>
                        <button
                            type="button"
                            onClick={handleResetFilter}
                            className="mt-4 text-xs bg-[#00a2ff] hover:bg-sky-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all cursor-pointer shadow-2xs"
                        >
                            Tampilkan Semua Armada
                        </button>
                    </div>
                )}

                {/* DAFTAR CARD ARMADA DALAM GRID (2 KOLOM MOBILE, 5 KOLOM LAPTOP) */}
                {!loading && !error && filteredVehicles.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                        {filteredVehicles.map((car) => (
                            <RentalCard
                                key={car.id}
                                car={car}
                                filterDuration={filterDuration}
                                onSelect={handleSelectCar}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Mobil;
