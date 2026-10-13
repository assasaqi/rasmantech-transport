import axios from 'axios';

// 1. Penentuan Base URL Dinamis (Mendukung Environment Variable Vite)
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production'
    ? 'https://dafatih-transport.rasmantech.web.id/api'
    : 'http://localhost:5000/api');

// 2. Helper URL Gambar Global
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return 'https://placehold.co/400x250?text=No+Image';

  const path = typeof imageUrl === 'string'
    ? imageUrl
    : imageUrl?.image_url || imageUrl?.image || imageUrl?.image_path || '';

  if (!path) return 'https://placehold.co/400x250?text=No+Image';

  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return encodeURI(path);
  }

  const baseUrl = API_BASE_URL.replace(/\/api\/?$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return encodeURI(`${baseUrl}${cleanPath}`);
};

// 3. Inisialisasi Axios Instance
const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 4. Interceptor: Menyisipkan Token Authorization Secara Otomatis
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken') || localStorage.getItem('clientToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ================= API ENDPOINTS =================

// --- Client Auth API ---
export const registerClient = (data) => API.post('/client/register', data);
export const loginClient = (data) => API.post('/client/login', data);
export const getClientProfile = () => API.get('/client/profile');

// --- Admin Auth & Profile API ---
export const getProfile = (email) => API.get(`/profile${email ? `?email=${email}` : ''}`);
export const updateProfile = (data) => API.put('/profile', data);
export const loginAdmin = (data) => API.post('/login', data);
export const registerAdmin = (data) => API.post('/register', data);

// --- Vehicle / Armada API (Sewa Mobil) ---
export const getVehicles = () => API.get('/vehicles');
export const createVehicle = (formData) =>
  API.post('/vehicles', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateVehicle = (id, formData) =>
  API.put(`/vehicles/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteVehicle = (id) => API.delete(`/vehicles/${id}`);

// --- Route & Tarif API (Antar Jemput) ---
export const getRoutes = () => API.get('/routes');
export const createRoute = (formData) =>
  API.post('/routes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateRoute = (id, formData) =>
  API.put(`/routes/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteRoute = (id) => API.delete(`/routes/${id}`);

// --- Tour Package API (Paket Tour) - BARU ---
export const getTourPackages = () => API.get('/tour-packages');
export const getTourPackageBySlug = (slug) => API.get(`/tour-packages/${slug}`);
export const createTourPackage = (formData) =>
  API.post('/tour-packages', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateTourPackage = (id, formData) =>
  API.put(`/tour-packages/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteTourPackage = (id) => API.delete(`/tour-packages/${id}`);

// --- Booking API ---
export const getBookings = () => API.get('/bookings');
export const createBooking = (bookingData) => API.post('/bookings', bookingData);
export const getBookingByCode = (code) => API.get(`/bookings/track/${code}`); // BARU: Untuk Tracking Pesanan
export const updateBookingStatus = (id, status) => API.put(`/bookings/${id}/status`, { status });
export const deleteBooking = (id) => API.delete(`/bookings/${id}`);

// --- Gallery API ---
export const getGalleries = () => API.get('/galleries');
export const createGallery = (formData) =>
  API.post('/galleries', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateGallery = (id, formData) =>
  API.put(`/galleries/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteGallery = (id) => API.delete(`/galleries/${id}`);

// --- Blog API ---
export const getBlogs = () => API.get('/blogs');
export const createBlog = (formData) =>
  API.post('/blogs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateBlog = (id, formData) =>
  API.put(`/blogs/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteBlog = (id) => API.delete(`/blogs/${id}`);

export default API;
