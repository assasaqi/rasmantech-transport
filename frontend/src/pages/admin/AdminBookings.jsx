import React, { useEffect, useState } from 'react';
import { getBookings, updateBookingStatus, deleteBooking } from '@/services/api';
import AdminNavbar from '@/components/AdminNavbar';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

const AdminBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedRows, setExpandedRows] = useState({});

    const { toast, showToast, hideToast } = useToast();

    const toggleRow = (id) => {
        setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const loadBookings = () => {
        setLoading(true);
        getBookings()
            .then((res) => {
                let data = [];
                if (res.data?.success && Array.isArray(res.data.data)) {
                    data = res.data.data;
                } else if (Array.isArray(res.data)) {
                    data = res.data;
                }
                setBookings(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Gagal mengambil data booking:', err);
                setBookings([]);
                setLoading(false);
            });
    };

    useEffect(() => {
        loadBookings();
    }, []);

    const handleStatusChange = async (id, status) => {
        try {
            await updateBookingStatus(id, status);
            showToast('Status pemesanan berhasil diperbarui!', 'success');
            loadBookings();
        } catch (err) {
            showToast('Gagal memperbarui status di database.', 'error');
        }
    };

    const handleDelete = async (id, code) => {
        if (window.confirm(`Hapus transaksi pemesanan [${code || id}] ini?`)) {
            try {
                await deleteBooking(id);
                showToast('Transaksi pemesanan berhasil dihapus!', 'success');
                loadBookings();
            } catch (err) {
                showToast('Gagal menghapus transaksi dari database.', 'error');
            }
        }
    };

    // Helper format Tampilan Jenis Layanan
    const formatServiceTypeLabel = (typeStr) => {
        if (!typeStr) return 'Antar-Jemput';
        const clean = typeStr.toString().replace(/_/g, ' ').toLowerCase();
        if (clean.includes('sewa')) return 'Sewa Mobil';
        if (clean.includes('antar')) return 'Antar-Jemput';
        if (clean.includes('tour') || clean.includes('paket')) return 'Paket Tour';
        return typeStr;
    };

    // Helper Format Tanggal Penjemputan (DD MMM YYYY)
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    // Helper Format Waktu Pembuatan Pesanan (DD MMM YYYY, HH:mm WITA)
    const formatCreatedDateTime = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            const dateFormatted = d.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
            const timeFormatted = d.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
            }).replace(/\./g, ':');
            return `${dateFormatted}, ${timeFormatted} WITA`;
        } catch {
            return dateStr;
        }
    };

    // Helper Format Jam Penjemputan (HH:mm)
    const formatTime = (timeVal) => {
        if (!timeVal) return '-';
        if (typeof timeVal === 'string' && timeVal.includes('T')) {
            const dateObj = new Date(timeVal);
            if (!isNaN(dateObj.getTime())) {
                const hours = String(dateObj.getUTCHours()).padStart(2, '0');
                const minutes = String(dateObj.getUTCMinutes()).padStart(2, '0');
                return `${hours}:${minutes}`;
            }
        }
        if (typeof timeVal === 'string') {
            return timeVal.substring(0, 5);
        }
        return timeVal;
    };

    // Helper mengekstrak durasi untuk Sewa Mobil
    const getDurationText = (b) => {
        if (b.duration) {
            return typeof b.duration === 'number' ? `${b.duration} Hari` : b.duration;
        }
        if (b.notes && b.notes.toLowerCase().includes('durasi')) {
            const match = b.notes.match(/durasi:\s*([^\n,]+)/i);
            if (match && match[1]) return match[1].trim();
        }
        return '1 Hari';
    };

    const getStatusBadge = (status) => {
        const s = (status || 'pending').toLowerCase();
        switch (s) {
            case 'confirmed':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'completed':
                return 'bg-sky-50 text-[#0194F3] border-sky-200';
            case 'cancelled':
            case 'rejected':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            default:
                return 'bg-amber-50 text-amber-700 border-amber-200';
        }
    };

    return (
        <div className="min-h-screen bg-[#F2F4F7] text-slate-800 md:pl-60 transition-all relative">
            <AdminNavbar />

            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={hideToast}
            />

            <main className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
                {/* HEADER DASHBOARD */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xs border border-slate-200/80">
                    <div>
                        <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                            <i className="fa-solid fa-clipboard-list text-[#0194F3]"></i>
                            <span>Kelola Transaksi Pemesanan</span>
                        </h2>
                        <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">
                            Pantau dan perbarui status pesanan sewa serta antar-jemput dari pelanggan.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={loadBookings}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
                    >
                        <i className="fa-solid fa-rotate-right text-[10px] sm:text-xs text-[#0194F3]"></i>
                        <span>Muat Ulang Data</span>
                    </button>
                </div>

                {/* TABEL DATA PEMESANAN */}
                {loading ? (
                    <div className="text-center py-12 sm:py-16 text-slate-500 bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs">
                        <i className="fa-solid fa-spinner fa-spin text-lg sm:text-xl text-[#0194F3] mr-2"></i>
                        <span className="text-xs font-semibold">Memuat data pemesanan...</span>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-[11px] sm:text-xs md:text-sm border-collapse min-w-[700px] sm:min-w-[850px]">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider">
                                        <th className="py-2.5 sm:py-3.5 px-3 sm:px-4">Kode & Dibuat</th>
                                        <th className="py-2.5 sm:py-3.5 px-3 sm:px-4">Pelanggan</th>
                                        <th className="py-2.5 sm:py-3.5 px-3 sm:px-4">Layanan</th>
                                        <th className="py-2.5 sm:py-3.5 px-3 sm:px-4">Detail Pemesanan</th>
                                        <th className="py-2.5 sm:py-3.5 px-3 sm:px-4">Tarif</th>
                                        <th className="py-2.5 sm:py-3.5 px-3 sm:px-4">Status</th>
                                        <th className="py-2.5 sm:py-3.5 px-3 sm:px-4 text-center w-16 sm:w-20">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {bookings.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-10 text-slate-400 text-xs">
                                                Belum ada data pemesanan yang masuk.
                                            </td>
                                        </tr>
                                    ) : (
                                        bookings.map((b, index) => {
                                            const rowId = b.id || index;
                                            const isExpanded = !!expandedRows[rowId];
                                            const bookingCode = b.booking_code || b.bookingCode || b.code || `DFT-${b.id || index + 1}`;
                                            const custName = b.customer_name || b.customerName || b.custName || 'Pelanggan';
                                            const custPhone = b.customer_phone || b.customerPhone || b.custWa || '-';
                                            const rawServiceType = b.service_type || b.serviceType || b.jenisLayanan || '';
                                            const serviceLabel = formatServiceTypeLabel(rawServiceType);
                                            const isSewaMobil = serviceLabel === 'Sewa Mobil';

                                            // Relasi & Lokasi
                                            const vehicleName = b.vehicle?.name || b.vehicle?.model || b.armada || b.carType || b.car_name || '';
                                            const tourName = b.tour_package?.name || b.tour_package?.title || b.tourName || '';

                                            const pickupLoc = b.pickup_address || b.pickupAddress || b.pickup_location || b.pickupLocation || b.route?.pickup_location || b.route?.origin || '-';
                                            const dropLoc = b.dropoff_location || b.dropoffLocation || b.route?.dropoff_location || b.route?.destination || '-';

                                            const passengerCount = b.passenger_count || b.passengerCount || b.passengers || 1;
                                            const priceVal = Number(b.total_price || b.totalPrice || b.price || 0);
                                            const currentStatus = (b.status || 'pending').toLowerCase();
                                            const createdAtStr = formatCreatedDateTime(b.created_at || b.createdAt);

                                            const mainTitle = isSewaMobil
                                                ? (vehicleName || 'Unit Mobil')
                                                : serviceLabel === 'Paket Tour'
                                                ? (tourName || 'Paket Wisata')
                                                : `${pickupLoc} → ${dropLoc}`;

                                            return (
                                                <tr key={rowId} className="hover:bg-slate-50/80 transition-colors">
                                                    {/* Kode Booking & Waktu Dibuat */}
                                                    <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 whitespace-nowrap">
                                                        <div className="font-extrabold text-[#0194F3] text-[11px] sm:text-xs">
                                                            #{bookingCode}
                                                        </div>
                                                        <div className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                                            <i className="fa-regular fa-clock text-[8px]"></i>
                                                            <span>{createdAtStr}</span>
                                                        </div>
                                                    </td>

                                                    {/* Pelanggan */}
                                                    <td className="py-2.5 sm:py-3.5 px-3 sm:px-4">
                                                        <div className="font-bold text-slate-900 text-xs sm:text-sm">{custName}</div>
                                                        <a
                                                            href={`https://wa.me/${custPhone.replace(/[^0-9]/g, '')}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-slate-500 hover:text-[#0194F3] inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold mt-0.5"
                                                        >
                                                            <i className="fa-brands fa-whatsapp text-emerald-500 text-[10px]"></i>
                                                            <span>{custPhone}</span>
                                                        </a>
                                                    </td>

                                                    {/* Layanan */}
                                                    <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 whitespace-nowrap">
                                                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-bold bg-sky-50 text-[#0194F3] border border-sky-100">
                                                            {serviceLabel}
                                                        </span>
                                                    </td>

                                                    {/* Detail Pemesanan */}
                                                    <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 text-slate-700 min-w-[150px]">
                                                        {/* --- KHUSUS MOBILE: DROPDOWN COLLAPSIBLE --- */}
                                                        <div className="sm:hidden">
                                                            <button
                                                                type="button"
                                                                onClick={() => toggleRow(rowId)}
                                                                className="flex items-center justify-between w-full gap-2 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-lg text-left transition-colors cursor-pointer border border-slate-200/60"
                                                            >
                                                                <span className="font-bold text-slate-900 text-[11px] truncate max-w-[110px]">
                                                                    {mainTitle}
                                                                </span>
                                                                <i className={`fa-solid fa-chevron-down text-[10px] text-[#0194F3] transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-180' : ''}`}></i>
                                                            </button>

                                                            {/* KONTEN DROPDOWN MOBILE */}
                                                            {isExpanded && (
                                                                <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200/70 text-[10px] space-y-1.5">
                                                                    {isSewaMobil && (
                                                                        <div className="text-slate-600">
                                                                            <span className="font-semibold text-slate-800">Jemput:</span> {pickupLoc}
                                                                        </div>
                                                                    )}

                                                                    {serviceLabel === 'Paket Tour' && (
                                                                        <div className="text-slate-600">
                                                                            <span className="font-semibold text-slate-800">Jemput:</span> {pickupLoc}
                                                                        </div>
                                                                    )}

                                                                    {serviceLabel === 'Antar-Jemput' && (
                                                                        <div className="text-slate-600 space-y-0.5">
                                                                            <div><span className="font-semibold text-slate-800">Dari:</span> {pickupLoc}</div>
                                                                            <div><span className="font-semibold text-slate-800">Ke:</span> {dropLoc}</div>
                                                                        </div>
                                                                    )}

                                                                    <div className="pt-1.5 border-t border-slate-200/70 flex items-center gap-1.5 flex-wrap text-slate-500">
                                                                        <span>
                                                                            <i className="fa-regular fa-calendar-days text-[#0194F3] mr-0.5"></i>
                                                                            {formatDate(b.pickup_date || b.pickupDate)}
                                                                        </span>
                                                                        <span>
                                                                            <i className="fa-regular fa-clock text-[#0194F3] mr-0.5"></i>
                                                                            {formatTime(b.pickup_time || b.pickupTime)}
                                                                        </span>

                                                                        {isSewaMobil ? (
                                                                            <span className="font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                                                                <i className="fa-solid fa-clock-rotate-left text-sky-500 mr-0.5"></i>
                                                                                {getDurationText(b)}
                                                                            </span>
                                                                        ) : (
                                                                            <span className="font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                                                                <i className="fa-solid fa-user-group text-sky-500 mr-0.5"></i>
                                                                                {passengerCount} Orang
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* --- TAMPILAN DESKTOP (TETAP TERBUKA UTUH) --- */}
                                                        <div className="hidden sm:block">
                                                            {isSewaMobil && (
                                                                <div>
                                                                    <span className="font-bold text-slate-900 block text-xs sm:text-sm">{vehicleName || 'Unit Mobil'}</span>
                                                                    <span className="text-[10px] sm:text-xs text-slate-500">Jemput: {pickupLoc}</span>
                                                                </div>
                                                            )}

                                                            {serviceLabel === 'Paket Tour' && (
                                                                <div>
                                                                    <span className="font-bold text-slate-900 block text-xs sm:text-sm">{tourName || 'Paket Wisata'}</span>
                                                                    <span className="text-[10px] sm:text-xs text-slate-500">Jemput: {pickupLoc}</span>
                                                                </div>
                                                            )}

                                                            {serviceLabel === 'Antar-Jemput' && (
                                                                <div className="flex items-center gap-1 flex-wrap text-xs">
                                                                    <span className="font-semibold text-slate-800">{pickupLoc}</span>
                                                                    <i className="fa-solid fa-arrow-right text-[9px] text-slate-400"></i>
                                                                    <span className="font-semibold text-slate-800">{dropLoc}</span>
                                                                </div>
                                                            )}

                                                            <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                                                <span>
                                                                    <i className="fa-regular fa-calendar-days text-[#0194F3] mr-0.5"></i>
                                                                    {formatDate(b.pickup_date || b.pickupDate)}
                                                                </span>
                                                                <span>
                                                                    <i className="fa-regular fa-clock text-[#0194F3] mr-0.5"></i>
                                                                    {formatTime(b.pickup_time || b.pickupTime)}
                                                                </span>

                                                                {isSewaMobil ? (
                                                                    <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">
                                                                        <i className="fa-solid fa-clock-rotate-left text-sky-500 mr-0.5"></i>
                                                                        {getDurationText(b)}
                                                                    </span>
                                                                ) : (
                                                                    <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">
                                                                        <i className="fa-solid fa-user-group text-sky-500 mr-0.5"></i>
                                                                        {passengerCount} Orang
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Tarif */}
                                                    <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-extrabold text-slate-900 whitespace-nowrap text-xs sm:text-sm">
                                                        {priceVal > 0 ? `Rp ${new Intl.NumberFormat('id-ID').format(priceVal)}` : '-'}
                                                    </td>

                                                    {/* Status */}
                                                    <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 whitespace-nowrap">
                                                        <select
                                                            value={currentStatus}
                                                            onChange={(e) => handleStatusChange(b.id, e.target.value)}
                                                            className={`text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border outline-none cursor-pointer ${getStatusBadge(currentStatus)}`}
                                                        >
                                                            <option value="pending">Pending</option>
                                                            <option value="confirmed">Confirmed</option>
                                                            <option value="completed">Completed</option>
                                                            <option value="cancelled">Cancelled</option>
                                                        </select>
                                                    </td>

                                                    {/* Aksi */}
                                                    <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 text-center whitespace-nowrap">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(b.id, bookingCode)}
                                                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors flex items-center justify-center cursor-pointer mx-auto"
                                                            title="Hapus Transaksi"
                                                        >
                                                            <i className="fa-solid fa-trash-can text-[10px] sm:text-xs"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminBookings;
