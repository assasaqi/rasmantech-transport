const express = require('express');
const router = express.Router();

// 1. Import Controllers (Jalur relative mengarah ke folder ../controllers)
const authAdminController = require('../controllers/authAdminController');
const authClientController = require('../controllers/authClientController');
const adminController = require('../controllers/adminController');
const routeController = require('../controllers/routeController');
const vehicleController = require('../controllers/vehicleController');
const bookingController = require('../controllers/bookingController');
const blogController = require('../controllers/blogController');
const galleryController = require('../controllers/galleryController');

// 2. Import Middleware Authentication & Upload
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { upload, compressImage } = require('../middleware/upload');

// Helper LAZY-LOAD dengan Callback Getter untuk memutus total warning Circular Dependency
const getHandler = (controllerTarget, ...fnNames) => {
  return async (req, res, next) => {
    // Evaluasi objek controller secara dinamis saat request HTTP benar-benar masuk
    const controller = typeof controllerTarget === 'function' ? controllerTarget() : controllerTarget;

    if (controller) {
      for (const name of fnNames) {
        if (typeof controller[name] === 'function') {
          return controller[name](req, res, next);
        }
      }
    }

    return res.status(501).json({
      success: false,
      message: `Handler belum diimplementasikan untuk route ${req.originalUrl}`
    });
  };
};

// ==========================================
// 1. AUTH & ADMIN PROFILE ROUTES
// ==========================================
router.post('/login', getHandler(() => authAdminController, 'loginAdmin', 'login'));
router.post('/register', getHandler(() => authAdminController, 'registerAdmin', 'register'));
router.get('/profile', authenticateToken, getHandler(() => authAdminController, 'getProfile'));
router.put('/profile', authenticateToken, getHandler(() => authAdminController, 'updateProfile'));

// Dashboard Analytics
router.get('/dashboard/analytics', authenticateToken, isAdmin, getHandler(() => adminController || bookingController, 'getDashboardAnalytics'));

// ==========================================
// 2. AUTH & CLIENT PROFILE ROUTES
// ==========================================
router.post('/client/register', getHandler(() => authClientController, 'registerClient'));
router.post('/client/login', getHandler(() => authClientController, 'loginClient'));
router.get('/client/profile', authenticateToken, getHandler(() => authClientController, 'getClientProfile', 'getProfile'));
router.put('/client/profile', authenticateToken, getHandler(() => authClientController, 'updateClientProfile'));

// ==========================================
// 3. ROUTE & TARIF MANAGEMENT (CRUD + UPLOAD)
// ==========================================
router.get('/routes', getHandler(() => routeController, 'getAllRoutes', 'getRoutes'));
router.post('/routes', authenticateToken, isAdmin, upload.single('image'), compressImage, getHandler(() => routeController, 'createRoute'));
router.put('/routes/:id', authenticateToken, isAdmin, upload.single('image'), compressImage, getHandler(() => routeController, 'updateRoute'));
router.delete('/routes/:id', authenticateToken, isAdmin, getHandler(() => routeController, 'deleteRoute'));

// ==========================================
// 4. VEHICLE / ARMADA ROUTES
// ==========================================
router.get('/vehicles', getHandler(() => vehicleController, 'getAllVehicles', 'getVehicles'));
router.get('/vehicles/:vehicleId/availability', getHandler(() => bookingController, 'getVehicleAvailability'));
router.post('/vehicles', authenticateToken, isAdmin, upload.single('image'), compressImage, getHandler(() => vehicleController, 'createVehicle'));
router.put('/vehicles/:id', authenticateToken, isAdmin, upload.single('image'), compressImage, getHandler(() => vehicleController, 'updateVehicle'));
router.delete('/vehicles/:id', authenticateToken, isAdmin, getHandler(() => vehicleController, 'deleteVehicle'));

// ==========================================
// 5. BOOKING ROUTES
// ==========================================
router.get('/bookings', authenticateToken, isAdmin, getHandler(() => bookingController, 'getAllBookings', 'getBookings'));
router.get('/bookings/code/:code', getHandler(() => bookingController, 'getBookingByCode'));
router.post('/bookings', getHandler(() => bookingController, 'createBooking'));
router.put('/bookings/:id/status', authenticateToken, isAdmin, getHandler(() => bookingController, 'updateBookingStatus'));
router.delete('/bookings/:id', authenticateToken, isAdmin, getHandler(() => bookingController, 'deleteBooking'));

// ==========================================
// 6. BLOG ROUTES
// ==========================================
router.get('/blogs', getHandler(() => blogController, 'getAllBlogs', 'getBlogs'));
router.post('/blogs', authenticateToken, isAdmin, upload.single('image'), compressImage, getHandler(() => blogController, 'createBlog'));
router.put('/blogs/:id', authenticateToken, isAdmin, upload.single('image'), compressImage, getHandler(() => blogController, 'updateBlog'));
router.delete('/blogs/:id', authenticateToken, isAdmin, getHandler(() => blogController, 'deleteBlog'));

// ==========================================
// 7. GALLERY MANAGEMENT
// ==========================================
router.get('/galleries', getHandler(() => galleryController, 'getAllGalleries', 'getGalleries'));
router.post('/galleries', authenticateToken, isAdmin, upload.single('image'), compressImage, getHandler(() => galleryController, 'createGallery'));
router.put('/galleries/:id', authenticateToken, isAdmin, upload.single('image'), compressImage, getHandler(() => galleryController, 'updateGallery'));
router.delete('/galleries/:id', authenticateToken, isAdmin, getHandler(() => galleryController, 'deleteGallery'));

module.exports = router;
