import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getVehicles, getRoutes, getGalleries, getBlogs, getBookings } from '@/services/api';
import AdminNavbar from '@/components/AdminNavbar';

const Dashboard = () => {
    const navigate = useNavigate();

    // Fungsi membaca nama/email admin dari localStorage
    const getAdminDisplayName = () => {
        try {
            const saved = localStorage.getItem('adminUser');
            if (!saved) return 'Admin';

            if (!saved.startsWith('{')) {
                return saved;
            }

            const parsed = JSON.parse(saved);
            return parsed.name || parsed.email || 'Admin';
        } catch (e) {
            return 'Admin';
        }
    };

    const adminDisplayName = getAdminDisplayName();

    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalBookings: 0,
        totalVehicles: 0,
        totalRoutes: 0,
        totalGalleries: 0,
        totalBlogs: 0,
        favoriteVehicles: []
    });
    const [loading, setLoading] = useState(true);

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(number || 0);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');

        // Ambil data analitik serta data seluruh modul secara paralel dengan fallback mandiri
        Promise.all([
            axios.get('/api/admin/analytics', {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(() => ({ data: { success: false, data: null } })),
            getBookings().catch(() => ({ data: { data: [] } })),
            getVehicles().catch(() => ({ data: { data: [] } })),
            getRoutes().catch(() => ({ data: { data: [] } })),
            getGalleries().catch(() => ({ data: { data: [] } })),
            getBlogs().catch(() => ({ data: { data: [] } }))
        ])
            .then(([resAnalytics, resBookings, resVehicles, resRoutes, resGalleries, resBlogs]) => {
                const analyticsData = resAnalytics.data?.success ? resAnalytics.data.data : null;
                const bookingsList = Array.isArray(resBookings.data?.data) ? resBookings.data.data : [];

                // Hitung cadangan jumlah transaksi dari endpoint /api/bookings
                const fallbackTotalBookings = bookingsList.length;

                // Hitung cadangan pendapatan dari pesanan yang berstatus selesai/terkonfirmasi
                const fallbackTotalRevenue = bookingsList
                    .filter(b => ['confirmed', 'completed', 'CONFIRMED', 'COMPLETED'].includes(b.status))
                    .reduce((sum, b) => sum + Number(b.total_price || b.totalPrice || 0), 0);

                setStats({
                    totalRevenue: (analyticsData?.totalRevenue && analyticsData.totalRevenue > 0)
                        ? analyticsData.totalRevenue
                        : fallbackTotalRevenue,
                    totalBookings: (analyticsData?.totalBookings && analyticsData.totalBookings > 0)
                        ? analyticsData.totalBookings
                        : fallbackTotalBookings,
                    totalVehicles: analyticsData?.totalVehicles || resVehicles.data?.data?.length || 0,
                    totalRoutes: resRoutes.data?.data?.length || 0,
                    totalGalleries: resGalleries.data?.data?.length || 0,
                    totalBlogs: resBlogs.data?.data?.length || 0,
                    favoriteVehicles: analyticsData?.favoriteVehicles || []
                });
                setLoading(false);
            })
            .catch((err) => {
                console.error('Gagal mengambil data statistik:', err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-[#F2F4F7] text-slate-800 md:pl-60 transition-all relative">
            <AdminNavbar />

            <main className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">

                {/* BANNER HERO HEADER */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-xs border border-slate-200/80 relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-sky-50/80 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5">
                        <div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 text-[#0194F3] border border-sky-100 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-2">
                                <i className="fa-solid fa-chart-line"></i> Ringkasan Panel Admin
                            </div>
                            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                                Selamat Datang, <span className="text-[#0194F3]">{adminDisplayName}</span>!
                            </h1>
                            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-1 max-w-2xl leading-relaxed">
                                Kelola seluruh pemesanan, daftar rute penjemputan, armada mobil, serta artikel blog Dafatih Transport dalam satu panel terintegrasi.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate('/admin/profile')}
                            className="self-start sm:self-center px-4 py-2.5 sm:px-5 sm:py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
                        >
                            <i className="fa-solid fa-user-gear text-[#0194F3]"></i>
                            <span>Pengaturan Profil</span>
                        </button>
                    </div>
                </div>

                {/* BARIS UTAMA KPI KEUANGAN & TRANSAKSI */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5">
                    {/* Card KPI Pendapatan */}
                    <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                                Total Pendapatan Layanan
                            </span>
                            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900">
                                {loading ? (
                                    <span className="flex items-center gap-2 text-slate-400 text-base sm:text-xl font-medium">
                                        <i className="fa-solid fa-spinner fa-spin text-[#0194F3]"></i> Memuat...
                                    </span>
                                ) : (
                                    formatRupiah(stats.totalRevenue)
                                )}
                            </h2>
                            <span className="text-[10px] sm:text-[11px] text-emerald-600 font-bold mt-1 inline-flex items-center gap-1.5">
                                <i className="fa-solid fa-circle-check"></i> Pesanan Selesai &amp; Terkonfirmasi
                            </span>
                        </div>
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl sm:text-2xl shadow-2xs shrink-0">
                            <i className="fa-solid fa-wallet"></i>
                        </div>
                    </div>

                    {/* Card KPI Total Pemesanan */}
                    <div
                        onClick={() => navigate('/admin/bookings')}
                        className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group flex items-center justify-between"
                    >
                        <div>
                            <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
                                Total Transaksi Pemesanan
                            </span>
                            <h2 className="text-xl sm:text-3xl font-extrabold text-[#0194F3]">
                                {loading ? (
                                    <span className="flex items-center gap-2 text-slate-400 text-base sm:text-xl font-medium">
                                        <i className="fa-solid fa-spinner fa-spin text-[#0194F3]"></i> Memuat...
                                    </span>
                                ) : (
                                    `${stats.totalBookings} Transaksi`
                                )}
                            </h2>
                            <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold mt-1 inline-flex items-center gap-1 group-hover:text-[#0194F3] transition-colors">
                                Kelola pesanan masuk <i className="fa-solid fa-arrow-right text-[9px]"></i>
                            </span>
                        </div>
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-sky-50 text-[#0194F3] group-hover:bg-[#0194F3] group-hover:text-white transition-colors flex items-center justify-center text-xl sm:text-2xl shadow-2xs shrink-0">
                            <i className="fa-solid fa-receipt"></i>
                        </div>
                    </div>
                </div>

                {/* GRID KARTU STATISTIK MODUL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">

                    {/* Card 1: Rute & Tarif */}
                    <div
                        onClick={() => navigate('/admin/routes')}
                        className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group flex items-center justify-between"
                    >
                        <div>
                            <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-0.5 sm:mb-1">
                                Total Rute Transfer
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0194F3]">
                                {loading ? '...' : stats.totalRoutes}
                            </h2>
                            <span className="text-[10px] sm:text-[11px] text-slate-400 font-semibold mt-1 inline-block">
                                Rute &amp; Tarif Aktif
                            </span>
                        </div>
                        <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-sky-50 text-[#0194F3] group-hover:bg-[#0194F3] group-hover:text-white transition-colors flex items-center justify-center text-lg sm:text-xl shadow-2xs shrink-0">
                            <i className="fa-solid fa-route"></i>
                        </div>
                    </div>

                    {/* Card 2: Armada Mobil */}
                    <div
                        onClick={() => navigate('/admin/vehicles')}
                        className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group flex items-center justify-between"
                    >
                        <div>
                            <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-0.5 sm:mb-1">
                                Total Armada Mobil
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-500">
                                {loading ? '...' : stats.totalVehicles}
                            </h2>
                            <span className="text-[10px] sm:text-[11px] text-slate-400 font-semibold mt-1 inline-block">
                                Unit Siap Sewa
                            </span>
                        </div>
                        <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-amber-50 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors flex items-center justify-center text-lg sm:text-xl shadow-2xs shrink-0">
                            <i className="fa-solid fa-car"></i>
                        </div>
                    </div>

                    {/* Card 3: Galeri */}
                    <div
                        onClick={() => navigate('/admin/galleries')}
                        className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group flex items-center justify-between"
                    >
                        <div>
                            <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-0.5 sm:mb-1">
                                Total Foto Galeri
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                                {loading ? '...' : stats.totalGalleries}
                            </h2>
                            <span className="text-[10px] sm:text-[11px] text-slate-400 font-semibold mt-1 inline-block">
                                Dokumentasi Kegiatan
                            </span>
                        </div>
                        <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors flex items-center justify-center text-lg sm:text-xl shadow-2xs shrink-0">
                            <i className="fa-solid fa-images"></i>
                        </div>
                    </div>

                    {/* Card 4: Blog */}
                    <div
                        onClick={() => navigate('/admin/blogs')}
                        className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group flex items-center justify-between"
                    >
                        <div>
                            <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-0.5 sm:mb-1">
                                Total Artikel Blog
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-indigo-600">
                                {loading ? '...' : stats.totalBlogs}
                            </h2>
                            <span className="text-[10px] sm:text-[11px] text-slate-400 font-semibold mt-1 inline-block">
                                Artikel Dipublikasikan
                            </span>
                        </div>
                        <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center justify-center text-lg sm:text-xl shadow-2xs shrink-0">
                            <i className="fa-solid fa-blog"></i>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default Dashboard;
