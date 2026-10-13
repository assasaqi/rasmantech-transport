import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import FormAntarJemput from "@/components/booking/FormAntarJemput";
import FormSewaMobil from "@/components/booking/FormSewaMobil";
import FormPaketTour from "@/components/booking/FormPaketTour";

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('airport');
  const [showInfoBanner, setShowInfoBanner] = useState(true);

  useEffect(() => {
    if (location.state && Object.keys(location.state).length > 0) {
      const stateData = location.state;

      const isRental = stateData.jenisLayanan === 'Sewa Mobil' || !!stateData.carType || !!stateData.namaArmada;
      const isTour = stateData.jenisLayanan === 'Paket Tour' || !!stateData.packageTour || !!stateData.packageName;

      if (isTour) {
        setActiveTab('tour');
      } else if (isRental) {
        setActiveTab('rental');
      } else if (stateData.pickup || stateData.pickupLoc || stateData.dropoff || stateData.dropLoc) {
        setActiveTab('airport');
      }
    }
  }, [location.state]);

  return (
    <div className="min-h-screen pt-20 pb-28 bg-slate-100 text-slate-800">
      <div className="max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 space-y-4">

        {/* HEADER JUDUL HALAMAN */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4">
          <div>
            <h1 className="text-sm sm:text-lg font-extrabold text-slate-900 leading-tight">
              Cek &amp; Pesan Layanan
            </h1>
            <p className="text-[11px] sm:text-xs font-semibold text-slate-400 mt-0.5">
              Pilih jenis layanan transportasi &amp; wisata Lombok
            </p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sky-50 text-[#0194F3] rounded-full flex items-center justify-center text-base sm:text-lg font-bold shrink-0 border border-sky-100/80 shadow-2xs">
            <i className="fa-regular fa-calendar-check"></i>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 1. NAVIGASI TAB KHUSUS MOBILE (STICKY MENEMPEL DI ATAS)  */}
        {/* ======================================================== */}
        <div className="block md:hidden sticky top-14 sm:top-16 z-30 bg-slate-100/95 backdrop-blur-md pt-1 pb-2 -mx-3.5 px-3.5 transition-all">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-md">
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-3 px-1">
              Pilih Layanan
            </p>

            <div className="grid grid-cols-3 gap-x-2 text-center items-start justify-items-center">
              {/* TAB 1: ANTAR-JEMPUT */}
              <button
                type="button"
                onClick={() => setActiveTab('airport')}
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

              {/* TAB 2: SEWA MOBIL */}
              <button
                type="button"
                onClick={() => setActiveTab('rental')}
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

              {/* TAB 3: PAKET TOUR */}
              <button
                type="button"
                onClick={() => setActiveTab('tour')}
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
        </div>

        {/* KONTEN UTAMA & SIDEBAR DESKTOP */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">

          {/* ======================================================== */}
          {/* 2. NAVIGASI TAB KHUSUS DESKTOP / TABLET (TETAP NORMAL)   */}
          {/* ======================================================== */}
          <div className="hidden md:block md:col-span-4 lg:col-span-3 space-y-3">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-2 shadow-xs space-y-1">
              <p className="px-3 pt-2 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Pilih Layanan
              </p>

              <button
                type="button"
                onClick={() => setActiveTab('airport')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all text-left cursor-pointer ${
                  activeTab === 'airport'
                    ? 'bg-sky-50 text-[#0194F3] font-extrabold border border-sky-100'
                    : 'text-slate-700 hover:bg-slate-50 font-bold'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                    activeTab === 'airport'
                      ? 'bg-[#0194F3] text-white'
                      : 'bg-sky-50 text-[#0194F3]'
                  }`}
                >
                  <i className="fa-solid fa-plane-departure"></i>
                </div>
                <span className="text-xs">Antar-Jemput</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('rental')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all text-left cursor-pointer ${
                  activeTab === 'rental'
                    ? 'bg-sky-50 text-[#0194F3] font-extrabold border border-sky-100'
                    : 'text-slate-700 hover:bg-slate-50 font-bold'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                    activeTab === 'rental'
                      ? 'bg-[#0194F3] text-white'
                      : 'bg-sky-50 text-[#0194F3]'
                  }`}
                >
                  <i className="fa-solid fa-car-side"></i>
                </div>
                <span className="text-xs">Sewa Mobil</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('tour')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all text-left cursor-pointer ${
                  activeTab === 'tour'
                    ? 'bg-sky-50 text-[#0194F3] font-extrabold border border-sky-100'
                    : 'text-slate-700 hover:bg-slate-50 font-bold'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                    activeTab === 'tour'
                      ? 'bg-[#0194F3] text-white'
                      : 'bg-sky-50 text-[#0194F3]'
                  }`}
                >
                  <i className="fa-solid fa-map-location-dot"></i>
                </div>
                <span className="text-xs">Paket Tour Lombok</span>
              </button>
            </div>
          </div>

          {/* AREA KONTEN UTAMA / FORM */}
          <div className="md:col-span-8 lg:col-span-9 space-y-3 sm:space-y-4">
            {showInfoBanner && (
              <div className="relative bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 flex items-start justify-between gap-3 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-sky-50 text-[#0194F3] rounded-xl flex items-center justify-center shrink-0 border border-sky-100">
                    <i className="fa-solid fa-shield-halved text-base sm:text-lg"></i>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 mb-0.5 leading-tight">
                      Pesan Layanan Transportasi &amp; Wisata Lombok
                    </h3>
                    <p className="text-[11px] sm:text-xs text-slate-500 leading-normal">
                      Lengkapi formulir pemesanan di bawah ini.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInfoBanner(false)}
                  className="text-slate-400 hover:text-slate-600 text-base p-1 shrink-0 cursor-pointer -mt-1 -mr-1 transition-colors"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            )}

            {/* RENDER FORM TANPA MODAL */}
            {activeTab === 'airport' && <FormAntarJemput />}
            {activeTab === 'rental' && <FormSewaMobil />}
            {activeTab === 'tour' && <FormPaketTour />}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Booking;
