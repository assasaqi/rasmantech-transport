import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Import aset logo dari folder public/logo
import logoImg from '/logo/logo.png';

const Footer = () => {
    const location = useLocation();

    // Sembunyikan footer utama jika sedang berada di halaman /admin/*
    if (location.pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <footer className="bg-slate-900 text-white mt-auto pt-10 pb-20 md:pb-12 px-4 sm:px-6 border-t border-slate-800">
            {/* Menggunakan max-w-4xl agar tampilan di layar laptop/desktop lebih terpusat di tengah */}
            <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 lg:gap-8">

                {/* Kolom 1: Profil Brand & Sosmed */}
                <div className="space-y-3">
                    <Link to="/" className="inline-block decoration-none group">
                        <img
                            src={logoImg}
                            alt="Dafatih Transport Logo"
                            className="h-16 sm:h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                    </Link>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Penyedia jasa transportasi dan antar-jemput terpercaya di Pulau Lombok dengan harga transparan.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Instagram"
                            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:bg-[#0194F3] hover:text-white transition-all flex items-center justify-center text-xs"
                        >
                            <i className="fa-brands fa-instagram"></i>
                        </a>
                        <a
                            href="https://facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Facebook"
                            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:bg-[#0194F3] hover:text-white transition-all flex items-center justify-center text-xs"
                        >
                            <i className="fa-brands fa-facebook-f"></i>
                        </a>
                        <a
                            href="https://tiktok.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="TikTok"
                            className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:bg-[#0194F3] hover:text-white transition-all flex items-center justify-center text-xs"
                        >
                            <i className="fa-brands fa-tiktok"></i>
                        </a>
                    </div>
                </div>

                {/* Kolom 2: Navigasi */}
                <div className="space-y-3">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        Tentang
                    </h4>
                    <ul className="space-y-2.5 text-xs">
                        <li>
                            <Link to="/galeri" className="text-slate-400 hover:text-[#0194F3] transition-colors">
                                Galeri
                            </Link>
                        </li>
                        <li>
                            <Link to="/blog" className="text-slate-400 hover:text-[#0194F3] transition-colors">
                                Blog
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Kolom 3: Layanan & Metode Pembayaran */}
                <div className="space-y-5">
                    <div>
                        <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">
                            Layanan
                        </h4>
                        <ul className="space-y-2.5 text-xs">
                            <li>
                                <Link to="/armada" className="text-slate-400 hover:text-[#0194F3] transition-colors">
                                    Armada
                                </Link>
                            </li>
                            <li>
                                <Link to="/tarif" className="text-slate-400 hover:text-[#0194F3] transition-colors">
                                    Rute &amp; Tarif
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                            Metode Pembayaran
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 px-3 py-2 rounded-xl border border-slate-800 w-fit">
                            <i className="fa-solid fa-wallet text-amber-400 text-xs"></i>
                            <span className="font-medium text-slate-300 text-[11px]">Cash &amp; Transfer Bank</span>
                        </div>
                    </div>
                </div>

                {/* Kolom 4: Kontak & Lokasi */}
                <div className="space-y-3">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        Kontak &amp; Lokasi
                    </h4>
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                        <i className="fa-solid fa-location-dot text-[#0194F3]"></i>
                        <span>Lombok, NTB, Indonesia</span>
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                        <a
                            href="https://wa.me/6287757004214"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Hubungi WhatsApp 1"
                            title="Chat WhatsApp CS 1"
                            className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center text-base shadow-xs"
                        >
                            <i className="fa-brands fa-whatsapp"></i>
                        </a>
                        <a
                            href="https://wa.me/6287862358975"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Hubungi WhatsApp 2"
                            title="Chat WhatsApp CS 2"
                            className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center text-base shadow-xs"
                        >
                            <i className="fa-brands fa-whatsapp"></i>
                        </a>
                    </div>
                </div>

            </div>

            {/* Copyright */}
            <div className="max-w-4xl mx-auto mt-10 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-500 font-medium">
                &copy; {new Date().getFullYear()} Dafatih Transport. Hak Cipta Dilindungi Undang-Undang.
            </div>
        </footer>
    );
};

export default Footer;
