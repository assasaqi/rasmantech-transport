const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'rasmantech_secret_key_2026_xyz123';

// 1. Register Admin
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi!'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar!'
      });
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

    return res.status(201).json({
      success: true,
      message: 'Registrasi admin berhasil!',
      data: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role
      }
    });
  } catch (error) {
    console.error('Error Register Admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal registrasi: ' + error.message
    });
  }
};

// 2. Login Admin
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi!'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah!'
      });
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
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah!'
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'admin' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      success: true,
      message: 'Login Admin berhasil!',
      token,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error Login Admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal login: ' + error.message
    });
  }
};

// 3. Get Profile
const getProfile = async (req, res) => {
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

    return res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil profil: ' + error.message });
  }
};

// 4. Update Profile
const updateProfile = async (req, res) => {
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

    const updateData = {
      name: name ? name.trim() : user.name,
      email: newEmail ? newEmail.toLowerCase().trim() : user.email
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

    return res.json({
      success: true,
      message: 'Profil berhasil diperbarui!',
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui profil: ' + error.message });
  }
};

module.exports = {
  registerAdmin,
  register: registerAdmin,
  loginAdmin,
  login: loginAdmin,
  getProfile,
  updateProfile
};
