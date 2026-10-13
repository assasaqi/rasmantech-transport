import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const MobileBottomNav = () => {
    const location = useLocation();

    // Sembunyikan bottom nav jika sedang di area /admin/*
    if (location.pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 h-[62px] bg-white border-t border-slate-200/90 shadow-[0_-2px_12px_rgba(0,0,0,0.05)] z-[1500] flex justify-around items-center pb-[env(safe-area-inset-bottom,0px)]">
            <NavLink
                to="/"
                end
                className={({ isActive }) =>
                    `flex flex-col items-center justify-center flex-1 h-full text-[11px] font-bold transition-colors ${
                        isActive ? 'text-[#0194F3]' : 'text-slate-500 hover:text-slate-700'
                    }`
                }
            >
                <i className="fa-solid fa-house text-lg mb-0.5"></i>
                <span>Beranda</span>
            </NavLink>

            {/* <NavLink to="/tarif" className={({ isActive }) => `flex flex-col items-center justify-center flex-1 h-full text-[11px] font-bold transition-colors ${isActive ? 'text-[#0194F3]' : 'text-slate-500'}`}><i className="fa-solid fa-table-list text-lg mb-0.5"></i><span>Tarif</span></NavLink> */}
            {/* <NavLink to="/mobil" className={({ isActive }) => `flex flex-col items-center justify-center flex-1 h-full text-[11px] font-bold transition-colors ${isActive ? 'text-[#0194F3]' : 'text-slate-500'}`}><i className="fa-solid fa-car text-lg mb-0.5"></i><span>Mobil</span></NavLink> */}

            <NavLink
                to="/pesan"
                className={({ isActive }) =>
                    `flex flex-col items-center justify-center flex-1 h-full text-[11px] font-bold transition-colors ${
                        isActive ? 'text-[#0194F3]' : 'text-slate-500 hover:text-slate-700'
                    }`
                }
            >
                <i className="fa-solid fa-circle-plus text-lg mb-0.5"></i>
                <span>Pesan</span>
            </NavLink>

            <NavLink
                to="/pesanan-saya"
                className={({ isActive }) =>
                    `flex flex-col items-center justify-center flex-1 h-full text-[11px] font-bold transition-colors ${
                        isActive ? 'text-[#0194F3]' : 'text-slate-500 hover:text-slate-700'
                    }`
                }
            >
                <i className="fa-solid fa-receipt text-lg mb-0.5"></i>
                <span>Transaksi</span>
            </NavLink>

            {/* Tombol Profil Mengarah ke Route /profile */}
            <NavLink
                to="/profile"
                className={({ isActive }) =>
                    `flex flex-col items-center justify-center flex-1 h-full text-[11px] font-bold transition-colors ${
                        isActive ? 'text-[#0194F3]' : 'text-slate-500 hover:text-slate-700'
                    }`
                }
            >
                <i className="fa-solid fa-user text-lg mb-0.5"></i>
                <span>Profil</span>
            </NavLink>

            {/* <NavLink to="/galeri" className={({ isActive }) => `flex flex-col items-center justify-center flex-1 h-full text-[11px] font-bold transition-colors ${isActive ? 'text-[#0194F3]' : 'text-slate-500'}`}><i className="fa-solid fa-images text-lg mb-0.5"></i><span>Galeri</span></NavLink> */}
            {/* <NavLink to="/blog" className={({ isActive }) => `flex flex-col items-center justify-center flex-1 h-full text-[11px] font-bold transition-colors ${isActive ? 'text-[#0194F3]' : 'text-slate-500'}`}><i className="fa-solid fa-blog text-lg mb-0.5"></i><span>Blog</span></NavLink> */}
        </div>
    );
};

export default MobileBottomNav;
