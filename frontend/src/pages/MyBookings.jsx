import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import komponen BookingCard
import BookingCard from "@/components/booking/BookingCard";

// Import resmi dari src/services/api.js
import API, { getBookings } from '../services/api';

const MyBookings = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  // State untuk menyimpan ID pesanan yang sedang dibuka detailnya (Accordion)
  const [expandedBookingIds, setExpandedBookingIds] = useState({});

  const fetchBookingsData = async () => {
    setLoading(true);

    const token = localStorage.getItem('token') || localStorage.getItem('clientToken');

    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      let response;
      try {
        response = await getBookings();
      } catch (err) {
        if (err.response?.status === 404) {
          response = await API.get('/client/bookings');
        } else {
          throw err;
        }
      }

      const data = response.data?.data || response.data?.bookings || response.data || [];

      if (Array.isArray(data)) {
        setBookings(data);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Gagal mengambil data booking dari API:', error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('clientToken');
        navigate('/login', { replace: true });
        return;
      } else {
        const errorMsg = error.response?.data?.message || 'Gagal memuat riwayat pesanan dari server.';
        showMessage('error', errorMsg);
      }
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingsData();
  }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const toggleExpand = (id) => {
    setExpandedBookingIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="min-h-screen bg-[#f3f6f9] font-sans pt-20 sm:pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

        {/* Toast Alert */}
        {message.text && (
          <div
            className={`p-3 sm:p-4 mb-4 rounded-xl shadow-sm text-xs sm:text-sm flex items-center justify-between transition-all ${
              message.type === 'error'
                ? 'bg-rose-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage({ type: '', text: '' })} className="font-bold text-lg leading-none">
              ×
            </button>
          </div>
        )}

        {/* Layout Grid 2 Kolom */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">

          {/* SISI KIRI: Judul Halaman */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div>
              <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                Cek & Pesan Layanan
              </h1>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1.5">
                <i className="fas fa-file-lines text-slate-400"></i> Riwayat Pesanan Saya
              </p>
            </div>
          </div>

          {/* SISI KANAN: Daftar Pesanan */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">

            <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-8 border border-slate-200/60 shadow-sm">
              {loading ? (
                <div className="py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-7 w-7 border-3 border-[#00a2ff] border-t-transparent mb-2"></div>
                  <p className="text-slate-500 text-xs">Sedang mengambil data pesanan Anda...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="w-12 h-12 bg-sky-50 text-[#00a2ff] rounded-xl flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                    <i className="fas fa-car"></i>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-800">Belum Ada Pesanan</h3>
                  <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">
                    Tidak ditemukan data pemesanan. Silakan buat pesanan baru melalui halaman utama kami.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((item) => {
                    const bookingCode = item.booking_code || item.bookingCode || item.code || `DFT-${item.id}`;
                    const bookingId = item.id || bookingCode;

                    return (
                      <BookingCard
                        key={bookingId}
                        item={item}
                        isExpanded={!!expandedBookingIds[bookingId]}
                        onToggleExpand={() => toggleExpand(bookingId)}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MyBookings;
