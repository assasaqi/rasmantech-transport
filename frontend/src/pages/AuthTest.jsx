import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const AuthTest = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [clientUser, setClientUser] = useState(null);
  const [clientToken, setClientToken] = useState('');

  useEffect(() => {
    // Membaca data dari localStorage saat halaman dimuat
    const token = localStorage.getItem('clientToken');
    const user = localStorage.getItem('clientUser');

    if (token) setClientToken(token);
    if (user) {
      try {
        setClientUser(JSON.parse(user));
      } catch (err) {
        console.error('Gagal mengurai data clientUser:', err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientUser');
    setClientUser(null);
    setClientToken('');
  };

  return (
    <div className="min-h-screen bg-[#F2F4F7] text-slate-800 flex items-center justify-center p-4 pt-24">
      <div className="max-w-xl w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 space-y-6">

        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <i className="fa-solid fa-vial-circle-check text-[#0194F3]"></i>
              <span>Pengujian Auth Klien</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Halaman verifikasi sesi login &amp; registrasi klien.
            </p>
          </div>
          <Link
            to="/"
            className="text-xs font-bold text-slate-600 hover:text-[#0194F3] bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors"
          >
            Kembali
          </Link>
        </div>

        {/* Notifikasi Tunggal (Satu Kartu Status) */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border transition-all ${
            clientUser
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
              : 'bg-amber-50/80 border-amber-300 text-amber-900'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg ${
                clientUser ? 'bg-emerald-500 text-white shadow-xs' : 'bg-amber-500 text-white shadow-xs'
              }`}
            >
              <i className={`fa-solid ${clientUser ? 'fa-circle-check' : 'fa-triangle-exclamation'}`}></i>
            </div>
            <div className="space-y-1">
              <span
                className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wide ${
                  clientUser ? 'bg-emerald-200/80 text-emerald-900' : 'bg-amber-200/80 text-amber-900'
                }`}
              >
                {clientUser ? 'BERHASIL LOGIN' : 'BELUM LOGIN'}
              </span>

              <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                {clientUser
                  ? `Selamat Datang, ${clientUser.name}!`
                  : 'Sesi Login Belum Aktif'}
              </h2>

              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {clientUser
                  ? 'Sesi akun Anda aktif dan data token tersimpan dengan aman di localStorage.'
                  : 'Belum ada data login yang tersimpan di browser. Silakan klik tombol di bawah untuk masuk ke akun Anda.'}
              </p>
            </div>
          </div>
        </div>

        {/* Detail LocalStorage Data */}
        {clientUser ? (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Detail Sesi Pengguna (LocalStorage)
            </h3>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs font-medium">
              <div>
                <span className="text-slate-500">ID Pengguna:</span>{' '}
                <strong className="text-slate-900">{clientUser.id || '-'}</strong>
              </div>
              <div>
                <span className="text-slate-500">Nama Lengkap:</span>{' '}
                <strong className="text-slate-900">{clientUser.name}</strong>
              </div>
              <div>
                <span className="text-slate-500">Email:</span>{' '}
                <strong className="text-slate-900">{clientUser.email}</strong>
              </div>
              <div>
                <span className="text-slate-500">No. HP / WA:</span>{' '}
                <strong className="text-slate-900">{clientUser.phone || '-'}</strong>
              </div>
              <div>
                <span className="text-slate-500">Role:</span>{' '}
                <span className="bg-sky-100 text-[#0194F3] font-bold px-2 py-0.5 rounded-md uppercase text-[10px]">
                  {clientUser.role || 'client'}
                </span>
              </div>
            </div>

            <div>
              <span className="block text-xs font-bold text-slate-500 mb-1">JWT Token:</span>
              <div className="bg-slate-900 text-emerald-400 font-mono text-[10px] p-3 rounded-xl break-all max-h-24 overflow-y-auto">
                {clientToken || 'Token tidak ditemukan.'}
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm py-3 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-right-from-bracket text-xs"></i>
              <span>Logout / Hapus Sesi</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full bg-[#0194F3] hover:bg-sky-600 text-white font-bold text-xs sm:text-sm py-3 rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-right-to-bracket text-xs"></i>
              <span>Buka Halaman Login</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="w-full bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm py-3 rounded-xl transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <i className="fa-solid fa-user-plus text-xs"></i>
              <span>Buka Halaman Register</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AuthTest;
