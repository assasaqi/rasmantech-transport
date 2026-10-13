import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const CarRentalForm = ({
  routes = [],
  armadas = [],
  vehicles = [],
  cars = [],
  onSubmit
}) => {
  const navigate = useNavigate();

  // Form State
  const [rentalLocation, setRentalLocation] = useState('');
  const [armadaName, setArmadaName] = useState('');
  const [rentalDuration, setRentalDuration] = useState('');

  // Dropdown Open/Close States
  const [isRentalLocOpen, setIsRentalLocOpen] = useState(false);
  const [isArmadaOpen, setIsArmadaOpen] = useState(false);
  const [isRentalDurOpen, setIsRentalDurOpen] = useState(false);

  // Refs untuk Click Outside
  const rentalLocRef = useRef(null);
  const armadaRef = useRef(null);
  const rentalDurRef = useRef(null);

  // Menutup dropdown saat klik di luar area
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (rentalLocRef.current && !rentalLocRef.current.contains(e.target)) {
        setIsRentalLocOpen(false);
      }
      if (armadaRef.current && !armadaRef.current.contains(e.target)) {
        setIsArmadaOpen(false);
      }
      if (rentalDurRef.current && !rentalDurRef.current.contains(e.target)) {
        setIsRentalDurOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeAllDropdowns = () => {
    setIsRentalLocOpen(false);
    setIsArmadaOpen(false);
    setIsRentalDurOpen(false);
  };

  // 1. Ekstrak Lokasi Unik dari Props Routes
  const uniqueLocations = useMemo(() => {
    let list = Array.isArray(routes) ? routes : routes?.data || [];
    if (!Array.isArray(list)) return [];

    const locs = list
      .map((r) => r?.pickup_location || r?.location || r?.nama_lokasi || r?.kota)
      .filter(Boolean);

    return Array.from(new Set(locs));
  }, [routes]);

  // 2. Ekstrak Nama Mobil Unik
  const uniqueArmadas = useMemo(() => {
    let rawList = [];
    if (Array.isArray(armadas) && armadas.length > 0) rawList = armadas;
    else if (Array.isArray(vehicles) && vehicles.length > 0) rawList = vehicles;
    else if (Array.isArray(cars) && cars.length > 0) rawList = cars;

    if (!Array.isArray(rawList) || rawList.length === 0) return [];

    const extractedNames = rawList
      .map((item) => {
        if (typeof item === 'string') {
          return item.includes(' - ') ? null : item.trim();
        }

        if (!item || typeof item !== 'object') return null;

        if (item.pickup_location || item.dropoff_location) return null;

        const name =
          item.name ||
          item.nama_armada ||
          item.nama_mobil ||
          item.car_name ||
          item.vehicle_name ||
          item.armada_name;

        if (!name || typeof name !== 'string') return null;
        if (name.includes(' - ')) return null;

        return name.trim();
      })
      .filter(Boolean);

    return Array.from(new Set(extractedNames));
  }, [armadas, vehicles, cars]);

  // 3. Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = {
      type: 'rental',
      location: rentalLocation,
      pickupLoc: rentalLocation,
      armada: armadaName,
      armadaName: armadaName,
      duration: rentalDuration
    };

    if (typeof onSubmit === 'function') {
      onSubmit(formData);
    }

    const query = new URLSearchParams();
    query.append('type', 'rental');
    query.append('location', rentalLocation);
    query.append('armada', armadaName);
    query.append('duration', rentalDuration);

    navigate(`/mobil?${query.toString()}`, { state: formData });
  };

  return (
    <form
      className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-[2fr_1.8fr_1.5fr_auto] gap-3 items-center"
      onSubmit={handleSubmit}
    >
      {/* 1. LOKASI RENTAL */}
      <div className="relative" ref={rentalLocRef}>
        <input
          type="text"
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
          required
          value={rentalLocation}
          onChange={() => {}}
          tabIndex={-1}
        />
        <div
          onClick={() => {
            const nextState = !isRentalLocOpen;
            closeAllDropdowns();
            setIsRentalLocOpen(nextState);
          }}
          className={`border rounded-2xl p-3 bg-white flex flex-col justify-center cursor-pointer transition-all ${
            isRentalLocOpen
              ? 'border-[#0194F3] ring-2 ring-sky-100'
              : 'border-slate-300 hover:border-slate-400'
          }`}
        >
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            LOKASI RENTAL
          </span>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <i className="fa-solid fa-location-dot text-[#0194F3] text-sm shrink-0"></i>
              <span
                className={`text-xs sm:text-sm font-bold truncate ${
                  rentalLocation ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {rentalLocation || 'Pilih Lokasi Rental'}
              </span>
            </div>
            <i
              className={`fa-solid fa-chevron-down text-slate-400 text-xs transition-transform duration-200 ${
                isRentalLocOpen ? 'rotate-180 text-[#0194F3]' : ''
              }`}
            ></i>
          </div>
        </div>

        {isRentalLocOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 z-[60] max-h-56 overflow-y-auto py-1">
            {uniqueLocations.length > 0 ? (
              uniqueLocations.map((loc, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setRentalLocation(loc);
                    setIsRentalLocOpen(false);
                  }}
                  className={`px-3.5 py-2.5 text-xs font-bold cursor-pointer flex items-center justify-between hover:bg-sky-50 transition-colors ${
                    rentalLocation === loc
                      ? 'text-[#0194F3] bg-sky-50/50'
                      : 'text-slate-700'
                  }`}
                >
                  <span>{loc}</span>
                  {rentalLocation === loc && (
                    <i className="fa-solid fa-check text-xs text-[#0194F3]"></i>
                  )}
                </div>
              ))
            ) : (
              <div className="px-3 py-3 text-xs text-slate-400 text-center font-semibold">
                Tidak ada lokasi tersedia
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. NAMA ARMADA */}
      <div className="relative" ref={armadaRef}>
        <input
          type="text"
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
          required
          value={armadaName}
          onChange={() => {}}
          tabIndex={-1}
        />
        <div
          onClick={() => {
            const nextState = !isArmadaOpen;
            closeAllDropdowns();
            setIsArmadaOpen(nextState);
          }}
          className={`border rounded-2xl p-3 bg-white flex flex-col justify-center cursor-pointer transition-all ${
            isArmadaOpen
              ? 'border-[#0194F3] ring-2 ring-sky-100'
              : 'border-slate-300 hover:border-slate-400'
          }`}
        >
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            NAMA ARMADA
          </span>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <i className="fa-solid fa-car text-[#0194F3] text-sm shrink-0"></i>
              <span
                className={`text-xs sm:text-sm font-bold truncate ${
                  armadaName ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {armadaName || 'Pilih Nama Armada'}
              </span>
            </div>
            <i
              className={`fa-solid fa-chevron-down text-slate-400 text-xs transition-transform duration-200 ${
                isArmadaOpen ? 'rotate-180 text-[#0194F3]' : ''
              }`}
            ></i>
          </div>
        </div>

        {isArmadaOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 z-[60] max-h-56 overflow-y-auto py-1">
            {uniqueArmadas.length > 0 ? (
              uniqueArmadas.map((armada, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setArmadaName(armada);
                    setIsArmadaOpen(false);
                  }}
                  className={`px-3.5 py-2.5 text-xs font-bold cursor-pointer flex items-center justify-between hover:bg-sky-50 transition-colors ${
                    armadaName === armada
                      ? 'text-[#0194F3] bg-sky-50/50'
                      : 'text-slate-700'
                  }`}
                >
                  <span>{armada}</span>
                  {armadaName === armada && (
                    <i className="fa-solid fa-check text-xs text-[#0194F3]"></i>
                  )}
                </div>
              ))
            ) : (
              <div className="px-3 py-3 text-xs text-slate-400 text-center font-semibold">
                Tidak ada armada tersedia
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. DURASI RENTAL */}
      <div className="relative" ref={rentalDurRef}>
        <input
          type="text"
          className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
          required
          value={rentalDuration}
          onChange={() => {}}
          tabIndex={-1}
        />
        <div
          onClick={() => {
            const nextState = !isRentalDurOpen;
            closeAllDropdowns();
            setIsRentalDurOpen(nextState);
          }}
          className={`border rounded-2xl p-3 bg-white flex flex-col justify-center cursor-pointer transition-all ${
            isRentalDurOpen
              ? 'border-[#0194F3] ring-2 ring-sky-100'
              : 'border-slate-300 hover:border-slate-400'
          }`}
        >
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            DURASI RENTAL
          </span>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <i className="fa-solid fa-clock-rotate-left text-[#0194F3] text-sm shrink-0"></i>
              <span
                className={`text-xs sm:text-sm font-bold truncate ${
                  rentalDuration ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {rentalDuration ? `${rentalDuration} Hari` : 'Pilih Durasi'}
              </span>
            </div>
            <i
              className={`fa-solid fa-chevron-down text-slate-400 text-xs transition-transform duration-200 ${
                isRentalDurOpen ? 'rotate-180 text-[#0194F3]' : ''
              }`}
            ></i>
          </div>
        </div>

        {isRentalDurOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 z-[60] overflow-hidden py-1">
            {['1', '2', '3', '4', '5', '6', '7'].map((day) => (
              <div
                key={day}
                onClick={() => {
                  setRentalDuration(day);
                  setIsRentalDurOpen(false);
                }}
                className={`px-3.5 py-2.5 text-xs font-bold cursor-pointer flex items-center justify-between hover:bg-sky-50 transition-colors ${
                  rentalDuration === day
                    ? 'text-[#0194F3] bg-sky-50/50'
                    : 'text-slate-700'
                }`}
              >
                <span>{day} Hari</span>
                {rentalDuration === day && (
                  <i className="fa-solid fa-check text-xs text-[#0194F3]"></i>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. TOMBOL CARI */}
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

export default CarRentalForm;
