import React from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/services/api';

const RouteCard = ({ route, travelDate, onSelectRoute }) => {
  const navigate = useNavigate();

  // Helper mendapatkan URL gambar
  const getImageUrl = (routeData) => {
    const imageUrl = routeData?.image_url || routeData?.image || routeData?.image_path || '';
    if (!imageUrl) return 'https://placehold.co/400x250?text=Transport+Lombok';
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

  // Helper format tanggal
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    if (!y || !m || !d) return dateStr;
    const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
    return dateObj.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // LOGIKA PENGIRIMAN DATA KHUSUS KE FORM ANTAR-JEMPUT
  const handleCardClick = () => {
    if (onSelectRoute) {
      onSelectRoute(route);
    } else {
      navigate('/pesan', {
        state: {
          jenisLayanan: 'Antar-Jemput',
          pickup: route.pickup_location,
          dropoff: route.dropoff_location,
          price: Number(route.price || 0),
          travelDate: travelDate || ''
        }
      });
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="snap-start shrink-0 w-[calc(50%-6px)] sm:w-[280px] lg:w-[calc(25%-15px)] group bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 border border-slate-200/80 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Gambar disesuaikan proporsinya di mobile (h-28) */}
        <div className="relative h-28 sm:h-44 overflow-hidden bg-slate-100">
          <img
            src={getImageUrl(route)}
            alt={`${route.pickup_location} - ${route.dropoff_location}`}
            translate="no"
            className="notranslate w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>

        {/* Padding dan font disesuaikan di mobile agar teks tidak terpotong */}
        <div className="p-2.5 sm:p-4">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#0194F3] transition-colors line-clamp-2 sm:line-clamp-1 mb-1 leading-snug">
            {route.pickup_location} - {route.dropoff_location}
          </h3>

          {travelDate && (
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400 mb-1.5 sm:mb-2 font-medium">
              <i className="fa-regular fa-calendar text-[9px] sm:text-[10px] text-amber-600"></i>
              <span>{formatDisplayDate(travelDate)}</span>
            </div>
          )}

          <div className="pt-0.5 sm:pt-1">
            <span className="text-xs sm:text-lg font-extrabold text-[#F96D01] block leading-tight">
              Rp {Number(route.price || 0).toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteCard;
