import React, { useState, useEffect, useRef } from 'react';

const TourPackageTab = ({
  pickupOptions = [],
  destinationOptions = [],
  onSearch,
}) => {
  const [pickupLocation, setPickupLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [tourDate, setTourDate] = useState('');

  // Dropdown States
  const [isPickupOpen, setIsPickupOpen] = useState(false);
  const [isDestinationOpen, setIsDestinationOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Refs untuk Click Outside
  const pickupRef = useRef(null);
  const destinationRef = useRef(null);
  const calendarRef = useRef(null);

  // Handle Klik di Luar Dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickupRef.current && !pickupRef.current.contains(e.target)) setIsPickupOpen(false);
      if (destinationRef.current && !destinationRef.current.contains(e.target)) setIsDestinationOpen(false);
      if (calendarRef.current && !calendarRef.current.contains(e.target)) setIsCalendarOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Kalender Helper
  const todayObj = new Date();
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(
    new Date(todayObj.getFullYear(), todayObj.getMonth(), 1)
  );

  const formatDateToISO = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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

  const generateCalendarDays = () => {
    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    return days;
  };

  const calendarDays = generateCalendarDays();

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setCurrentCalendarMonth(new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setCurrentCalendarMonth(new Date(currentCalendarMonth.getFullYear(), currentCalendarMonth.getMonth() + 1, 1));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Jika ada callback handler khusus dari parent
    if (onSearch) {
      onSearch({ pickupLocation, destination, tourDate });
      return;
    }

    // Default: Kirim pesan WhatsApp
    const phoneNumber = '6281234567890'; // Sesuaikan nomor WhatsApp resmi
    const formattedDate = tourDate ? formatDisplayDate(tourDate) : '-';

    let text = `Halo Dafatih Transport, saya ingin mengajukan pemesanan/konsultasi *Paket Wisata Lombok*:\n\n`;
    text += `📍 *Lokasi Penjemputan:* ${pickupLocation || 'Belum dipilih'}\n`;
    text += `🏝️ *Lokasi/Tujuan Wisata:* ${destination || 'Belum dipilih'}\n`;
    text += `📅 *Tanggal Wisata:* ${formattedDate}\n\n`;
    text += `Mohon informasi ketersediaan dan rincian harganya. Terima kasih!`;

    const encodedMessage = encodeURIComponent(text);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-[2fr_2fr_1.5fr_auto] gap-3 items-center"
    >
      {/* 1. INPUT LOKASI PENJEMPUTAN */}
      <div className="relative" ref={pickupRef}>
        <input
          type="text"
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
          required
          value={pickupLocation}
          onChange={() => {}}
          tabIndex={-1}
        />
        <div
          onClick={() => {
            setIsPickupOpen(!isPickupOpen);
            setIsDestinationOpen(false);
            setIsCalendarOpen(false);
          }}
          className={`border rounded-2xl p-2.5 bg-white flex flex-col cursor-pointer transition-all ${
            isPickupOpen ? 'border-[#0194F3] ring-2 ring-sky-100' : 'border-slate-300 hover:border-slate-400'
          }`}
        >
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
            LOKASI PENJEMPUTAN
          </span>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <i className="fa-solid fa-location-dot text-[#0194F3] text-sm shrink-0"></i>
              <span className={`text-xs sm:text-sm font-bold truncate ${pickupLocation ? 'text-slate-900' : 'text-slate-400'}`}>
                {pickupLocation || 'Pilih Lokasi Penjemputan'}
              </span>
            </div>
            <i className={`fa-solid fa-chevron-down text-slate-400 text-xs transition-transform duration-200 ${isPickupOpen ? 'rotate-180 text-[#0194F3]' : ''}`}></i>
          </div>
        </div>

        {isPickupOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="max-h-56 overflow-y-auto py-1">
              {pickupOptions.length > 0 ? (
                pickupOptions.map((loc, idx) => {
                  const label = typeof loc === 'string' ? loc : loc.label || loc.name || loc.title;
                  const value = typeof loc === 'string' ? loc : loc.value || loc.id || label;

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setPickupLocation(value);
                        setIsPickupOpen(false);
                      }}
                      className={`px-3 py-2 text-xs font-semibold cursor-pointer flex items-center justify-between hover:bg-sky-50 transition-colors ${
                        pickupLocation === value ? 'text-[#0194F3] bg-sky-50/50 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <span>{label}</span>
                      {pickupLocation === value && <i className="fa-solid fa-check text-xs"></i>}
                    </div>
                  );
                })
              ) : (
                <div className="px-3 py-3 text-xs text-slate-400 text-center">
                  Tidak ada lokasi penjemputan
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. INPUT LOKASI / DESTINASI WISATA */}
      <div className="relative" ref={destinationRef}>
        <input
          type="text"
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
          required
          value={destination}
          onChange={() => {}}
          tabIndex={-1}
        />
        <div
          onClick={() => {
            setIsDestinationOpen(!isDestinationOpen);
            setIsPickupOpen(false);
            setIsCalendarOpen(false);
          }}
          className={`border rounded-2xl p-2.5 bg-white flex flex-col cursor-pointer transition-all ${
            isDestinationOpen ? 'border-[#0194F3] ring-2 ring-sky-100' : 'border-slate-300 hover:border-slate-400'
          }`}
        >
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
            DESTINASI WISATA
          </span>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <i className="fa-solid fa-compass text-[#0194F3] text-sm shrink-0"></i>
              <span className={`text-xs sm:text-sm font-bold truncate ${destination ? 'text-slate-900' : 'text-slate-400'}`}>
                {destination || 'Pilih Destinasi Wisata'}
              </span>
            </div>
            <i className={`fa-solid fa-chevron-down text-slate-400 text-xs transition-transform duration-200 ${isDestinationOpen ? 'rotate-180 text-[#0194F3]' : ''}`}></i>
          </div>
        </div>

        {isDestinationOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="max-h-56 overflow-y-auto py-1">
              {destinationOptions.length > 0 ? (
                destinationOptions.map((dest, idx) => {
                  const label = typeof dest === 'string' ? dest : dest.label || dest.name || dest.title;
                  const value = typeof dest === 'string' ? dest : dest.value || dest.id || label;

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setDestination(value);
                        setIsDestinationOpen(false);
                      }}
                      className={`px-3 py-2 text-xs font-semibold cursor-pointer flex items-center justify-between hover:bg-sky-50 transition-colors ${
                        destination === value ? 'text-[#0194F3] bg-sky-50/50 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <span>{label}</span>
                      {destination === value && <i className="fa-solid fa-check text-xs"></i>}
                    </div>
                  );
                })
              ) : (
                <div className="px-3 py-3 text-xs text-slate-400 text-center">
                  Tidak ada destinasi tersedia
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. INPUT TANGGAL WISATA */}
      <div className="relative" ref={calendarRef}>
        <input
          type="text"
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
          required
          value={tourDate}
          onChange={() => {}}
          tabIndex={-1}
        />
        <div
          onClick={() => {
            setIsCalendarOpen(!isCalendarOpen);
            setIsPickupOpen(false);
            setIsDestinationOpen(false);
          }}
          className={`border rounded-2xl p-2.5 bg-white flex flex-col cursor-pointer transition-all ${
            isCalendarOpen ? 'border-[#0194F3] ring-2 ring-sky-100' : 'border-slate-300 hover:border-slate-400'
          }`}
        >
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-0.5">
            TANGGAL WISATA
          </span>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <i className="fa-solid fa-calendar-days text-[#0194F3] text-sm shrink-0"></i>
              <span className={`text-xs sm:text-sm font-bold truncate ${tourDate ? 'text-slate-900' : 'text-slate-400'}`}>
                {tourDate ? formatDisplayDate(tourDate) : 'Pilih Tanggal'}
              </span>
            </div>
            <i className={`fa-solid fa-chevron-down text-slate-400 text-xs transition-transform duration-200 ${isCalendarOpen ? 'rotate-180 text-[#0194F3]' : ''}`}></i>
          </div>
        </div>

        {/* MODAL KALENDER TERPUSAT DI MOBILE */}
        {isCalendarOpen && (
          <>
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[70] sm:hidden"
              onClick={() => setIsCalendarOpen(false)}
            />
            <div className="fixed inset-0 sm:inset-auto sm:absolute sm:left-0 sm:sm:left-auto sm:right-0 lg:left-0 sm:top-full sm:mt-2 z-[75] flex items-center justify-center sm:block p-4 sm:p-0 pointer-events-none sm:pointer-events-auto">
              <div className="w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-chevron-left text-xs"></i>
                  </button>
                  <span className="text-xs font-bold text-slate-800">
                    {currentCalendarMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-chevron-right text-xs"></i>
                  </button>
                </div>

                <div className="grid grid-cols-7 text-center mb-1">
                  {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((dayName, index) => (
                    <span key={index} className="text-[10px] font-bold text-slate-400">
                      {dayName}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                  {calendarDays.map((dateObj, idx) => {
                    if (!dateObj) return <div key={idx} className="h-8" />;
                    const isoStr = formatDateToISO(dateObj);
                    const isSelected = isoStr === tourDate;
                    const isPast = dateObj < new Date(todayObj.getFullYear(), todayObj.getMonth(), todayObj.getDate());

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isPast}
                        onClick={() => {
                          setTourDate(isoStr);
                          setIsCalendarOpen(false);
                        }}
                        className={`h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'bg-[#0194F3] text-white shadow-sm'
                            : isPast
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-slate-700 hover:bg-sky-50 hover:text-[#0194F3]'
                        }`}
                      >
                        {dateObj.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 4. TOMBOL CARI (DINONAKTIFKAN KARENA DATA TOUR BELUM ADA) */}
      <button
        type="submit"
        disabled
        title="Layanan Paket Tour belum tersedia"
        className="w-full lg:w-auto h-full px-6 py-3.5 bg-slate-300 text-slate-500 font-extrabold text-sm rounded-2xl shadow-none cursor-not-allowed flex items-center justify-center gap-2 shrink-0 transition-all opacity-70"
      >
        <i className="fa-solid fa-magnifying-glass"></i>
        <span>Cari</span>
      </button>
    </form>
  );
};

export default TourPackageTab;
