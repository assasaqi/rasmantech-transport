import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Impor Layout Utama (Navbar + Footer)
import MainLayout from '@/layouts/MainLayout';

// Impor Halaman Publik
import Home from '@/pages/Home';
import Tariffs from '@/pages/Tariffs';
import Booking from '@/pages/Booking';
import MyBookings from '@/pages/MyBookings';
import Gallery from '@/pages/Gallery';
import Blog from '@/pages/Blog';
import Vehicles from '@/pages/Vehicles';
import NotFound from '@/pages/NotFound';
import AuthTest from '@/pages/AuthTest';

// Halaman Klien (Auth & Profile)
import Login from '@/pages/client/Login';
import Register from '@/pages/client/Register';
import Profile from '@/pages/client/Profile';

// Impor Halaman Admin & Proteksi Route
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLogin from '@/pages/admin/Login';
import AdminRegister from '@/pages/admin/Register'; // 👈 1. Impor Halaman Registrasi Admin
import Dashboard from '@/pages/admin/Dashboard';
import AdminRoutes from '@/pages/admin/AdminRoutes';
import AdminVehicles from '@/pages/admin/AdminVehicles';
import AdminBookings from '@/pages/admin/AdminBookings';
import AdminGallery from '@/pages/admin/AdminGallery';
import AdminBlog from '@/pages/admin/AdminBlog';
import AdminProfile from '@/pages/admin/AdminProfile';

export default function AppRouter() {
    return (
        <Routes>
            {/* Rute Publik & Klien (Dibungkus dengan MainLayout) */}
            <Route path="/" element={<MainLayout><Home /></MainLayout>} />
            <Route path="/tarif" element={<MainLayout><Tariffs /></MainLayout>} />
            <Route path="/pesan" element={<MainLayout><Booking /></MainLayout>} />
            <Route path="/pesanan-saya" element={<MainLayout><MyBookings /></MainLayout>} />
            <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
            <Route path="/profile/edit" element={<MainLayout><Profile /></MainLayout>} />
            <Route path="/galeri" element={<MainLayout><Gallery /></MainLayout>} />
            <Route path="/blog" element={<MainLayout><Blog /></MainLayout>} />
            <Route path="/mobil" element={<MainLayout><Vehicles /></MainLayout>} />

            {/* Rute Auth Klien */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/test-auth" element={<AuthTest />} />

            {/* Rute Admin Auth */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/register" element={<AdminRegister />} /> {/* 👈 2. Tambahkan Rute Registrasi Admin */}

            {/* Rute Admin Terproteksi */}
            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/routes"
                element={
                    <ProtectedRoute>
                        <AdminRoutes />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/vehicles"
                element={
                    <ProtectedRoute>
                        <AdminVehicles />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/bookings"
                element={
                    <ProtectedRoute>
                        <AdminBookings />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/galleries"
                element={
                    <ProtectedRoute>
                        <AdminGallery />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/blogs"
                element={
                    <ProtectedRoute>
                        <AdminBlog />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/profile"
                element={
                    <ProtectedRoute>
                        <AdminProfile />
                    </ProtectedRoute>
                }
            />

            {/* Fallback Rute Tidak Ditemukan */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
