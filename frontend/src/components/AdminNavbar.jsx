import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getBookings } from '@/services/api';

// Import aset logo dari folder public/logo
import logoImg from '/logo/logo.png';

const AdminNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [hasNewBookings, setHasNewBookings] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    // Ambil & parse data admin dari localStorage
    const getAdminData = () => {
        try {
            const saved = localStorage.getItem('adminUser');
            if (!saved) return { name: 'Admin', email: '' };

            if (!saved.startsWith('{')) {
                return { name: saved, email: saved };
            }

            return JSON.parse(saved);
        } catch (e) {
            return { name: 'Admin', email: '' };
        }
    };

    const adminData = getAdminData();
    const displayName = adminData.name || adminData.email || 'Admin';

    // Cek pesanan masuk berstatus pending
    const checkNewBookings = () => {
        getBookings()
            .then((res) => {
                const list = Array.isArray(res.data?.data)
                    ? res.data.data
                    : Array.isArray(res.data)
                    ? res.data
                    : [];

                const pendingList = list.filter(
                    (b) => (b.status || '').toLowerCase() === 'pending'
                );

                setPendingCount(pendingList.length);
                setHasNewBookings(pendingList.length > 0);
            })
            .catch(() => {
                // Fallback cek temp_bookings di localStorage jika API error/offline
                try {
                    const temp = JSON.parse(localStorage.getItem('temp_bookings') || '[]');
                    const pendingTemp = temp.filter(
                        (b) => (b.status || '').toLowerCase() === 'pending'
                    );
                    setPendingCount(pendingTemp.length);
                    setHasNewBookings(pendingTemp.length > 0);
                } catch (e) {
                    setHasNewBookings(false);
                    setPendingCount(0);
                }
            });
    };

    useEffect(() => {
        checkNewBookings();
        // Cek pembaruan pesanan setiap 15 detik
        const interval = setInterval(checkNewBookings, 15000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('token');
        navigate('/admin/login');
    };

    // Daftar Menu Navigasi Admin
    const navItems = [
        { label: 'Dashboard', path: '/admin/dashboard', icon: 'fa-gauge' },
        { label: 'Pemesanan', path: '/admin/bookings', icon: 'fa-clipboard-list' },
        { label: 'Armada Mobil', path: '/admin/vehicles', icon: 'fa-car' },
        { label: 'Rute & Tarif', path: '/admin/routes', icon: 'fa-route' },
        { label: 'Galeri', path: '/admin/galleries', icon: 'fa-images' },
        { label: 'Blog', path: '/admin/blogs', icon: 'fa-blog' },
        { label: 'Profil Saya', path: '/admin/profile', icon: 'fa-user-gear' },
    ];

    return (
        <>
            {/* Header Mobile Fixed (Tidak ikut tergulir saat scroll) */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white px-4 flex justify-between items-center z-40 shadow-md">
                <Link to="/admin/dashboard" className="flex items-center">
                    <img
                        src={logoImg}
                        alt="Dafatih Transport Logo"
                        className="h-12 w-auto object-contain"
                    />
                </Link>

                <button
                    type="button"
                    className="relative text-white text-xl p-2 rounded-lg hover:bg-slate-800 cursor-pointer focus:outline-hidden transition-colors"
                    onClick={() => setIsSidebarOpen(true)}
                    aria-label="Buka Menu Sidebar"
                >
                    <i className="fa-solid fa-bars"></i>

                    {/* Indikator Pesanan Baru di Tombol Hamburger Mobile */}
                    {hasNewBookings && (
                        <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-slate-900"></span>
                        </span>
                    )}
                </button>
            </div>

            {/* Spacer mobile agar konten di bawah tidak tertutup header fixed */}
            <div className="h-16 md:hidden" />

            {/* Backdrop Gelap Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 md:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar Utama */}
            <aside
                className={`fixed top-0 left-0 w-60 h-screen bg-slate-900 text-white flex flex-col justify-between z-50 shadow-2xl transition-transform duration-300 ease-in-out md:translate-x-0 ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div>
                    {/* Brand Header Menggunakan Gambar Logo */}
                    <div className="p-4 flex items-center justify-between border-b border-slate-800/80">
                        <Link to="/admin/dashboard" className="flex items-center">
                            <img
                                src={logoImg}
                                alt="Dafatih Transport Logo"
                                className="h-14 w-auto object-contain"
                            />
                        </Link>
                        <button
                            type="button"
                            className="md:hidden text-slate-400 hover:text-white text-base p-1 cursor-pointer"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    {/* Navigasi Menu */}
                    <nav className="flex flex-col gap-1 p-3 overflow-y-auto max-h-[calc(100vh-160px)]">
                        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Menu Utama
                        </div>
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            const isBookingMenu = item.path === '/admin/bookings';

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                        isActive
                                            ? 'bg-[#0194F3] text-white shadow-md shadow-sky-500/20'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <i className={`fa-solid ${item.icon} w-5 text-center text-sm ${
                                            isActive ? 'text-white' : 'text-slate-400'
                                        }`}></i>
                                        <span>{item.label}</span>
                                    </div>

                                    {/* Indikator Lencana Pesanan Baru pada Menu Pemesanan */}
                                    {isBookingMenu && hasNewBookings ? (
                                        <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-5 h-5 flex items-center justify-center animate-pulse shadow-xs">
                                            {pendingCount > 0 ? pendingCount : '!'}
                                        </span>
                                    ) : (
                                        isActive && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer Profil Admin & Tombol Keluar (Icon Only) */}
                <div className="p-3.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 px-1 py-0.5 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 text-[#0194F3] flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-user-gear text-xs"></i>
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className="text-xs font-bold text-slate-200 block truncate leading-tight">
                                {displayName}
                            </span>
                            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Online
                            </span>
                        </div>
                    </div>

                    {/* Tombol Keluar Akun Tanpa Teks (Icon Only) */}
                    <button
                        type="button"
                        onClick={handleLogout}
                        title="Keluar Akun"
                        className="w-9 h-9 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-xs"
                    >
                        <i className="fa-solid fa-right-from-bracket"></i>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default AdminNavbar;
