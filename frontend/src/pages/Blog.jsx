import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useBlog } from '@/context/BlogContext';
import { getBlogs, API_BASE_URL } from '@/services/api';

const Blog = () => {
    const { visibleCount, setVisibleCount } = useBlog();
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const getInitialLimit = useCallback(() => (window.innerWidth <= 768 ? 4 : 8), []);

    // Inisialisasi limit saat pertama kali dimuat
    useEffect(() => {
        if (visibleCount === null) {
            setVisibleCount(getInitialLimit());
        }
    }, [visibleCount, setVisibleCount, getInitialLimit]);

    // Fetch data dari API backend
    useEffect(() => {
        let isMounted = true;

        getBlogs()
            .then((res) => {
                if (isMounted) {
                    const blogData = Array.isArray(res.data)
                        ? res.data
                        : (res.data?.data || res.data?.blogs || []);

                    if (Array.isArray(blogData)) {
                        setArticles(blogData);
                        setError('');
                    } else {
                        setError('Gagal memuat artikel blog.');
                    }
                    setIsLoading(false);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    console.error('Gagal mengambil artikel blog:', err);
                    setError('Gagal memuat artikel blog.');
                    setIsLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const currentLimit = visibleCount ?? getInitialLimit();

    const displayedArticles = useMemo(
        () => (Array.isArray(articles) ? articles.slice(0, currentLimit) : []),
        [articles, currentLimit]
    );

    const hasMore = currentLimit < (articles?.length || 0);

    const loadMore = () => {
        setVisibleCount((prev) => (prev ?? getInitialLimit()) + getInitialLimit());
    };

    // Helper URL Gambar Dinamis
    const getImageUrl = (article) => {
        const imageUrl = article?.image_url || article?.image || article?.image_path || '';
        if (!imageUrl) return 'https://placehold.co/400x250?text=Wisata+Lombok';

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

    // Format Tanggal Tampilan
    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return 'Lombok Travel Guide';
        const dateObj = new Date(dateStr);
        if (isNaN(dateObj.getTime())) return 'Lombok Travel Guide';

        return dateObj.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-[#F2F4F7] text-slate-800 pt-24 sm:pt-28 pb-16">
            {/* Main Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4">

                {/* Judul Halaman Rata Kiri */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Blog &amp; Panduan Wisata
                    </h1>
                </div>

                {isLoading && (
                    <div className="text-center py-12 text-slate-500">
                        <i className="fa-solid fa-spinner fa-spin mr-2 text-[#0194F3]"></i>
                        Memuat artikel blog...
                    </div>
                )}

                {error && (
                    <div className="text-center py-8 text-red-500 font-semibold">
                        {error}
                    </div>
                )}

                {!isLoading && !error && displayedArticles.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                        Belum ada artikel blog yang tersedia.
                    </div>
                )}

                {!isLoading && !error && displayedArticles.length > 0 && (
                    /* Grid 4 Kolom */
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                        {displayedArticles.map((article) => (
                            <article
                                key={article.id}
                                className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
                            >
                                <div>
                                    {/* Gambar Ukuran Proporsional */}
                                    <div className="relative h-40 sm:h-44 overflow-hidden bg-slate-100">
                                        <img
                                            src={getImageUrl(article)}
                                            alt={article.title}
                                            translate="no"
                                            loading="lazy"
                                            className="notranslate w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <span className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md tracking-wider uppercase">
                                            {article.category || 'PANDUAN'}
                                        </span>
                                    </div>

                                    {/* Body Konten */}
                                    <div className="p-3.5 sm:p-4">
                                        {/* Tanggal */}
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 mb-1.5">
                                            <i className="fa-regular fa-calendar-check text-[#0194F3]"></i>
                                            <span>{formatDisplayDate(article.created_at || article.date)}</span>
                                        </div>

                                        {/* Judul Artikel */}
                                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#0194F3] transition-colors mb-1.5 line-clamp-2 leading-snug">
                                            {article.title}
                                        </h3>

                                        {/* Ringkasan */}
                                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                            {article.excerpt || (article.content ? article.content.substring(0, 80) + '...' : '')}
                                        </p>
                                    </div>
                                </div>

                                {/* Link Baca Selengkapnya */}
                                <div className="p-3.5 sm:p-4 pt-0">
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0194F3] group-hover:gap-2 transition-all">
                                        <span>Baca Selengkapnya</span>
                                        <i className="fa-solid fa-arrow-right text-[9px]"></i>
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {hasMore && (
                    <div className="mt-8 text-center">
                        <button
                            type="button"
                            className="px-6 py-2.5 rounded-xl border border-[#0194F3] text-[#0194F3] hover:bg-[#0194F3] hover:text-white font-bold text-xs transition-colors duration-200 cursor-pointer shadow-xs"
                            onClick={loadMore}
                        >
                            Tampilkan Lebih Banyak Artikel
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Blog;
