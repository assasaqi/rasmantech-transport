import React, { useEffect, useState } from 'react';
import { getGalleries, createGallery, updateGallery, deleteGallery, API_BASE_URL } from '@/services/api';
import AdminNavbar from '@/components/AdminNavbar';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

const AdminGallery = () => {
    const [galleries, setGalleries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({ title: '', category: 'Destinasi' });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const { toast, showToast, hideToast } = useToast();

    const loadGalleries = () => {
        setLoading(true);
        getGalleries()
            .then((res) => {
                if (res.data?.success) setGalleries(res.data.data || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        loadGalleries();
    }, []);

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return 'https://placehold.co/120x80?text=No+Foto';
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }

        const baseUrl = API_BASE_URL ? API_BASE_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000';
        return `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    };

    const handleOpenModal = (item = null) => {
        setImageFile(null);
        setImagePreview(null);

        if (item) {
            setEditingId(item.id);
            setFormData({
                title: item.title || '',
                category: item.category || 'Destinasi'
            });
            if (item.image_url) {
                setImagePreview(getImageUrl(item.image_url));
            }
        } else {
            setEditingId(null);
            setFormData({ title: '', category: 'Destinasi' });
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingId(null);
        setImageFile(null);
        setImagePreview(null);
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

        if (!editingId && !imageFile) {
            showToast('Silakan pilih file gambar!', 'error');
            return;
        }

        const submitData = new FormData();
        submitData.append('title', formData.title);
        submitData.append('category', formData.category);
        if (imageFile) {
            submitData.append('image', imageFile);
        }

        try {
            if (editingId) {
                await updateGallery(editingId, submitData);
                showToast('Foto galeri berhasil diperbarui!', 'success');
            } else {
                await createGallery(submitData);
                showToast('Foto baru berhasil diunggah!', 'success');
            }
            handleCloseModal();
            loadGalleries();
        } catch (err) {
            showToast('Gagal menyimpan foto galeri.', 'error');
        }
    };

    const handleDelete = async (id, title) => {
        if (window.confirm(`Hapus foto "${title}" dari galeri ini?`)) {
            try {
                await deleteGallery(id);
                showToast('Foto galeri berhasil dihapus!', 'success');
                loadGalleries();
            } catch (err) {
                showToast('Gagal menghapus foto.', 'error');
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
                            <i className="fa-solid fa-images text-[#0194F3]"></i>
                            <span>Kelola Galeri Foto</span>
                        </h2>
                        <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 sm:mt-1">
                            Unggah dan edit foto kegiatan serta destinasi wisata Pulau Lombok.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => handleOpenModal()}
                        className="bg-[#0194F3] hover:bg-sky-600 text-white px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap self-start sm:self-auto"
                    >
                        <i className="fa-solid fa-plus text-[10px] sm:text-xs"></i>
                        <span>Tambah Foto Baru</span>
                    </button>
                </div>

                {/* TABEL GALERI */}
                <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    {loading ? (
                        <div className="text-center py-12 sm:py-16 text-slate-500 text-xs sm:text-sm font-medium">
                            <i className="fa-solid fa-spinner fa-spin text-base sm:text-xl text-[#0194F3] mr-2"></i>
                            <span>Memuat galeri...</span>
                        </div>
                    ) : galleries.length === 0 ? (
                        <div className="text-center py-12 sm:py-16 text-slate-400 text-xs sm:text-sm font-medium px-4">
                            Belum ada foto galeri yang ditambahkan. Klik "Tambah Foto Baru" untuk mengunggah.
                        </div>
                    ) : (
                        <div className="overflow-x-auto min-h-[220px]">
                            <table className="w-full text-left text-[11px] sm:text-xs md:text-sm border-collapse min-w-[500px] sm:min-w-[650px]">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider">
                                        <th className="py-2.5 sm:py-3.5 px-3 sm:px-4 text-center w-24 sm:w-28">Foto</th>
                                        <th className="py-2.5 sm:py-3.5 px-3 sm:px-4">Judul Foto / Keterangan</th>
                                        <th className="py-2.5 sm:py-3.5 px-3 sm:px-4 w-28 sm:w-36">Kategori</th>
                                        <th className="py-2.5 sm:py-3.5 px-3 sm:px-4 text-center w-16 sm:w-20">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {galleries.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 text-center">
                                                <div className="w-16 h-10 sm:w-20 sm:h-12 rounded-lg overflow-hidden border border-slate-200 mx-auto bg-slate-50 shadow-2xs group relative">
                                                    <img
                                                        src={getImageUrl(item.image_url)}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        alt={item.title}
                                                    />
                                                </div>
                                            </td>
                                            <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-bold text-slate-900 max-w-[180px] sm:max-w-[280px] truncate" title={item.title}>
                                                {item.title}
                                            </td>
                                            <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 whitespace-nowrap">
                                                <span className="bg-sky-50 text-[#0194F3] border border-sky-100 text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase inline-block">
                                                    {item.category || 'Destinasi'}
                                                </span>
                                            </td>
                                            <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenModal(item)}
                                                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0194F3] transition-colors flex items-center justify-center cursor-pointer"
                                                        title="Edit Foto"
                                                    >
                                                        <i className="fa-solid fa-pen-to-square text-[10px] sm:text-xs"></i>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(item.id, item.title)}
                                                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors flex items-center justify-center cursor-pointer"
                                                        title="Hapus Foto"
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

                {/* MODAL EDIT / TAMBAH FOTO */}
                {modalOpen && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-[100] p-3 sm:p-4 overflow-y-auto">
                        <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-md shadow-2xl border border-slate-200 my-auto animate-in fade-in zoom-in-95 duration-150">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3 sm:mb-4">
                                <h3 className="text-sm sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                                    <i className="fa-solid fa-image text-[#0194F3]"></i>
                                    <span>{editingId ? 'Edit Foto Galeri' : 'Tambah Foto Galeri'}</span>
                                </h3>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="text-slate-400 hover:text-slate-600 text-base sm:text-lg p-1 cursor-pointer"
                                >
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
                                <div>
                                    <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                                        Judul Foto / Keterangan *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Contoh: Keindahan Pantai Kuta Lombok"
                                        className="w-full h-9 sm:h-10 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-[#0194F3] focus:ring-2 focus:ring-sky-100 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                                        Kategori *
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full h-9 sm:h-10 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-[#0194F3] focus:ring-2 focus:ring-sky-100 transition-all bg-white cursor-pointer"
                                    >
                                        <option value="Destinasi">Destinasi Wisata</option>
                                        <option value="Armada">Armada &amp; Layanan</option>
                                        <option value="Aktivitas">Aktivitas Pelanggan</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                                        Upload Berkas Gambar{' '}
                                        {editingId && (
                                            <span className="font-normal text-slate-400">
                                                (Biarkan kosong jika tidak diubah)
                                            </span>
                                        )}
                                    </label>

                                    {imagePreview && (
                                        <div className="mb-2 relative w-full h-28 sm:h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                            <img src={imagePreview} alt="Preview Foto Galeri" className="w-full h-full object-cover" />
                                        </div>
                                    )}

                                    <input
                                        type="file"
                                        accept="image/*"
                                        required={!editingId}
                                        onChange={handleImageChange}
                                        className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[11px] sm:file:text-xs file:font-bold file:bg-sky-50 file:text-[#0194F3] hover:file:bg-sky-100 cursor-pointer"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 mt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-[#0194F3] hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                                    >
                                        {editingId ? 'Simpan Perubahan' : 'Unggah Foto'}
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

export default AdminGallery;
