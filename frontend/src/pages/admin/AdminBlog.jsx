import React, { useEffect, useState } from 'react';
import { getBlogs, createBlog, updateBlog, deleteBlog, API_BASE_URL } from '@/services/api';
import AdminNavbar from '@/components/AdminNavbar';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';

const AdminBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const { toast, showToast, hideToast } = useToast();

    const loadBlogs = () => {
        setLoading(true);
        getBlogs()
            .then((res) => {
                if (res.data?.success) setBlogs(res.data.data || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        loadBlogs();
    }, []);

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return 'https://placehold.co/120x80?text=No+Cover';
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }

        const baseUrl = API_BASE_URL ? API_BASE_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000';
        return `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    };

    const handleOpenModal = (blog = null) => {
        setImageFile(null);
        setImagePreview(null);

        if (blog) {
            setEditingId(blog.id);
            setFormData({ title: blog.title || '', content: blog.content || '' });
            if (blog.image_url) {
                setImagePreview(getImageUrl(blog.image_url));
            }
        } else {
            setEditingId(null);
            setFormData({ title: '', content: '' });
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
        const submitData = new FormData();
        submitData.append('title', formData.title);
        submitData.append('content', formData.content);
        if (imageFile) submitData.append('image', imageFile);

        try {
            if (editingId) {
                await updateBlog(editingId, submitData);
                showToast('Artikel blog berhasil diperbarui!', 'success');
            } else {
                await createBlog(submitData);
                showToast('Artikel blog baru berhasil ditambahkan!', 'success');
            }
            handleCloseModal();
            loadBlogs();
        } catch (err) {
            showToast('Gagal menyimpan artikel. Silakan coba lagi.', 'error');
        }
    };

    const handleDelete = async (id, title) => {
        if (window.confirm(`Hapus artikel "${title}" ini?`)) {
            try {
                await deleteBlog(id);
                showToast('Artikel blog berhasil dihapus!', 'success');
                loadBlogs();
            } catch (err) {
                showToast('Gagal menghapus artikel.', 'error');
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
                            <i className="fa-solid fa-newspaper text-[#0194F3]"></i>
                            <span>Kelola Artikel Blog</span>
                        </h2>
                        <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5 sm:mt-1">
                            Tulis dan perbarui artikel serta panduan tips seputar wisata Lombok.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => handleOpenModal()}
                        className="bg-[#0194F3] hover:bg-sky-600 text-white px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap self-start sm:self-auto"
                    >
                        <i className="fa-solid fa-plus text-[10px] sm:text-xs"></i>
                        <span>Tulis Artikel Baru</span>
                    </button>
                </div>

                {/* TABEL ARTIKEL BLOG */}
                <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    {loading ? (
                        <div className="text-center py-12 sm:py-16 text-slate-500 text-xs sm:text-sm font-medium">
                            <i className="fa-solid fa-spinner fa-spin text-base sm:text-xl text-[#0194F3] mr-2"></i>
                            <span>Memuat daftar artikel...</span>
                        </div>
                    ) : blogs.length === 0 ? (
                        <div className="text-center py-12 sm:py-16 text-slate-400 text-xs sm:text-sm font-medium px-4">
                            Belum ada artikel blog yang ditambahkan. Klik "Tulis Artikel Baru" untuk membuat artikel pertama.
                        </div>
                    ) : (
                        <div className="overflow-x-auto min-h-[220px]">
                            <table className="w-full text-left text-[11px] sm:text-xs md:text-sm border-collapse min-w-[550px] sm:min-w-[700px]">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[9px] sm:text-[11px] font-extrabold uppercase tracking-wider">
                                        <th className="py-2.5 sm:py-3.5 px-3 sm:px-4 text-center w-24 sm:w-28">Sampul</th>
                                        <th className="py-2.5 sm:py-3.5 px-3 sm:px-4 w-1/3">Judul Artikel</th>
                                        <th className="py-2.5 sm:py-3.5 px-3 sm:px-4">Ringkasan Konten</th>
                                        <th className="py-2.5 sm:py-3.5 px-3 sm:px-4 text-center w-16 sm:w-20">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                    {blogs.map((b) => (
                                        <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 text-center">
                                                <div className="w-16 h-10 sm:w-20 sm:h-12 rounded-lg overflow-hidden border border-slate-200 mx-auto bg-slate-50 shadow-2xs group relative">
                                                    <img
                                                        src={getImageUrl(b.image_url)}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        alt={b.title}
                                                    />
                                                </div>
                                            </td>
                                            <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-bold text-slate-900 max-w-[180px] sm:max-w-[260px] truncate" title={b.title}>
                                                {b.title}
                                            </td>
                                            <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 text-slate-500 max-w-[200px] sm:max-w-[320px] truncate" title={b.content}>
                                                {b.content || '-'}
                                            </td>
                                            <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenModal(b)}
                                                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-sky-50 hover:bg-sky-100 text-[#0194F3] transition-colors flex items-center justify-center cursor-pointer"
                                                        title="Edit Artikel"
                                                    >
                                                        <i className="fa-solid fa-pen-to-square text-[10px] sm:text-xs"></i>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(b.id, b.title)}
                                                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors flex items-center justify-center cursor-pointer"
                                                        title="Hapus Artikel"
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

                {/* MODAL EDIT / TAMBAH ARTIKEL */}
                {modalOpen && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-[100] p-3 sm:p-4 overflow-y-auto">
                        <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-lg shadow-2xl border border-slate-200 my-auto animate-in fade-in zoom-in-95 duration-150">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3 sm:mb-4">
                                <h3 className="text-sm sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                                    <i className="fa-solid fa-[#0194F3] fa-file-pen text-[#0194F3]"></i>
                                    <span>{editingId ? 'Edit Artikel Blog' : 'Tulis Artikel Baru'}</span>
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
                                        Judul Artikel *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Contoh: 5 Tempat Wisata Hits di Lombok"
                                        className="w-full h-9 sm:h-10 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 outline-none focus:border-[#0194F3] focus:ring-2 focus:ring-sky-100 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                                        Isi Konten Artikel *
                                    </label>
                                    <textarea
                                        required
                                        rows="6"
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        placeholder="Tulis artikel lengkap di sini..."
                                        className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-[#0194F3] focus:ring-2 focus:ring-sky-100 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-1">
                                        Foto Sampul{' '}
                                        <span className="font-normal text-slate-400">
                                            ({editingId ? 'Biarkan kosong jika tidak diubah' : 'Opsional'})
                                        </span>
                                    </label>

                                    {imagePreview && (
                                        <div className="mb-2 relative w-full h-28 sm:h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                                            <img src={imagePreview} alt="Preview Sampul" className="w-full h-full object-cover" />
                                        </div>
                                    )}

                                    <input
                                        type="file"
                                        accept="image/*"
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
                                        {editingId ? 'Simpan Perubahan' : 'Simpan Artikel'}
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

export default AdminBlogs;
