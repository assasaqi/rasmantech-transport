const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Fallback JWT_SECRET disamakan dengan middleware
const JWT_SECRET = process.env.JWT_SECRET || 'rasmantech_secret_key_2026_xyz123';

// Helper format data profil klien agar seragam
const formatUser = (user) => {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || 'client',
    created_at: user.createdAt || user.created_at || null
  };
};

/**
 * 1. REGISTRASI KLIEN BARU
 * Route: POST /api/client/register
 */
exports.registerClient = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Harap isi semua kolom wajib (Nama, WA/HP, Email, dan Password).'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        phone: phone.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: 'client'
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil! Silakan login dengan akun Anda.',
      data: formatUser(newUser)
    });
  } catch (error) {
    console.error('Error registerClient:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat registrasi: ' + error.message
    });
  }
};

/**
 * 2. LOGIN KLIEN (Memblokir akun Admin)
 * Route: POST /api/client/login
 */
exports.loginClient = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan kata sandi wajib diisi.'
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau kata sandi tidak cocok.'
      });
    }

    const currentRole = String(user.role || '').toLowerCase().trim();
    if (currentRole === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak! Akun Administrator tidak dapat login melalui halaman Klien.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email atau kata sandi tidak cocok.'
      });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role || 'client' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const formattedUser = formatUser(user);

    return res.status(200).json({
      success: true,
      message: 'Login berhasil!',
      token,
      user: formattedUser,
      client: formattedUser
    });
  } catch (error) {
    console.error('Error loginClient:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat login: ' + error.message
    });
  }
};

/**
 * 3. GET PROFIL KLIEN
 * Route: GET /api/client/profile
 */
exports.getClientProfile = async (req, res) => {
  try {
    const rawUserId = req.user?.id || req.query.id;
    const userId = Number(rawUserId);

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID Pengguna tidak valid.'
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.'
      });
    }

    return res.status(200).json({
      success: true,
      data: formatUser(user)
    });
  } catch (error) {
    console.error('Error getClientProfile:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data profil: ' + error.message
    });
  }
};

/**
 * 4. UPDATE PROFIL KLIEN
 * Route: PUT /api/client/profile
 */
exports.updateClientProfile = async (req, res) => {
  try {
    const rawUserId = req.user?.id || req.body.id;
    const userId = Number(rawUserId);
    const { name, phone } = req.body;

    if (!userId || isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'ID Pengguna tidak valid.'
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name ? name.trim() : undefined,
        phone: phone ? phone.trim() : undefined
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Profil berhasil diperbarui.',
      data: formatUser(updatedUser)
    });
  } catch (error) {
    console.error('Error updateClientProfile:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui profil: ' + error.message
    });
  }
};
