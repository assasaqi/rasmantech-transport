import React from 'react';
import { API_BASE_URL } from '@/services/api';

const RentalCard = ({ car, filterDuration, onSelect }) => {
    const isAutomatic = (car?.transmission || 'Automatic').toLowerCase().includes('auto');
    const capacity = car?.capacity || 6;
    const luggage = car?.luggage || 2;
    const durationNumber = Number(filterDuration) || 1;
    const totalPrice = Number(car?.price_per_day || car?.price || 0) * durationNumber;

    // Status armada
    const statusText = car?.status || car?.status_armada || (car?.is_available === false ? 'Tidak Tersedia' : 'Siap dipesan');

    // Helper Konfigurasi Badge Status
    const getStatusConfig = (statusStr, isAvailable) => {
        const lower = String(statusStr || '').toLowerCase();

        if (
            isAvailable === false ||
            lower.includes('tidak') ||
            lower.includes('disewa') ||
            lower.includes('booked') ||
            lower.includes('penuh')
        ) {
            return {
                badgeBg: 'bg-rose-500/90 text-white backdrop-blur-md',
                iconClass: 'fa-solid fa-circle-xmark',
                isAvailable: false
            };
        }

        if (lower.includes('pending') || lower.includes('proses') || lower.includes('perbaikan') || lower.includes('maintenance')) {
            return {
                badgeBg: 'bg-amber-500/90 text-white backdrop-blur-md',
                iconClass: 'fa-solid fa-triangle-exclamation',
                isAvailable: false
            };
        }

        return {
            badgeBg: 'bg-emerald-500/90 text-white backdrop-blur-md',
            iconClass: 'fa-solid fa-circle-check',
            isAvailable: true
        };
    };

    const statusConfig = getStatusConfig(statusText, car?.is_available);

    // Helper URL Gambar Dinamis
    const getImageUrl = (vehicle) => {
        const imageUrl = typeof vehicle === 'string' ? vehicle : vehicle?.image_url || vehicle?.image || vehicle?.image_path || '';
        if (!imageUrl) return 'https://placehold.co/400x250?text=Armada+Mobil';

        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return encodeURI(imageUrl);
        }

        let baseUrl = '';
        if (API_BASE_URL) {
            baseUrl = API_BASE_URL.replace(/\/api\/?$/, '');
        } else if (typeof window !== 'undefined') {
            baseUrl = window.location.origin;
        }

        const fullUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
        return encodeURI(fullUrl);
    };

    return (
        <div
            onClick={() => statusConfig.isAvailable && onSelect(car)}
            className={`w-full bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-md overflow-hidden flex flex-col justify-between transition-all duration-300 group ${
                statusConfig.isAvailable ? 'cursor-pointer hover:-translate-y-1' : 'opacity-75 cursor-not-allowed'
            }`}
        >
            {/* GAMBAR DENGAN ASPECT RATIO 4:3 */}
            <div className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden shrink-0">
                <img
                    src={getImageUrl(car)}
                    alt={car?.name || 'Mobil'}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* BADGE STATUS */}
                <div className="absolute top-2 left-2 z-10">
                    <span className={`inline-flex items-center gap-1 text-[8px] sm:text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs ${statusConfig.badgeBg}`}>
                        <i className={`${statusConfig.iconClass} text-[8px]`}></i>
                        <span className="capitalize">{statusText}</span>
                    </span>
                </div>
            </div>

            {/* DETAIL KONTEN */}
            <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1 gap-1.5">
                <div className="space-y-1">
                    {/* NAMA MOBIL */}
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug line-clamp-2 group-hover:text-[#0194F3] transition-colors">
                        {car?.name}
                    </h3>

                    {/* SPESIFIKASI */}
                    <div className="flex flex-wrap items-center gap-1 text-slate-500 font-semibold text-[8px] sm:text-[9px]">
                        <span className="inline-flex items-center gap-0.5 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                            <i className="fa-solid fa-users text-[#0194F3]"></i>
                            {capacity}
                        </span>
                        <span className="inline-flex items-center gap-0.5 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                            <i className="fa-solid fa-suitcase text-[#0194F3]"></i>
                            {luggage}
                        </span>
                        <span className="inline-flex items-center gap-0.5 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 uppercase">
                            <i className="fa-solid fa-gear text-[#0194F3]"></i>
                            {isAutomatic ? 'AT' : 'MT'}
                        </span>
                    </div>
                </div>

                {/* HARGA TEKS (TOMBOL PESAN DIHAPUS & TEKS HARGA DIPERKECIL) */}
                <div className="pt-1.5 border-t border-slate-100 mt-auto">
                    <span className="text-[8px] font-semibold text-slate-400 block uppercase tracking-wider">Mulai Dari</span>
                    <div className="flex items-baseline gap-0.5 truncate">
                        <span className="text-xs sm:text-sm font-black text-[#FF5E1F] truncate">
                            Rp {totalPrice.toLocaleString('id-ID')}
                        </span>
                        <span className="text-[8px] sm:text-[9px] text-slate-400 font-medium shrink-0">
                            /{durationNumber > 1 ? `${durationNumber}hr` : 'hr'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RentalCard;
