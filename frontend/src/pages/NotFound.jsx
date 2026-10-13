// src/pages/NotFound.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2F4F7] p-4 text-center">
      <h1 className="text-6xl font-extrabold text-[#0194F3] mb-2">404</h1>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Halaman Tidak Ditemukan</h2>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6">
        Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
      </p>
      <button
        onClick={() => navigate('/')}
        className="px-5 py-2.5 bg-[#0194F3] text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-sm cursor-pointer"
      >
        Kembali ke Beranda
      </button>
    </div>
  );
};

export default NotFound;
