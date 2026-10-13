import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginClient } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import logoImg from '/logo/logo2.png';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

 const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        const res = await loginClient(formData);

        if (res.data?.success) {
            // Ambil properti `client` dari response backend
            const client = res.data.client;
            const token = res.data.token;

            if (token && client) {
                login(client, token); // Sekarang variabel client sudah terdefinisi
            } else if (token) {
                login({ email: formData.email }, token);
            }

            // 1. Tentukan target rute pengalihan
            let targetRedirect = '/';

            if (typeof location.state?.from === 'string' && location.state.from.startsWith('/')) {
                targetRedirect = location.state.from;
            } else if (localStorage.getItem('pending_booking')) {
                targetRedirect = '/booking';
            }

            // 2. Navigasi ke halaman tujuan
            navigate(targetRedirect, {
                replace: true,
                state: { message: `Selamat datang kembali, ${client?.name || 'Klien'}!` }
            });
        } else {
            setError(res.data?.message || 'Gagal masuk. Silakan periksa email dan kata sandi.');
        }
    } catch (err) {
        console.error('Error login client:', err);
        if (err.response) {
            setError(err.response.data?.message || 'Email atau kata sandi tidak cocok.');
        } else if (err.request) {
            setError('Tidak dapat terhubung ke server backend.');
        } else {
            setError('Terjadi kesalahan sistem.');
        }
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="min-h-screen bg-[#F2F4F7] flex flex-col justify-center items-center px-4 py-12 pt-24">
            <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 space-y-6">

                {/* Header & Logo */}
                <div className="text-center space-y-2">
                    <Link to="/" className="inline-block decoration-none">
                        <img
                            src={logoImg}
                            className="h-14 sm:h-16 w-auto mx-auto object-contain"
                        />
                    </Link>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                        Selamat Datang Kembali
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">
                        Masuk ke akun Anda untuk melanjutkan pemesanan.
                    </p>
                </div>

                {/* Pesan Error Alert Box */}
                {error && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold p-3.5 rounded-2xl flex items-center gap-2 animate-in fade-in duration-150">
                        <i className="fa-solid fa-circle-exclamation shrink-0 text-sm"></i>
                        <span>{error}</span>
                    </div>
                )}

                {/* Form Login */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Alamat Email *
                        </label>
                        <div className="relative flex items-center">
                            <i className="fa-regular fa-envelope absolute left-3.5 text-slate-400 text-xs"></i>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="nama@email.com"
                                className="w-full h-11 pl-9 pr-3.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 font-semibold outline-none focus:border-[#0194F3] transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-bold text-slate-700">
                                Kata Sandi *
                            </label>
                            <Link to="/forgot-password" className="text-[11px] font-bold text-[#0194F3] hover:underline">
                                Lupa kata sandi?
                            </Link>
                        </div>
                        <div className="relative flex items-center">
                            <i className="fa-solid fa-lock absolute left-3.5 text-slate-400 text-xs"></i>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full h-11 pl-9 pr-10 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 font-semibold outline-none focus:border-[#0194F3] transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                            >
                                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 bg-[#0194F3] hover:bg-sky-600 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 mt-2"
                    >
                        {loading ? (
                            <>
                                <i className="fa-solid fa-spinner fa-spin text-sm"></i>
                                <span>Memproses...</span>
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-right-to-bracket text-xs"></i>
                                <span>Masuk Sekarang</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Link Daftar */}
                <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
                    Belum memiliki akun?{' '}
                    <Link to="/register" className="font-bold text-[#0194F3] hover:underline">
                        Daftar sekarang
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default Login;
