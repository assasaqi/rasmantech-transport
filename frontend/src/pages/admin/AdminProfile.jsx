import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '@/services/api';
import AdminNavbar from '@/components/AdminNavbar';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

const AdminProfile = () => {
    const getSavedAdmin = () => {
        try {
            const saved = localStorage.getItem('adminUser');
            if (!saved) return null;
            return saved.startsWith('{') ? JSON.parse(saved) : { email: saved, name: '' };
        } catch (e) {
            return null;
        }
    };

    const savedAdmin = getSavedAdmin();
    const currentEmail = savedAdmin?.email || '';

    const [formData, setFormData] = useState({
        name: savedAdmin?.name || '',
        email: currentEmail,
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);

    // Menggunakan custom hook Toast terpisah
    const { toast, showToast, hideToast } = useToast();

    useEffect(() => {
        if (!currentEmail) return;

        getProfile(currentEmail)
            .then((res) => {
                if (res.data.success && res.data.data) {
                    setFormData((prev) => ({
                        ...prev,
                        name: res.data.data.name || prev.name,
                        email: res.data.data.email || currentEmail
                    }));
                }
            })
            .catch((err) => {
                if (err.response?.status === 404) {
                    console.warn('Data profil belum ada di DB, menggunakan data sesi lokal.');
                } else {
                    console.error('Gagal mengambil data profil awal:', err);
                }
            });
    }, [currentEmail]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            showToast('Konfirmasi password baru tidak cocok!', 'error');
            return;
        }

        setLoading(true);
        try {
            const res = await updateProfile({
                currentEmail: currentEmail,
                name: formData.name,
                newEmail: formData.email,
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword
            });

            if (res.data.success) {
                showToast('Profil berhasil diperbarui!', 'success');

                const updatedUser = {
                    ...savedAdmin,
                    name: formData.name,
                    email: res.data.updatedEmail || formData.email
                };
                localStorage.setItem('adminUser', JSON.stringify(updatedUser));

                setFormData((prev) => ({
                    ...prev,
                    oldPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                }));
            }
        } catch (err) {
            showToast(
                err.response?.data?.message || 'Gagal memperbarui profil admin.',
                'error'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F2F4F7] text-slate-800 md:pl-60 transition-all relative">
            <AdminNavbar />

            {/* Panggil komponen Toast terpisah */}
            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={hideToast}
            />

            <main className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200/80 relative">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0194F3] flex items-center justify-center text-lg">
                            <i className="fa-solid fa-user-gear"></i>
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                                Pengaturan Profil Admin
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Perbarui informasi nama, akun email, dan kata sandi Anda.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Nama Pengelola / Admin *
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-[#0194F3] transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Email Admin *
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-[#0194F3] transition-colors"
                            />
                        </div>

                        <div className="pt-2">
                            <hr className="border-slate-100 mb-4" />
                            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3">
                                Ubah Kata Sandi (Opsional)
                            </h4>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Password Saat Ini
                            </label>
                            <input
                                type="password"
                                name="oldPassword"
                                placeholder="Masukkan password saat ini"
                                value={formData.oldPassword}
                                onChange={handleChange}
                                className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-[#0194F3] transition-colors"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Password Baru
                                </label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    placeholder="Password baru"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-[#0194F3] transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Konfirmasi Password Baru
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Ulangi password baru"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full h-10 px-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-[#0194F3] transition-colors"
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 bg-[#0194F3] hover:bg-sky-600 text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
                            >
                                {loading && <i className="fa-solid fa-spinner fa-spin text-xs"></i>}
                                <span>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default AdminProfile;
