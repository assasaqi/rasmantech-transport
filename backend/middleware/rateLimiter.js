const rateLimit = require('express-rate-limit');

// Limiter umum untuk seluruh API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // Maksimal 100 request per IP
  message: {
    success: false,
    message: 'Terlalu banyak permintaan, silakan coba lagi nanti.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter ketat khusus login/register (mencegah brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Maksimal 5 percobaan per IP
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login, silakan coba beberapa saat lagi.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiLimiter, authLimiter };
