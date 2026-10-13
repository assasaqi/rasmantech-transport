const jwt = require('jsonwebtoken');

// Fallback secret key disesuaikan agar seragam dengan controller

const JWT_SECRET = process.env.JWT_SECRET || 'rasmantech_secret_key_2026_xyz123';

// Middleware Verifikasi Token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: 'Bearer <TOKEN>'

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token otentikasi tidak ditemukan.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token tidak valid atau sudah kadaluwarsa.'
      });
    }

    req.user = user; // Menyimpan payload user ke objek request
    next();
  });
};

// Middleware Khusus Peran Admin
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Sesi otentikasi tidak valid.'
    });
  }

  const role = req.user.role ? String(req.user.role).toUpperCase() : '';
  if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'SUPERADMIN') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Akses ditolak. Fitur ini khusus untuk Admin.'
  });
};

module.exports = {
  authenticateToken,
  isAdmin
};
