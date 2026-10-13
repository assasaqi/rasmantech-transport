const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import Instance Prisma Client & Rute Utama
const prisma = require('./config/prisma');
const apiRoutes = require('./routes/apiRoutes');

const app = express();

// ==========================================
// 1. Middlewares Global
// ==========================================
// Mengizinkan Cross-Origin Resource Sharing (CORS)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000'
  // Tambahkan domain produksi di sini saat deployment
];

app.use(cors({
  origin: function (origin, callback) {
    // Izinkan request tanpa origin (seperti curl, Postman, mobile app, atau browser direct load)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      // Mengizinkan semua origin untuk fleksibilitas pengembangan
      return callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body Parser untuk menangani payload JSON dan URL-encoded Form Data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Akses statis publik ke folder uploads dengan header CORS statis
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// ==========================================
// 2. Main API Routes & Health Check
// ==========================================
app.use('/api', apiRoutes);

// Health Check Endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'Success',
    message: 'API Backend Dafatih Transport Running OK',
    timestamp: new Date()
  });
});

// Diagnosa Koneksi Database MySQL via Prisma
app.get('/api/test-db', async (req, res) => {
  try {
    const tables = await prisma.$queryRaw`SHOW TABLES`;
    res.json({
      success: true,
      message: 'Koneksi ke database MySQL via Prisma berhasil!',
      tables
    });
  } catch (error) {
    console.error('Error Test DB:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal terhubung ke database MySQL via Prisma.',
      error: error.message
    });
  }
});

// ==========================================
// 3. Handling Errors & Route Fallbacks
// ==========================================
// 404 Route Not Found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} tidak ditemukan di server.`
  });
});

// Global Server & Multer Error Handler
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Ukuran berkas gambar terlalu besar! Maksimal 5MB.'
    });
  }

  if (err.message && err.message.includes('Hanya berkas gambar')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  console.error('Unhandled Internal Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan internal pada server.',
    error: err.message
  });
});

// ==========================================
// 4. Start & Run Server
// ==========================================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`=================================`);
  console.log(`🚀 Server Dafatih Transport Aktif`);
  console.log(`🌐 URL Server : http://localhost:${PORT}`);
  console.log(`=================================`);

  try {
    await prisma.$connect();
    console.log(`✅ Database MySQL Terhubung via Prisma!`);
  } catch (err) {
    console.error(`❌ Gagal terhubung ke MySQL via Prisma:`, err.message);
  }
});

// Graceful Shutdown (Menutup koneksi Prisma dengan aman saat server dimatikan)
const handleShutdown = async (signal) => {
  console.log(`\nSinyal ${signal} diterima. Menutup koneksi database Prisma...`);
  await prisma.$disconnect();
  server.close(() => {
    console.log('Server HTTP berhasil dihentikan secara aman.');
    process.exit(0);
  });
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
