const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'rasmantech_secret_key_2026_xyz123';

const formatAdmin = (user) => {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name || 'Admin',
    email: user.email || '',
    role: user.role || 'admin',
    created_at: user.createdAt || user.created_at || null
  };
};

// 1. Register Admin
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi!' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const fullName = name ? name.trim() : email.split('@')[0];

    const newAdmin = await prisma.user.create({
      data: {
        name: fullName,
        email: normalizedEmail,
        password: hashedPassword,
        role: 'admin'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Registrasi admin berhasil!',
      data: formatAdmin(newAdmin)
    });
  } catch (error) {
    console.error('Error Register Admin:', error);
    res.status(500).json({ success: false, message: 'Gagal registrasi: ' + error.message });
  }
};

// Alias untuk registerAdmin
exports.registerAdmin = exports.register;

// 2. Login Admin
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi!' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Email atau password salah!' });
    }

    const currentRole = String(user.role || '').toLowerCase().trim();
    if (currentRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak! Halaman ini khusus untuk Administrator.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email atau password salah!' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'admin' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      message: 'Login Admin berhasil!',
      token,
      data: formatAdmin(user)
    });
  } catch (error) {
    console.error('Error Login Admin:', error);
    res.status(500).json({ success: false, message: 'Gagal login: ' + error.message });
  }
};

// Alias untuk loginAdmin
exports.loginAdmin = exports.login;

// 3. Get Admin Profile
exports.getProfile = async (req, res) => {
  try {
    const rawEmail = req.user?.email || req.query.email;
    if (!rawEmail) {
      return res.status(400).json({ success: false, message: 'Email wajib disertakan.' });
    }

    const user = await prisma.user.findUnique({
      where: { email: rawEmail.toLowerCase().trim() }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Akun tidak ditemukan.' });
    }

    res.json({ success: true, data: formatAdmin(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil profil: ' + error.message });
  }
};

// 4. Update Admin Profile
exports.updateProfile = async (req, res) => {
  try {
    const currentEmail = req.user?.email || req.body.currentEmail;

    if (!currentEmail) {
      return res.status(400).json({ success: false, message: 'Current Email wajib diisi!' });
    }

    const { name, newEmail, oldPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: currentEmail.toLowerCase().trim() }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Akun tidak ditemukan.' });
    }

    const updatedName = name ? name.trim() : user.name;
    const updatedEmail = newEmail ? newEmail.toLowerCase().trim() : user.email;

    const updateData = {
      name: updatedName,
      email: updatedEmail
    };

    if (newPassword && newPassword.trim() !== '') {
      const isOldMatch = await bcrypt.compare(oldPassword || '', user.password);
      if (!isOldMatch) {
        return res.status(400).json({ success: false, message: 'Password lama Anda salah!' });
      }
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Profil berhasil diperbarui!',
      data: formatAdmin(updatedUser),
      updatedEmail: updatedEmail
    });
  } catch (error) {
    console.error('Error pada updateProfile:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui profil: ' + error.message });
  }
};
