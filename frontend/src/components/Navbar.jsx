import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// Import aset logo
import logoImg from '/logo/logo.png';
import logo2Img from '/logo/logo2.png';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef(null);
    const { user: clientUser, logout } = useAuth();

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    // Cek apakah sedang berada di halaman booking/pesan
    const isBookingPage = location.pathname.startsWith('/pesan');

    // Penentu mode transparan (Aktif di semua page KECUALI page booking, saat belum di-scroll & menu mobile tertutup)
    const isTransparent = !isBookingPage && !isScrolled && !isMobileMenuOpen;

    // Handle Scroll Header
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle Klik di Luar Dropdown untuk Menutup Menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Tutup menu mobile & profile saat lokasi berpindah
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsProfileMenuOpen(false);
    }, [location]);

    const handleLogout = () => {
        logout();
        setIsProfileMenuOpen(false);
        setIsMobileMenuOpen(false);
        navigate('/login');
    };

    if (location.pathname.startsWith('/admin')) {
        return null;
    }

    const currentLogo = isTransparent ? logoImg : logo2Img;

    // Helper class untuk warna teks link berdasarkan keaktifan & mode transparan
    const linkTextColor = (isActive) => {
        if (isActive) return 'text-[#0194F3] font-black';
        return isTransparent
            ? 'text-white hover:text-sky-300'
            : 'text-slate-700 hover:text-[#0194F3]';
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 h-20 sm:h-24 transition-all duration-300 ${
                isTransparent
                    ? 'bg-transparent'
                    : 'bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">

                {/* Brand Logo */}
                <NavLink to="/" className="flex items-center group decoration-none shrink-0">
                    <img
                        src={currentLogo}
                        alt="Dafatih Transport Logo"
                        className="h-16 sm:h-20 lg:h-24 w-auto object-contain transition-all duration-300 group-hover:scale-105"
                    />
                </NavLink>

                {/* Desktop Navigasi Utama */}
                <nav className="hidden lg:flex items-center gap-6 px-2 py-2">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `text-xs sm:text-sm font-bold transition-colors ${linkTextColor(isActive)}`
                        }
                    >
                        Beranda
                    </NavLink>
                    <NavLink
                        to="/mobil"
                        className={({ isActive }) =>
                            `text-xs sm:text-sm font-bold transition-colors ${linkTextColor(isActive)}`
                        }
                    >
                        Armada
                    </NavLink>
                    <NavLink
                        to="/tarif"
                        className={({ isActive }) =>
                            `text-xs sm:text-sm font-bold transition-colors ${linkTextColor(isActive)}`
                        }
                    >
                        Rute &amp; Tarif
                    </NavLink>
                    <NavLink
                        to="/pesan"
                        className={({ isActive }) =>
                            `text-xs sm:text-sm font-bold transition-colors ${linkTextColor(isActive)}`
                        }
                    >
                        Buat Pesanan
                    </NavLink>
                </nav>

                {/* Header Actions Desktop */}
                <div className="hidden lg:flex items-center gap-3 shrink-0">
                    {clientUser ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                type="button"
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className={`flex items-center gap-2.5 backdrop-blur-md border pl-2 pr-3 py-1.5 rounded-2xl shadow-xs transition-all cursor-pointer ${
                                    isTransparent
                                        ? 'bg-black/30 hover:bg-black/40 border-white/30 text-white'
                                        : 'bg-white/90 hover:bg-white border-slate-200/90 text-slate-900'
                                }`}
                            >
                                <div className="w-8 h-8 bg-[#0194F3] text-white rounded-xl flex items-center justify-center font-black text-xs shadow-xs">
                                    {clientUser.name ? clientUser.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="text-left hidden sm:block">
                                    <p className={`text-xs font-extrabold leading-none ${
                                        isTransparent ? 'text-white' : 'text-slate-900'
                                    }`}>
                                        {clientUser.name?.split(' ')[0]}
                                    </p>
                                    <span className="text-[9px] font-bold text-emerald-400 block mt-0.5">
                                        • Sesi Aktif
                                    </span>
                                </div>
                                <i className={`fa-solid fa-chevron-down text-[10px] transition-transform duration-200 ${
                                    isTransparent ? 'text-white/70' : 'text-slate-400'
                                } ${isProfileMenuOpen ? 'rotate-180' : ''}`}></i>
                            </button>

                            {/* Dropdown Menu Desktop */}
                            {isProfileMenuOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                                    <div className="py-2 text-xs font-bold text-slate-700 divide-y divide-slate-100">
                                        <div className="py-1">
                                            <Link
                                                to="/pesanan-saya"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                                            >
                                                <i className="fa-solid fa-receipt text-sm text-[#0194F3] w-5 text-center"></i>
                                                <span>Pesanan Saya</span>
                                            </Link>

                                            <Link
                                                to="/profile/edit"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                                            >
                                                <i className="fa-regular fa-user text-sm text-[#0194F3] w-5 text-center"></i>
                                                <span>Edit Profil Saya</span>
                                            </Link>

                                            <Link
                                                to="/payments"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                                            >
                                                <i className="fa-regular fa-credit-card text-sm text-[#0194F3] w-5 text-center"></i>
                                                <span>Riwayat Pembayaran</span>
                                            </Link>
                                        </div>

                                        <div className="py-1">
                                            <Link
                                                to="/refunds"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                                className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <i className="fa-solid fa-rotate-left text-sm text-[#0194F3] w-5 text-center"></i>
                                                    <span>Pengajuan Refund</span>
                                                </div>
                                                <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                                                    Baru!
                                                </span>
                                            </Link>

                                            <Link
                                                to="/promos"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                                            >
                                                <i className="fa-regular fa-envelope text-sm text-[#0194F3] w-5 text-center"></i>
                                                <span>Info Promo &amp; Diskon</span>
                                            </Link>
                                        </div>

                                        <div className="pt-1">
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-rose-50 text-rose-600 transition-colors text-left cursor-pointer"
                                            >
                                                <i className="fa-solid fa-power-off text-sm w-5 text-center"></i>
                                                <span>Log Out</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                    isTransparent
                                        ? 'text-white hover:text-sky-300 hover:bg-white/10'
                                        : 'text-slate-700 hover:text-[#0194F3] hover:bg-slate-100/80'
                                }`}
                            >
                                <i className="fa-solid fa-right-to-bracket text-xs"></i>
                                <span>Login</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/register')}
                                className="bg-[#0194F3] hover:bg-sky-600 text-white px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                            >
                                <i className="fa-solid fa-user-plus text-xs"></i>
                                <span>Daftar</span>
                            </button>
                        </>
                    )}
                </div>

                {/* Tombol Hamburger (Mobile & Tablet) */}
                <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className={`lg:hidden text-xl p-2 rounded-xl cursor-pointer transition-colors ${
                        isTransparent
                            ? 'text-white hover:text-sky-300'
                            : 'text-slate-700 hover:text-[#0194F3]'
                    }`}
                >
                    <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
                </button>

            </div>

            {/* Menu Drawer Mobile & Tablet */}
            {isMobileMenuOpen && (
                <div className="lg:hidden bg-white/95 backdrop-blur-lg border-b border-slate-200/80 px-4 py-4 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-col space-y-1">
                        <p className="px-3 text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Navigasi Utama</p>
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) =>
                                `px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                                    isActive ? 'bg-sky-50 text-[#0194F3]' : 'text-slate-700 hover:bg-slate-50'
                                }`
                            }
                        >
                            Beranda
                        </NavLink>
                        <NavLink
                            to="/mobil"
                            className={({ isActive }) =>
                                `px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                                    isActive ? 'bg-sky-50 text-[#0194F3]' : 'text-slate-700 hover:bg-slate-50'
                                }`
                            }
                        >
                            Armada
                        </NavLink>
                        <NavLink
                            to="/tarif"
                            className={({ isActive }) =>
                                `px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                                    isActive ? 'bg-sky-50 text-[#0194F3]' : 'text-slate-700 hover:bg-slate-50'
                                }`
                            }
                        >
                            Rute &amp; Tarif
                        </NavLink>
                        <NavLink
                            to="/pesan"
                            className={({ isActive }) =>
                                `px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                                    isActive ? 'bg-sky-50 text-[#0194F3]' : 'text-slate-700 hover:bg-slate-50'
                                }`
                            }
                        >
                            Buat Pesanan
                        </NavLink>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                        {clientUser ? (
                            <div className="space-y-1">
                                <p className="px-3 text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
                                    Akun Saya ({clientUser.name?.split(' ')[0]})
                                </p>

                                <Link
                                    to="/pesanan-saya"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
                                >
                                    <i className="fa-solid fa-receipt text-[#0194F3] w-4 text-center"></i>
                                    <span>Pesanan Saya</span>
                                </Link>

                                <Link
                                    to="/profile/edit"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
                                >
                                    <i className="fa-regular fa-user text-[#0194F3] w-4 text-center"></i>
                                    <span>Edit Profil Saya</span>
                                </Link>

                                <Link
                                    to="/payments"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
                                >
                                    <i className="fa-regular fa-credit-card text-[#0194F3] w-4 text-center"></i>
                                    <span>Riwayat Pembayaran</span>
                                </Link>

                                <Link
                                    to="/refunds"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center justify-between px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <i className="fa-solid fa-rotate-left text-[#0194F3] w-4 text-center"></i>
                                        <span>Pengajuan Refund</span>
                                    </div>
                                    <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                                        Baru!
                                    </span>
                                </Link>

                                <Link
                                    to="/promos"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-xl"
                                >
                                    <i className="fa-regular fa-envelope text-[#0194F3] w-4 text-center"></i>
                                    <span>Info Promo &amp; Diskon</span>
                                </Link>

                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 mt-3 cursor-pointer"
                                >
                                    <i className="fa-solid fa-right-from-bracket text-xs"></i>
                                    <span>Logout</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        navigate('/login');
                                    }}
                                    className="flex-1 border border-slate-300 text-slate-700 hover:bg-slate-50 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <i className="fa-solid fa-right-to-bracket text-xs"></i>
                                    <span>Login</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        navigate('/register');
                                    }}
                                    className="flex-1 bg-[#0194F3] hover:bg-sky-600 text-white py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <i className="fa-solid fa-user-plus text-xs"></i>
                                    <span>Daftar</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
