import React from 'react';

const BookingCard = ({ item, isExpanded, onToggleExpand }) => {
  const bookingCode = item.booking_code || item.bookingCode || item.code || `DFT-${item.id}`;
  const totalPrice = Number(item.total_price || item.totalPrice || item.price || 0);

  const vehicleName = item.vehicle?.name || item.vehicle?.model || item.vehicleName || 'Armada Standar';
  const passengerCount = item.passenger_count || item.passengerCount || item.passengers || 1;

  // Cek jenis layanan (Sewa Mobil vs Antar-Jemput / Tour)
  const rawService = (item.service_type || item.serviceType || '').replace(/_/g, ' ').toLowerCase();
  const isSewaMobil = rawService.includes('sewa') || (!item.route && item.vehicle);

  // Helper format durasi sewa mobil
  const getDurationText = () => {
    if (item.duration) {
      return typeof item.duration === 'number' ? `${item.duration} Hari` : item.duration;
    }
    if (item.notes && item.notes.toLowerCase().includes('durasi')) {
      const match = item.notes.match(/durasi:\s*([^\n,]+)/i);
      if (match && match[1]) return match[1].trim();
    }
    return '1 Hari';
  };

  const pickupAddress =
    item.pickup_address ||
    item.pickupAddress ||
    item.pickup_location ||
    item.pickupLocation ||
    item.route?.pickup_location ||
    item.route?.origin ||
    '-';

  const dropoffAddress =
    item.dropoff_location ||
    item.dropoffLocation ||
    item.route?.dropoff_location ||
    item.route?.destination;

  // Cek apakah lokasi tujuan ada dan valid (bukan '-' atau kosong)
  const hasDropoff = Boolean(dropoffAddress && dropoffAddress.trim() !== '' && dropoffAddress !== '-');

  // Waktu pembuatan pesanan
  const createdAtVal = item.created_at || item.createdAt || item.createdDate;

  // Helper Format Tanggal Mulai (e.g. 15 Mar 2026)
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Helper Format Waktu Pembuatan Pesanan (e.g. 15 Mar 2026, 14:30 WITA)
  const formatCreatedDateTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const dateFormatted = d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const timeFormatted = d.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\./g, ':');
      return `${dateFormatted}, ${timeFormatted} WITA`;
    } catch {
      return dateStr;
    }
  };

  // Helper Format Jam Penjemputan (HH:mm)
  const formatTime = (timeVal) => {
    if (!timeVal) return '';
    if (typeof timeVal === 'string' && timeVal.includes('T')) {
      const dateObj = new Date(timeVal);
      if (!isNaN(dateObj.getTime())) {
        const hours = String(dateObj.getUTCHours()).padStart(2, '0');
        const minutes = String(dateObj.getUTCMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
      }
    }
    if (typeof timeVal === 'string') {
      return timeVal.substring(0, 5);
    }
    return timeVal;
  };

  // Helper Format Judul Layanan
  const getBookingTitle = (data) => {
    if (data.route?.title || data.route?.name) return data.route.title || data.route.name;
    if (data.tour_package?.title || data.tour_package?.name || data.tourPackage?.title) {
      return data.tour_package?.title || data.tour_package?.name || data.tourPackage?.title;
    }
    if (data.vehicle?.name || data.vehicle?.model) return `Sewa ${data.vehicle.name || data.vehicle.model}`;

    const rawService = (data.service_type || data.serviceType || '').replace(/_/g, ' ').toLowerCase();
    if (rawService.includes('sewa')) return 'Sewa Mobil';
    if (rawService.includes('antar')) return 'Antar-Jemput';
    if (rawService.includes('tour') || rawService.includes('paket')) return 'Paket Tour Wisata';

    return data.packageName || data.title || 'Layanan Transportasi & Wisata';
  };

  // Render Badge Status
  const renderStatusBadge = (statusStr) => {
    const rawStatus = (statusStr || 'PENDING').toUpperCase();

    const statusMap = {
      PENDING: { label: 'Menunggu Bayar', bg: 'bg-amber-500/10 text-amber-700 border-amber-300' },
      WAITING_CONFIRMATION: { label: 'Verifikasi Admin', bg: 'bg-sky-500/10 text-sky-700 border-sky-300' },
      CONFIRMED: { label: 'Dikonfirmasi', bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-300' },
      PAID: { label: 'Lunas', bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-300' },
      COMPLETED: { label: 'Selesai', bg: 'bg-indigo-500/10 text-indigo-700 border-indigo-300' },
      CANCELLED: { label: 'Dibatalkan', bg: 'bg-rose-500/10 text-rose-700 border-rose-300' }
    };

    const current = statusMap[rawStatus] || { label: rawStatus, bg: 'bg-slate-100 text-slate-700 border-slate-300' };

    return (
      <span className={`px-1.5 py-0.5 rounded-full text-[9px] sm:text-xs font-semibold border shrink-0 ${current.bg}`}>
        {current.label}
      </span>
    );
  };

  // Render Stepper Status
  const renderStatusStepper = (statusStr) => {
    const st = (statusStr || 'PENDING').toUpperCase();

    if (st === 'CANCELLED') {
      return (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-1.5 text-center text-[10px] sm:text-[11px] text-rose-700 font-medium my-1">
          Pesanan ini telah dibatalkan.
        </div>
      );
    }

    const steps = [
      { key: 'PENDING', label: '1. Bayar' },
      { key: 'WAITING_CONFIRMATION', label: '2. Verifikasi' },
      { key: 'CONFIRMED', label: '3. Siap' },
      { key: 'COMPLETED', label: '4. Selesai' }
    ];

    const getStepIndex = (statusKey) => {
      if (statusKey === 'PENDING') return 0;
      if (statusKey === 'WAITING_CONFIRMATION') return 1;
      if (statusKey === 'CONFIRMED' || statusKey === 'PAID') return 2;
      if (statusKey === 'COMPLETED') return 3;
      return 0;
    };

    const activeIndex = getStepIndex(st);

    return (
      <div className="w-full bg-slate-50 border border-slate-200/60 rounded-lg p-1.5 sm:p-2.5 my-1.5">
        <div className="grid grid-cols-4 gap-0.5 text-center text-[8px] sm:text-xs">
          {steps.map((step, idx) => {
            const isDone = idx <= activeIndex;
            return (
              <div key={step.key} className="flex flex-col items-center">
                <div
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold mb-0.5 text-[8px] sm:text-[10px] transition-colors ${
                    isDone ? 'bg-[#00a2ff] text-white' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isDone ? <i className="fas fa-check text-[7px] sm:text-[9px]"></i> : idx + 1}
                </div>
                <span className={isDone ? 'font-semibold text-slate-800' : 'text-slate-400'}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const pickupDateStr = formatDate(item.pickup_date || item.pickupDate);
  const pickupTimeStr = formatTime(item.pickup_time || item.pickupTime);
  const createdDateStr = formatCreatedDateTime(createdAtVal);

  return (
    <div className="bg-slate-50/80 rounded-xl border border-slate-200/80 overflow-hidden transition-all duration-200 hover:border-sky-300">
      {/* HEADER KARTU PESANAN */}
      <div className="p-2.5 sm:p-4">
        {/* BARIS ATAS: KODE BOOKING & BADGE STATUS */}
        <div className="flex items-center justify-between gap-1.5 mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
              #{bookingCode}
            </span>
            {createdDateStr && (
              <span className="text-[8px] sm:text-[10px] text-slate-400 truncate hidden sm:inline">
                • Dibuat: {createdDateStr}
              </span>
            )}
          </div>
          {renderStatusBadge(item.status)}
        </div>

        {/* INFORMASI TANGGAL DIBUAT (KHUSUS MOBILE) */}
        {createdDateStr && (
          <div className="text-[8px] text-slate-400 mb-1 sm:hidden flex items-center gap-1">
            <i className="far fa-clock text-[8px] text-slate-400"></i>
            <span>Dibuat: {createdDateStr}</span>
          </div>
        )}

        {/* JUDUL LAYANAN & TOTAL HARGA */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="text-xs sm:text-base font-bold text-slate-900 leading-snug truncate">
              {getBookingTitle(item)}
            </h2>

            {/* TANGGAL PENJEMPUTAN (KALENDER) */}
            <p className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <i className="far fa-calendar-alt text-sky-500 text-[9px] sm:text-[10px]"></i>
              <span>{pickupDateStr}</span>
            </p>

            {/* WAKTU PENJEMPUTAN (DI BAWAH KALENDER WITH ICON) */}
            {pickupTimeStr && (
              <p className="text-[9px] sm:text-[10px] font-semibold text-slate-600 flex items-center gap-1 mt-0.5">
                <i className="far fa-clock text-sky-500 text-[8px] sm:text-[9px]"></i>
                <span>{pickupTimeStr}</span>
              </p>
            )}
          </div>

          <div className="text-right shrink-0">
            <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase block">Total</span>
            <span className="text-xs sm:text-base font-extrabold text-[#00a2ff]">
              Rp {totalPrice.toLocaleString('id-ID')}
            </span>
            {/* KETERANGAN NOMINAL BERDASARKAN LAYANAN */}
            <span className="text-[8px] sm:text-[9px] font-semibold text-slate-400 block mt-0.5">
              {isSewaMobil ? `/ ${getDurationText()}` : `/ ${passengerCount} Orang`}
            </span>
          </div>
        </div>

        {/* TOMBOL DETAIL RINGKAS */}
        <div className="mt-2 pt-1.5 border-t border-slate-200/50 flex justify-end">
          <button
            onClick={onToggleExpand}
            className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold border transition-all flex items-center gap-1 ${
              isExpanded
                ? 'bg-sky-50 text-[#00a2ff] border-sky-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>{isExpanded ? 'Sembunyikan' : 'Lihat Detail'}</span>
            <i
              className={`fas fa-chevron-down text-[9px] transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            ></i>
          </button>
        </div>
      </div>

      {/* DETAIL KARTU EXPANDED */}
      {isExpanded && (
        <div className="px-2.5 pb-3 sm:px-4 sm:pb-4 border-t border-slate-200/60 pt-1.5 bg-white">
          {renderStatusStepper(item.status)}

          {/* GRID DINAMIS */}
          <div
            className={`grid grid-cols-2 ${
              hasDropoff ? 'lg:grid-cols-4' : 'sm:grid-cols-3'
            } gap-2 text-[10px] sm:text-xs text-slate-600 my-2 bg-slate-50 p-2 sm:p-3 rounded-lg border border-slate-100`}
          >
            <div>
              <span className="block text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Armada
              </span>
              <p className="font-semibold text-slate-800 mt-0.5 truncate flex items-center gap-1">
                <i className="fas fa-bus text-sky-500 text-[9px]"></i> {vehicleName}
              </p>
            </div>

            {/* KETERANGAN DINAMIS: DURASI (SEWA MOBIL) VS PENUMPANG (ANTAR-JEMPUT) */}
            {isSewaMobil ? (
              <div>
                <span className="block text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Durasi
                </span>
                <p className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                  <i className="fas fa-clock-rotate-left text-sky-500 text-[9px]"></i> {getDurationText()}
                </p>
              </div>
            ) : (
              <div>
                <span className="block text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Penumpang
                </span>
                <p className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                  <i className="fas fa-users text-sky-500 text-[9px]"></i> {passengerCount} Orang
                </p>
              </div>
            )}

            <div>
              <span className="block text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Jemput
              </span>
              <p className="font-semibold text-slate-800 mt-0.5 truncate flex items-center gap-1" title={pickupAddress}>
                <i className="fas fa-location-dot text-rose-500 text-[9px]"></i> {pickupAddress}
              </p>
            </div>

            {hasDropoff && (
              <div>
                <span className="block text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                  Tujuan
                </span>
                <p className="font-semibold text-slate-800 mt-0.5 truncate flex items-center gap-1" title={dropoffAddress}>
                  <i className="fas fa-flag-checkered text-emerald-500 text-[9px]"></i> {dropoffAddress}
                </p>
              </div>
            )}
          </div>

          {item.notes && (
            <div className="text-[10px] sm:text-xs text-slate-600 bg-amber-500/10 border border-amber-200/60 rounded-md p-1.5 flex items-start gap-1">
              <i className="fas fa-comment-dots text-amber-600 text-[10px] mt-0.5"></i>
              <div>
                <strong className="text-amber-900">Catatan:</strong> {item.notes}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingCard;
