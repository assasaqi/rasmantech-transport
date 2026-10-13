const prisma = require('../config/prisma');
const { deleteImageFile } = require('../middleware/upload');

// Helper format respon agar selalu menyertakan `image_url` dan `imageUrl` untuk frontend React
const formatGallery = (item) => {
  if (!item) return null;
  const imgPath = item.imageUrl || item.image_url || '';
  return {
    ...item,
    imageUrl: imgPath,
    image_url: imgPath,
    createdAt: item.createdAt || item.created_at,
    created_at: item.createdAt || item.created_at
  };
};

// 1. Ambil Semua Data Galeri (Read All)
exports.getAllGalleries = async (req, res) => {
  try {
    const galleries = await prisma.gallery.findMany({
      orderBy: { id: 'desc' }
    });

    res.json({
      success: true,
      data: galleries.map(formatGallery)
    });
  } catch (error) {
    console.error('Error pada getAllGalleries:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data galeri: ' + error.message
    });
  }
};

// 2. Tambah Galeri Baru (Create)
exports.createGallery = async (req, res) => {
  try {
    const { title, category } = req.body;
    const uploadedImageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File gambar wajib diunggah!'
      });
    }

    const newGallery = await prisma.gallery.create({
      data: {
        title: title || '',
        category: category || 'Destinasi',
        imageUrl: uploadedImageUrl
      }
    });

    res.status(201).json({
      success: true,
      message: 'Foto galeri berhasil ditambahkan!',
      data: formatGallery(newGallery)
    });
  } catch (error) {
    if (req.file) deleteImageFile(`/uploads/${req.file.filename}`);
    console.error('Error pada createGallery:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan galeri: ' + error.message
    });
  }
};

// 3. Perbarui Data Galeri (Update)
exports.updateGallery = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      if (req.file) deleteImageFile(`/uploads/${req.file.filename}`);
      return res.status(400).json({ success: false, message: 'ID galeri tidak valid' });
    }

    const { title, category } = req.body;

    const existing = await prisma.gallery.findUnique({ where: { id } });

    if (!existing) {
      if (req.file) deleteImageFile(`/uploads/${req.file.filename}`);
      return res.status(404).json({ success: false, message: 'Data galeri tidak ditemukan!' });
    }

    const oldImage = existing.imageUrl || existing.image_url;
    let newImageUrl = oldImage;

    if (req.file) {
      newImageUrl = `/uploads/${req.file.filename}`;
      if (oldImage) deleteImageFile(oldImage);
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (category !== undefined) updateData.category = category;
    updateData.imageUrl = newImageUrl;

    const updated = await prisma.gallery.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Galeri berhasil diperbarui!',
      data: formatGallery(updated)
    });
  } catch (error) {
    if (req.file) deleteImageFile(`/uploads/${req.file.filename}`);
    console.error('Error pada updateGallery:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui galeri: ' + error.message
    });
  }
};

// 4. Hapus Data Galeri (Delete)
exports.deleteGallery = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'ID galeri tidak valid' });
    }

    const existing = await prisma.gallery.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Data galeri tidak ditemukan!' });
    }

    await prisma.gallery.delete({ where: { id } });

    const imageToDelete = existing.imageUrl || existing.image_url;
    if (imageToDelete) deleteImageFile(imageToDelete);

    res.json({
      success: true,
      message: 'Galeri berhasil dihapus!'
    });
  } catch (error) {
    console.error('Error pada deleteGallery:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus galeri: ' + error.message
    });
  }
};
