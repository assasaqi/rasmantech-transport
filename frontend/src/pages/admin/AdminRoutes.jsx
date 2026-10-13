import React, { useEffect, useState, useRef } from 'react';
import { getRoutes, createRoute, updateRoute, deleteRoute, getImageUrl } from '@/services/api';
import AdminNavbar from '@/components/AdminNavbar';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

const AdminRoutes = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ pickup_location: '', dropoff_location: '', price: '' });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const { toast, showToast, hideToast } = useToast();
    const fileInputRef = useRef(null);

    const loadRoutes = () => {
        setLoading(true);
        getRoutes()
            .then((res) => {
                if (res.data?.success) setRoutes(res.data.data || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        loadRoutes();
    }, []);

    const handleOpenModal = (route = null) => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';

        if (route) {
            setEditingId(route.id);
            setFormData({
                pickup_location: route.pickup_location || '',
                dropoff_location: route.dropoff_location || '',
                price: route.price || ''
            });
            if (route.image_url) {
                setImagePreview(getImageUrl(route.image_url));
            }
        } else {
            setEditingId(null);
            setFormData({ pickup_location: '', dropoff_location: '', price: '' });
        }
        setModalOpen(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const submitData = new FormData();
        submitData.append('pickup_location', formData.pickup_location);
        submitData.append('dropoff_location', formData.dropoff_location);
        submitData.append('price', formData.price);

        if (imageFile) {
            submitData.append('image', imageFile);
        }

        try {
            if (editingId) {
                await updateRoute(editingId, submitData);
                showToast('Data rute berhasil diperbarui!', 'success');
            } else {
                await createRoute(submitData);
                showToast('Rute baru berhasil ditambahkan!', 'success');
            }
            setModalOpen(false);
            loadRoutes();
        } catch (err) {
            console.error('Submit error:', err);
            showToast('Gagal menyimpan rute. Silakan coba lagi.', 'error');
        }
    };

    const handleDelete = async (id, pickup, dropoff) => {
        if (window.confirm(`Yakin ingin menghapus rute ${pickup} ➔ ${dropoff}?`)) {
            try {
                await deleteRoute(id);
                showToast('Rute berhasil dihapus!', 'success');
                loadRoutes();
            } catch (err) {
                showToast('Gagal menghapus rute.', 'error');
            }
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
                            <i className="fa-solid fa-route text-[#0194F3]"></i>
                            <span>Kelola Rute &amp; Tarif</span>
                        </h2>
                        <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 sm:mt-1">
                            Atur daftar rute transfer dan tarif resmi aplikasi Dafatih Transport.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => handleOpenModal()}
                        className="bg-[#0194F3] hover:bg-sky-600 text-white px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap self-start sm:self-auto"
                    >
                        <i className="fa-solid fa-plus text-[10px] sm:text-xs"></i>
                        <span>Tambah Rute</span>
                    </button>
                </div>

                {/* TABEL DATA RUTE */}
                <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    {loading ? (
                        <div className="text-center py-12 sm:py-16 text-slate-500 text-xs sm:text-sm font-medium">
                            <i className="fa-solid fa-spinner fa-spin text-base sm:text-xl text-[#0194F3] mr-2"></i>
                            <span>Memuat daftar rute...</span>
                        </div>
                    ) : routes.length === 0 ? (
                        <div className="text-center py-12 sm:py-16 text-slate-400 text-xs sm:text-sm font-medium px-4">
                            Belum ada data rute yang tersimpan. Klik "Tambah Rute" untuk menambah data baru.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-[11px] sm:text-xs md:text-sm border-collapse min-w-[550px] sm:min-w-[650px]">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider">
                                        <th className="py-2.5 sm:py-3.5 px-3 sm:px-4 text-center w-24 sm:w-28">Foto Rute</th>
                                        <th className="py-2.5 sm:py-3.5 px-3 sm:px-4">Penjemputan</th>
                                        <th className="py-2.5 sm:py-3.5 px-3 sm:px-4">Tujuan</th>
                                        <th className="py-2.5 sm:py-3.5 px-3 sm:px-4">Tarif</th>
                                        <th className="py-2.5 sm:py-3.5 px-3 sm:px-4 text-center w-16 sm:w-20">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {routes.map((r) => (
                                        <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 text-center">
                                                <div className="w-16 h-10 sm:w-20 sm:h-12 rounded-lg overflow-hidden border border-slate-200 mx-auto bg-slate-50 shadow-2xs group relative">
                                                    <img
                                                        src={getImageUrl(r.image_url)}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        alt={r.pickup_location}
                                                    />
                                                </div>
                                            </td>
                                            <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-semibold text-slate-900 max-w-[140px] truncate" title={r.pickup_location}>
                                                <div className="flex items-center gap-1.5">
                                                    <i className="fa-solid fa-location-dot text-[#0194F3] text-[10px] sm:text-xs shrink-0"></i>
                                                    <span>{r.pickup_location}</span>
                                                </div>
                                            </td>
                                            <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-semibold text-slate-900 max-w-[140px] truncate" title={r.dropoff_location}>
                                                <div className="flex items-center gap-1.5">
                                                    <i className="fa-solid fa-flag-checkered text-[#0194F3] text-[10px] sm:text-xs shrink-0"></i>
                                                    <span>{r.dropoff_location}</span>
                                                </div>
                                            </td>
                                            <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-extrabold text-[#F96D01] whitespace-nowrap text-xs sm:text-sm">
                                                Rp {Number(r.price).toLocaleString('id-ID')}
                                            </td>
                                            <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenModal(r)}
                                                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0194F3] transition-colors flex items-center justify-center cursor-pointer"
                                                        title="Edit Rute"
                                                    >
                                                        <i className="fa-solid fa-pen-to-square text-[10px] sm:text-xs"></i>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(r.id, r.pickup_location, r.dropoff_location)}
                                                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors flex items-center justify-center cursor-pointer"
                                                        title="Hapus Rute"
                                                    >
                                                        <i className="fa-solid fa-trash-can text-[10px] sm:text-xs"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* MODAL EDIT / TAMBAH RUTE */}
                {modalOpen && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-[100] p-3 sm:p-4 overflow-y-auto">
                        <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md shadow-2xl border border-slate-200 my-auto animate-in fade-in zoom-in-95 duration-150">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3 sm:mb-4">
                                <h3 className="text-sm sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                                    <i className="fa-solid fa-route text-[#0194F3]"></i>
                                    <span>{editingId ? 'Edit Data Rute' : 'Tambah Rute Baru'}</span>
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="text-slate-400 hover:text-slate-600 text-base sm:text-lg p-1 cursor-pointer"
                                >
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
                                <div>
                                    <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                                        Lokasi Penjemputan *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.pickup_location}
                                        onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
                                        placeholder="Contoh: Bandara Lombok"
                                        className="w-full h-9 sm:h-10 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-[#0194F3] focus:ring-2 focus:ring-sky-100 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                                        Lokasi Tujuan *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.dropoff_location}
                                        onChange={(e) => setFormData({ ...formData, dropoff_location: e.target.value })}
                                        placeholder="Contoh: Senggigi"
                                        className="w-full h-9 sm:h-10 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-[#0194F3] focus:ring-2 focus:ring-sky-100 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                                        Tarif (Rp) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="Contoh: 250000"
                                        className="w-full h-9 sm:h-10 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-[#0194F3] focus:ring-2 focus:ring-sky-100 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                                        Gambar Rute (Opsional)
                                    </label>

                                    {imagePreview && (
                                        <div className="mb-2 relative w-full h-28 sm:h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] sm:file:text-xs file:font-bold file:bg-sky-50 file:text-[#0194F3] hover:file:bg-sky-100 cursor-pointer"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setModalOpen(false)}
                                        className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-[#0194F3] hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                                    >
                                        Simpan Rute
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminRoutes;
