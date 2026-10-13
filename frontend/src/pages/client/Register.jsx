import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerClient } from '@/services/api';
import logoImg from '/logo/logo2.png';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
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
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Konfirmasi kata sandi tidak cocok!');
            return;
        }

        setLoading(true);

        try {
            const res = await registerClient({
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                password: formData.password
            });

            if (res.data?.success) {
                // Berhasil mendaftar, arahkan pengguna ke halaman login
                navigate('/login');
            } else {
                setError(res.data?.message || 'Gagal mendaftar. Silakan coba lagi.');
            }
        } catch (err) {
            console.error('Error register client:', err);
            setError(err.response?.data?.message || 'Gagal mendaftar. Silakan coba lagi.');
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
                        Buat Akun Baru
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">
                        Lengkapi data diri Anda untuk kemudahan bertransaksi.
                    </p>
                </div>

                {/* Pesan Error */}
                {error && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold p-3.5 rounded-2xl flex items-center gap-2">
                        <i className="fa-solid fa-circle-exclamation shrink-0 text-sm"></i>
                        <span>{error}</span>
                    </div>
                )}

                {/* Form Register */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Nama Lengkap *
                        </label>
                        <div className="relative flex items-center">
                            <i className="fa-regular fa-user absolute left-3.5 text-slate-400 text-xs"></i>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Contoh: Rasman Tranport"
                                className="w-full h-11 pl-9 pr-3.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 font-semibold outline-none focus:border-[#0194F3] transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Nomor WhatsApp / HP *
                        </label>
                        <div className="relative flex items-center">
                            <i className="fa-brands fa-whatsapp absolute left-3.5 text-slate-400 text-xs"></i>
                            <input
                                type="tel"
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="0877xxxxxxx"
                                className="w-full h-11 pl-9 pr-3.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 font-semibold outline-none focus:border-[#0194F3] transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
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
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Kata Sandi *
                        </label>
                        <div className="relative flex items-center">
                            <i className="fa-solid fa-lock absolute left-3.5 text-slate-400 text-xs"></i>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Minimal 6 karakter"
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

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Konfirmasi Kata Sandi *
                        </label>
                        <div className="relative flex items-center">
                            <i className="fa-solid fa-shield-halved absolute left-3.5 text-slate-400 text-xs"></i>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Ulangi kata sandi"
                                className="w-full h-11 pl-9 pr-3.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-slate-900 font-semibold outline-none focus:border-[#0194F3] transition-colors"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 bg-[#0194F3] hover:bg-sky-600 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? (
                            <>
                                <i className="fa-solid fa-spinner fa-spin text-sm"></i>
                                <span>Mendaftarkan...</span>
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-user-plus text-xs"></i>
                                <span>Daftar Sekarang</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Footer Link Login */}
                <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500 font-medium">
                    Sudah punya akun?{' '}
                    <Link to="/login" className="font-bold text-[#0194F3] hover:underline">
                        Masuk di sini
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default Register;
