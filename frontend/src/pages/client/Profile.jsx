import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Profile = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="min-h-screen pt-24 pb-20 px-4 bg-slate-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center max-w-sm w-full shadow-sm">
                    <div className="w-16 h-16 bg-sky-50 text-[#0194F3] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                        <i className="fa-solid fa-user-lock"></i>
                    </div>
                    <h2 className="text-lg font-extrabold text-slate-800 mb-1">Belum Login</h2>
                    <p className="text-xs text-slate-500 mb-6">Silakan masuk ke akun Anda untuk mengakses halaman profil.</p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate('/login')}
                            className="flex-1 bg-[#0194F3] hover:bg-sky-600 text-white font-bold text-xs py-2.5 rounded-xl transition-all"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="flex-1 border border-slate-300 text-slate-700 font-bold text-xs py-2.5 rounded-xl hover:bg-slate-50 transition-all"
                        >
                            Daftar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const initialLetter = user.name ? user.name.charAt(0).toUpperCase() : 'U';

    return (
        <div className="min-h-screen pt-20 pb-28 bg-slate-100">
            <div className="max-w-2xl mx-auto px-3.5 sm:px-4 space-y-4">

                {/* HEADER PROFIL USER */}
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                        {/* AVATAR USER */}
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#0194F3] text-white rounded-full flex items-center justify-center font-black text-lg sm:text-xl shadow-xs shrink-0">
                            {initialLetter}
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-sm sm:text-lg font-extrabold text-slate-900 truncate leading-tight">
                                {user.name}
                            </h1>
                            <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 border border-emerald-100">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Terverifikasi
                            </span>
                        </div>
                    </div>

                    {/* TOMBOL EDIT */}
                    <Link
                        to="/profile/edit"
                        className="bg-sky-50 hover:bg-sky-100 text-[#0194F3] text-xs font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl transition-all shrink-0 flex items-center gap-1.5 border border-sky-100 active:scale-95"
                    >
                        <i className="fa-solid fa-pen-to-square text-xs"></i>
                        <span>Edit</span>
                    </Link>
                </div>

                {/* ======================================================== */}
                {/* 1. TAMPILAN KHUSUS MOBILE (Grid Ikon Konsisten #0194F3) */}
                {/* ======================================================== */}
                <div className="block sm:hidden bg-white rounded-2xl border border-slate-200/80 p-3 shadow-xs">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-3 px-1">
                        Menu Utama & Akses Cepat
                    </p>

                    <div className="grid grid-cols-5 gap-x-1 gap-y-3 text-center items-start justify-items-center">
                        {/* 1. PESANAN SAYA */}
                        <Link to="/pesanan-saya" className="flex flex-col items-center group w-full">
                            <div className="w-10 h-10 rounded-full bg-sky-50 hover:bg-sky-100 text-[#0194F3] flex items-center justify-center text-sm shadow-2xs group-active:scale-95 transition-transform mb-1 shrink-0 border border-sky-100">
                                <i className="fa-solid fa-receipt"></i>
                            </div>
                            <span className="text-[10px] font-bold text-slate-700 leading-tight truncate w-full px-0.5">
                                Pesanan
                            </span>
                        </Link>

                        {/* 2. RIWAYAT PEMBAYARAN */}
                        <Link to="/payments" className="flex flex-col items-center group w-full">
                            <div className="w-10 h-10 rounded-full bg-sky-50 hover:bg-sky-100 text-[#0194F3] flex items-center justify-center text-sm shadow-2xs group-active:scale-95 transition-transform mb-1 shrink-0 border border-sky-100">
                                <i className="fa-regular fa-credit-card"></i>
                            </div>
                            <span className="text-[10px] font-bold text-slate-700 leading-tight truncate w-full px-0.5">
                                Bayar
                            </span>
                        </Link>

                        {/* 3. PENGAJUAN REFUND */}
                        <Link to="/refunds" className="flex flex-col items-center group w-full">
                            <div className="w-10 h-10 rounded-full bg-sky-50 hover:bg-sky-100 text-[#0194F3] flex items-center justify-center text-sm shadow-2xs group-active:scale-95 transition-transform mb-1 shrink-0 relative border border-sky-100">
                                <i className="fa-solid fa-rotate-left"></i>
                                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[7px] font-black px-1 py-0.2 rounded-full border border-white">
                                    Baru
                                </span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-700 leading-tight truncate w-full px-0.5">
                                Refund
                            </span>
                        </Link>

                        {/* 4. EDIT PROFIL SAYA */}
                        <Link to="/profile/edit" className="flex flex-col items-center group w-full">
                            <div className="w-10 h-10 rounded-full bg-sky-50 hover:bg-sky-100 text-[#0194F3] flex items-center justify-center text-sm shadow-2xs group-active:scale-95 transition-transform mb-1 shrink-0 border border-sky-100">
                                <i className="fa-regular fa-user"></i>
                            </div>
                            <span className="text-[10px] font-bold text-slate-700 leading-tight truncate w-full px-0.5">
                                Edit
                            </span>
                        </Link>

                        {/* 5. INFO PROMO & DISKON */}
                        <Link to="/promos" className="flex flex-col items-center group w-full">
                            <div className="w-10 h-10 rounded-full bg-sky-50 hover:bg-sky-100 text-[#0194F3] flex items-center justify-center text-sm shadow-2xs group-active:scale-95 transition-transform mb-1 shrink-0 border border-sky-100">
                                <i className="fa-regular fa-envelope"></i>
                            </div>
                            <span className="text-[10px] font-bold text-slate-700 leading-tight truncate w-full px-0.5">
                                Promo
                            </span>
                        </Link>
                    </div>
                </div>

                {/* ======================================================== */}
                {/* 2. TAMPILAN LAPTOP & TABLET (Ikon Konsisten #0194F3) */}
                {/* ======================================================== */}
                <div className="hidden sm:block space-y-4">
                    {/* SEKSI 1: AKTIVITAS & TRANSAKSI */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-2 shadow-xs space-y-1">
                        <p className="px-3 pt-2 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            Aktivitas & Transaksi
                        </p>

                        <Link
                            to="/pesanan-saya"
                            className="flex items-center justify-between px-3.5 py-3 rounded-2xl hover:bg-slate-50 transition-colors text-slate-700 group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#0194F3] flex items-center justify-center text-sm font-bold shrink-0">
                                    <i className="fa-solid fa-receipt"></i>
                                </div>
                                <div>
                                    <p className="text-xs font-extrabold text-slate-800">Pesanan Saya</p>
                                    <p className="text-[10px] font-semibold text-slate-400">Cek status pemesanan rental & airport transfer</p>
                                </div>
                            </div>
                            <i className="fa-solid fa-chevron-right text-slate-300 group-hover:text-[#0194F3] text-xs transition-colors"></i>
                        </Link>

                        <Link
                            to="/payments"
                            className="flex items-center justify-between px-3.5 py-3 rounded-2xl hover:bg-slate-50 transition-colors text-slate-700 group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#0194F3] flex items-center justify-center text-sm font-bold shrink-0">
                                    <i className="fa-regular fa-credit-card"></i>
                                </div>
                                <div>
                                    <p className="text-xs font-extrabold text-slate-800">Riwayat Pembayaran</p>
                                    <p className="text-[10px] font-semibold text-slate-400">Daftar riwayat tagihan dan bukti bayar</p>
                                </div>
                            </div>
                            <i className="fa-solid fa-chevron-right text-slate-300 group-hover:text-[#0194F3] text-xs transition-colors"></i>
                        </Link>

                        <Link
                            to="/refunds"
                            className="flex items-center justify-between px-3.5 py-3 rounded-2xl hover:bg-slate-50 transition-colors text-slate-700 group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#0194F3] flex items-center justify-center text-sm font-bold shrink-0">
                                    <i className="fa-solid fa-rotate-left"></i>
                                </div>
                                <div>
                                    <p className="text-xs font-extrabold text-slate-800">Pengajuan Refund</p>
                                    <p className="text-[10px] font-semibold text-slate-400">Pengembalian dana pembatalan pesanan</p>
                                </div>
                            </div>
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-lg">
                                Baru!
                            </span>
                        </Link>
                    </div>

                    {/* SEKSI 2: PENGATURAN & LAINNYA */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 p-2 shadow-xs space-y-1">
                        <p className="px-3 pt-2 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            Pengaturan & Informasi
                        </p>

                        <Link
                            to="/profile/edit"
                            className="flex items-center justify-between px-3.5 py-3 rounded-2xl hover:bg-slate-50 transition-colors text-slate-700 group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#0194F3] flex items-center justify-center text-sm font-bold shrink-0">
                                    <i className="fa-regular fa-user"></i>
                                </div>
                                <div>
                                    <p className="text-xs font-extrabold text-slate-800">Edit Profil Saya</p>
                                    <p className="text-[10px] font-semibold text-slate-400">Ubah nama, nomor HP, dan kata sandi</p>
                                </div>
                            </div>
                            <i className="fa-solid fa-chevron-right text-slate-300 group-hover:text-[#0194F3] text-xs transition-colors"></i>
                        </Link>

                        <Link
                            to="/promos"
                            className="flex items-center justify-between px-3.5 py-3 rounded-2xl hover:bg-slate-50 transition-colors text-slate-700 group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#0194F3] flex items-center justify-center text-sm font-bold shrink-0">
                                    <i className="fa-regular fa-envelope"></i>
                                </div>
                                <div>
                                    <p className="text-xs font-extrabold text-slate-800">Info Promo & Diskon</p>
                                    <p className="text-[10px] font-semibold text-slate-400">Dapatkan promo menarik Dafatih Transport</p>
                                </div>
                            </div>
                            <i className="fa-solid fa-chevron-right text-slate-300 group-hover:text-[#0194F3] text-xs transition-colors"></i>
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;
