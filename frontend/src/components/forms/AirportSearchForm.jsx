import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const AirportSearchForm = ({
  routes = [],
  onSubmit,
  formatDisplayDate
}) => {
  const navigate = useNavigate();

  const todayObj = new Date();

  const [pickupInput, setPickupInput] = useState('');
  const [dropoffInput, setDropoffInput] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [passengers, setPassengers] = useState('');

  // Dropdown States
  const [isPickupOpen, setIsPickupOpen] = useState(false);
  const [isDropoffOpen, setIsDropoffOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isPassengerOpen, setIsPassengerOpen] = useState(false);

  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(
    new Date(todayObj.getFullYear(), todayObj.getMonth(), 1)
  );

  const pickupRef = useRef(null);
  const dropoffRef = useRef(null);
  const calendarRef = useRef(null);
  const passengerRef = useRef(null);

  const formatDateToISO = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickupRef.current && !pickupRef.current.contains(e.target)) setIsPickupOpen(false);
      if (dropoffRef.current && !dropoffRef.current.contains(e.target)) setIsDropoffOpen(false);
      if (calendarRef.current && !calendarRef.current.contains(e.target)) setIsCalendarOpen(false);
      if (passengerRef.current && !passengerRef.current.contains(e.target)) setIsPassengerOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeAllDropdowns = () => {
    setIsPickupOpen(false);
    setIsDropoffOpen(false);
    setIsCalendarOpen(false);
    setIsPassengerOpen(false);
  };

  const uniquePickupLocations = useMemo(() => {
    if (!Array.isArray(routes)) return [];
    return Array.from(new Set(routes.map((r) => r?.pickup_location).filter(Boolean)));
  }, [routes]);

  const availableDropoffLocations = useMemo(() => {
    if (!Array.isArray(routes)) return [];
    return Array.from(
      new Set(
        routes
          .filter((r) => !pickupInput || r?.pickup_location === pickupInput)
          .map((r) => r?.dropoff_location)
          .filter(Boolean)
      )
    );
  }, [routes, pickupInput]);

  const handleSelectPickup = (loc) => {
    setPickupInput(loc);
    setIsPickupOpen(false);

    const matchingRoutes = routes.filter((r) => r?.pickup_location === loc);
    const isCurrentDropValid = matchingRoutes.some((r) => r?.dropoff_location === dropoffInput);

    if (!isCurrentDropValid) {
      setDropoffInput(matchingRoutes.length > 0 ? matchingRoutes[0]?.dropoff_location || '' : '');
    }
  };

  const renderFormattedDate = (dateStr) => {
    if (!dateStr) return 'Pilih Tanggal';
    if (typeof formatDisplayDate === 'function') {
      try {
        return formatDisplayDate(dateStr);
      } catch (err) {
        console.error('Error pada formatDisplayDate:', err);
      }
    }
    if (dateStr instanceof Date) {
      return dateStr.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    const [y, m, d] = String(dateStr).split('-');
    if (y && m && d) {
      return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
    return String(dateStr);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      pickup: pickupInput,
      dropoff: dropoffInput,
      pickupLoc: pickupInput,
      dropLoc: dropoffInput,
      travelDate,
      pickupDate: travelDate,
      passengers
    };

    if (typeof onSubmit === 'function') {
      onSubmit(formData);
    }

    const query = new URLSearchParams();
    query.append('type', 'transfer');
    if (pickupInput) query.append('pickup', pickupInput);
    if (dropoffInput) query.append('dropoff', dropoffInput);
    if (travelDate) query.append('date', travelDate);
    if (passengers) query.append('passengers', passengers);

    navigate(`/tarif?${query.toString()}`, { state: formData });
  };

  return (
    <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1.5fr_1.2fr_1fr_auto] gap-3 items-center" onSubmit={handleSubmit}>
      {/* LOKASI PENJEMPUTAN */}
      <div className="relative" ref={pickupRef}>
        <input
          type="text"
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
          required
          value={pickupInput}
          onChange={() => {}}
          tabIndex={-1}
        />
        <div
          onClick={() => {
            const nextState = !isPickupOpen;
            closeAllDropdowns();
            setIsPickupOpen(nextState);
          }}
          className={`border rounded-2xl p-3 bg-white flex flex-col justify-center cursor-pointer transition-all ${
            isPickupOpen ? 'border-[#0194F3] ring-2 ring-sky-100' : 'border-slate-300 hover:border-slate-400'
          }`}
        >
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            LOKASI PENJEMPUTAN
          </span>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <i className="fa-solid fa-location-dot text-[#0194F3] text-sm shrink-0"></i>
              <span className={`text-xs sm:text-sm font-bold truncate ${pickupInput ? 'text-slate-800' : 'text-slate-400'}`}>
                {pickupInput || 'Pilih Penjemputan'}
              </span>
            </div>
            <i className={`fa-solid fa-chevron-down text-slate-400 text-xs transition-transform duration-200 ${isPickupOpen ? 'rotate-180 text-[#0194F3]' : ''}`}></i>
          </div>
        </div>

        {isPickupOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 z-[60] max-h-56 overflow-y-auto py-1">
            {uniquePickupLocations.length > 0 ? (
              uniquePickupLocations.map((loc, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectPickup(loc)}
                  className={`px-3.5 py-2.5 text-xs font-bold cursor-pointer flex items-center justify-between hover:bg-sky-50 transition-colors ${
                    pickupInput === loc ? 'text-[#0194F3] bg-sky-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>{loc}</span>
                  {pickupInput === loc && <i className="fa-solid fa-check text-xs text-[#0194F3]"></i>}
                </div>
              ))
            ) : (
              <div className="px-3 py-3 text-xs text-slate-400 text-center font-semibold">Tidak ada lokasi penjemputan</div>
            )}
          </div>
        )}
      </div>

      {/* LOKASI TUJUAN */}
      <div className="relative" ref={dropoffRef}>
        <input
          type="text"
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
          required
          value={dropoffInput}
          onChange={() => {}}
          tabIndex={-1}
        />
        <div
          onClick={() => {
            const nextState = !isDropoffOpen;
            closeAllDropdowns();
            setIsDropoffOpen(nextState);
          }}
          className={`border rounded-2xl p-3 bg-white flex flex-col justify-center cursor-pointer transition-all ${
            isDropoffOpen ? 'border-[#0194F3] ring-2 ring-sky-100' : 'border-slate-300 hover:border-slate-400'
          }`}
        >
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            LOKASI TUJUAN
          </span>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <i className="fa-solid fa-flag-checkered text-[#0194F3] text-sm shrink-0"></i>
              <span className={`text-xs sm:text-sm font-bold truncate ${dropoffInput ? 'text-slate-800' : 'text-slate-400'}`}>
                {dropoffInput || 'Pilih Tujuan'}
              </span>
            </div>
            <i className={`fa-solid fa-chevron-down text-slate-400 text-xs transition-transform duration-200 ${isDropoffOpen ? 'rotate-180 text-[#0194F3]' : ''}`}></i>
          </div>
        </div>

        {isDropoffOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 z-[60] max-h-56 overflow-y-auto py-1">
            {availableDropoffLocations.length > 0 ? (
              availableDropoffLocations.map((loc, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setDropoffInput(loc);
                    setIsDropoffOpen(false);
                  }}
                  className={`px-3.5 py-2.5 text-xs font-bold cursor-pointer flex items-center justify-between hover:bg-sky-50 transition-colors ${
                    dropoffInput === loc ? 'text-[#0194F3] bg-sky-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>{loc}</span>
                  {dropoffInput === loc && <i className="fa-solid fa-check text-xs text-[#0194F3]"></i>}
                </div>
              ))
            ) : (
              <div className="px-3 py-3 text-xs text-slate-400 text-center font-semibold">Tidak ada tujuan tersedia</div>
            )}
          </div>
        )}
      </div>

      {/* TANGGAL PERJALANAN */}
      <div className="relative" ref={calendarRef}>
        <input
          type="text"
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
          required
          value={travelDate}
          onChange={() => {}}
          tabIndex={-1}
        />
        <div
          onClick={() => {
            const nextState = !isCalendarOpen;
            closeAllDropdowns();
            setIsCalendarOpen(nextState);
          }}
          className={`border rounded-2xl p-3 bg-white flex flex-col justify-center cursor-pointer transition-all ${
            isCalendarOpen ? 'border-[#0194F3] ring-2 ring-sky-100' : 'border-slate-300 hover:border-slate-400'
          }`}
        >
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            TANGGAL PERJALANAN
          </span>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <i className="fa-solid fa-calendar-days text-[#0194F3] text-sm shrink-0"></i>
              <span className={`text-xs sm:text-sm font-bold truncate ${travelDate ? 'text-slate-800' : 'text-slate-400'}`}>
                {renderFormattedDate(travelDate)}
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
            <div className="fixed inset-0 sm:inset-auto sm:absolute sm:left-0 sm:top-full sm:mt-2 z-[75] flex items-center justify-center sm:block p-4 sm:p-0 pointer-events-none sm:pointer-events-auto">
              <div className="w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 pointer-events-auto">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentCalendarMonth(
                        new Date(
                          currentCalendarMonth.getFullYear(),
                          currentCalendarMonth.getMonth() - 1,
                          1
                        )
                      );
                    }}
                    className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-chevron-left text-xs"></i>
                  </button>
                  <span className="text-xs font-bold text-slate-800">
                    {currentCalendarMonth.toLocaleDateString('id-ID', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentCalendarMonth(
                        new Date(
                          currentCalendarMonth.getFullYear(),
                          currentCalendarMonth.getMonth() + 1,
                          1
                        )
                      );
                    }}
                    className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                  >
                    <i className="fa-solid fa-chevron-right text-xs"></i>
                  </button>
                </div>

                <div className="grid grid-cols-7 text-center mb-1">
                  {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((dayName, idx) => (
                    <span key={idx} className="text-[10px] font-bold text-slate-400">
                      {dayName}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 text-center">
                  {calendarDays.map((dateObj, idx) => {
                    if (!dateObj) return <div key={idx} className="h-8" />;
                    const isoStr = formatDateToISO(dateObj);
                    const isSelected = isoStr === travelDate;
                    const isPast =
                      dateObj <
                      new Date(
                        todayObj.getFullYear(),
                        todayObj.getMonth(),
                        todayObj.getDate()
                      );
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isPast}
                        onClick={() => {
                          setTravelDate(isoStr);
                          setIsCalendarOpen(false);
                        }}
                        className={`h-8 rounded-lg text-xs font-bold flex items-center justify-center cursor-pointer transition-colors ${
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

      {/* JUMLAH PENUMPANG */}
      <div className="relative" ref={passengerRef}>
        <input
          type="text"
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
          required
          value={passengers}
          onChange={() => {}}
          tabIndex={-1}
        />
        <div
          onClick={() => {
            const nextState = !isPassengerOpen;
            closeAllDropdowns();
            setIsPassengerOpen(nextState);
          }}
          className={`border rounded-2xl p-3 bg-white flex flex-col justify-center cursor-pointer transition-all ${
            isPassengerOpen ? 'border-[#0194F3] ring-2 ring-sky-100' : 'border-slate-300 hover:border-slate-400'
          }`}
        >
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            JUMLAH PENUMPANG
          </span>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <i className="fa-solid fa-users text-[#0194F3] text-sm shrink-0"></i>
              <span className={`text-xs sm:text-sm font-bold truncate ${passengers ? 'text-slate-800' : 'text-slate-400'}`}>
                {passengers ? `${passengers} Orang` : 'Pilih Penumpang'}
              </span>
            </div>
            <i className={`fa-solid fa-chevron-down text-slate-400 text-xs transition-transform duration-200 ${isPassengerOpen ? 'rotate-180 text-[#0194F3]' : ''}`}></i>
          </div>
        </div>

        {isPassengerOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 z-[60] py-1">
            {['1', '2', '3', '4'].map((num) => (
              <div
                key={num}
                onClick={() => {
                  setPassengers(num);
                  setIsPassengerOpen(false);
                }}
                className={`px-3.5 py-2.5 text-xs font-bold cursor-pointer flex items-center justify-between hover:bg-sky-50 transition-colors ${
                  passengers === num ? 'text-[#0194F3] bg-sky-50/50' : 'text-slate-700'
                }`}
              >
                <span>{num} Orang {num === '4' ? '(Maksimal)' : ''}</span>
                {passengers === num && <i className="fa-solid fa-check text-xs text-[#0194F3]"></i>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TOMBOL CARI */}
      <button
        type="submit"
        className="w-full lg:w-auto h-full px-7 py-3.5 bg-[#0194F3] hover:bg-sky-600 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
      >
        <i className="fa-solid fa-magnifying-glass text-white text-xs"></i>
        <span>Cari</span>
      </button>
    </form>
  );
};

export default AirportSearchForm;
