import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin, registerAdmin } from '@/services/api';

const Login = () => {
    const navigate = useNavigate();
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            if (isRegister) {
                const res = await registerAdmin({ name, email, password });
                setMessage({ type: 'success', text: res.data.message || 'Registrasi berhasil! Silakan login.' });
                setIsRegister(false);
                setName('');
            } else {
                const res = await loginAdmin({ email, password });
                if (res.data.success) {
                    localStorage.setItem('adminToken', res.data.token);
                    localStorage.setItem('adminUser', JSON.stringify(res.data.data));
                    navigate('/admin/dashboard');
                }
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Terjadi kesalahan sistem.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-100">
                <div className="text-center mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#0194F3] text-white flex items-center justify-center text-xl shadow-lg mx-auto mb-3">
                        <i className="fa-solid fa-shield-halved"></i>
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                        {isRegister ? 'Registrasi Admin' : 'Login Admin'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Dafatih Transport Management System
                    </p>
                </div>

                {message.text && (
                    <div
                        className={`p-3 rounded-xl text-xs font-bold mb-4 border text-center ${
                            message.type === 'error'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Nama Lengkap *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="Masukkan nama"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold outline-none focus:border-[#0194F3] transition-colors"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Email Admin *
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="admin@dafatihtransport.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold outline-none focus:border-[#0194F3] transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                            Password *
                        </label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold outline-none focus:border-[#0194F3] transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 bg-[#0194F3] hover:bg-sky-600 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mt-2"
                    >
                        {loading && <i className="fa-solid fa-spinner fa-spin text-xs"></i>}
                        <span>{loading ? 'Memproses...' : isRegister ? 'Daftar Sekarang' : 'Masuk Dashboard'}</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
