import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useGallery } from '@/context/GalleryContext';
import { getGalleries, API_BASE_URL } from '@/services/api';

const Gallery = () => {
    const { visibleCount, setVisibleCount } = useGallery();
    const [galleries, setGalleries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    const getInitialLimit = useCallback(() => (window.innerWidth <= 768 ? 6 : 12), []);

    // Inisialisasi limit saat mount
    useEffect(() => {
        if (visibleCount === null) {
            setVisibleCount(getInitialLimit());
        }
    }, [visibleCount, setVisibleCount, getInitialLimit]);

    // Fetch data API
    useEffect(() => {
        let isMounted = true;

        getGalleries()
            .then((res) => {
                if (isMounted) {
                    if (res.data?.success) {
                        setGalleries(res.data.data || []);
                    } else {
                        setError('Gagal memuat galeri foto.');
                    }
                    setIsLoading(false);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    console.error('Gagal mengambil data galeri:', err);
                    setError('Gagal memuat galeri foto.');
                    setIsLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const currentLimit = visibleCount ?? getInitialLimit();

    const displayedItems = useMemo(
        () => galleries.slice(0, currentLimit),
        [galleries, currentLimit]
    );

    const hasMore = currentLimit < galleries.length;

    const loadMore = () => {
        setVisibleCount((prev) => (prev ?? getInitialLimit()) + getInitialLimit());
    };

    // Helper URL Gambar Dinamis
    const getImageUrl = (item) => {
        const imageUrl = typeof item === 'string' ? item : item?.image_url || item?.image || item?.image_path || '';
        if (!imageUrl) return 'https://placehold.co/600x450?text=Galeri+Lombok';

        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return encodeURI(imageUrl);
        }

        let baseUrl = '';
        if (API_BASE_URL) {
            baseUrl = API_BASE_URL.replace(/\/api\/?$/, '');
        } else if (typeof window !== 'undefined') {
            baseUrl = window.location.origin;
        }

        const fullUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
        return encodeURI(fullUrl);
    };

    return (
        <div className="w-full min-h-screen bg-[#F2F4F7] text-slate-800 pt-24 sm:pt-28 pb-16">
            {/* Main Content Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4">

                {/* Judul Halaman Rata Kiri */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Galeri
                    </h1>
                </div>

                {isLoading && (
                    <div className="text-center py-20 text-slate-500">
                        <i className="fa-solid fa-spinner fa-spin text-2xl text-[#0194F3] mb-3 block"></i>
                        <span className="text-xs font-semibold">Memuat galeri foto...</span>
                    </div>
                )}

                {error && (
                    <div className="text-center py-16 text-rose-500 text-xs font-bold">
                        {error}
                    </div>
                )}

                {!isLoading && !error && displayedItems.length === 0 && (
                    <div className="text-center py-20 text-slate-400 text-xs font-medium">
                        Belum ada koleksi foto galeri yang tersedia.
                    </div>
                )}

                {!isLoading && !error && displayedItems.length > 0 && (
                    /* Grid Gallery dengan Judul di Dalam Foto */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                        {displayedItems.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setSelectedImage(item)}
                                className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer h-60 sm:h-64"
                            >
                                {/* Foto Utama */}
                                <img
                                    src={getImageUrl(item)}
                                    alt={item.title || 'Foto Galeri'}
                                    translate="no"
                                    loading="lazy"
                                    className="notranslate w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />

                                {/* Category Badge */}
                                <span className="absolute top-3 left-3 z-10 bg-slate-900/70 backdrop-blur-md text-white text-[9px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                    {item.category || 'Momen Tamu'}
                                </span>

                                {/* Hamparan Gradien Gelap untuk Judul di Dalam Foto */}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent flex flex-col justify-end p-4 transition-all duration-300 group-hover:from-slate-950/90">
                                    <h3 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-sky-300 transition-colors">
                                        {item.title}
                                    </h3>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tombol Muat Lebih Banyak */}
                {hasMore && (
                    <div className="text-center mt-10">
                        <button
                            type="button"
                            className="px-6 py-2.5 rounded-xl border border-[#0194F3] text-[#0194F3] hover:bg-[#0194F3] hover:text-white font-bold text-xs transition-colors duration-200 cursor-pointer shadow-xs inline-flex items-center gap-2 group"
                            onClick={loadMore}
                        >
                            <i className="fa-solid fa-arrows-rotate group-hover:rotate-180 transition-transform duration-500"></i>
                            <span>Tampilkan Lebih Banyak Foto</span>
                        </button>
                    </div>
                )}
            </section>

            {/* LIGHTBOX MODAL */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <div
                        className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Tombol Close */}
                        <button
                            type="button"
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 sm:-right-2 bg-slate-900/80 hover:bg-slate-900 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                        >
                            <i className="fa-solid fa-xmark text-sm"></i>
                        </button>

                        {/* Container Foto */}
                        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-2xl max-h-[80vh] flex items-center justify-center">
                            <img
                                src={getImageUrl(selectedImage)}
                                alt={selectedImage.title}
                                translate="no"
                                className="notranslate max-h-[80vh] w-auto object-contain"
                            />
                        </div>

                        {/* Judul & Kategori di Lightbox */}
                        <div className="mt-3 flex flex-col items-center gap-1 text-center">
                            <span className="bg-sky-100 text-[#0194F3] text-[10px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider">
                                {selectedImage.category || 'Momen Tamu'}
                            </span>
                            <h3 className="text-sm sm:text-base font-bold text-white">
                                {selectedImage.title}
                            </h3>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Gallery;
