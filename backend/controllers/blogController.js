const prisma = require('../config/prisma');
const fs = require('fs');
const path = require('path');

// Helper hapus file gambar lokal
const deleteImageFile = (imageUrl) => {
  if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('/uploads/')) {
    const filePath = path.join(__dirname, '..', imageUrl);
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') console.error('Gagal menghapus file lama:', err.message);
    });
  }
};

// Helper pembuat slug unik
const createSlug = (text) => {
  if (!text) return `post-${Date.now()}`;
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

// Format data blog agar kompatibel dengan frontend (menyediakan image_url dan imageUrl)
const formatBlog = (blog) => {
  if (!blog) return null;
  const imgPath = blog.imageUrl || blog.image_url || '';
  return {
    ...blog,
    image_url: imgPath,
    imageUrl: imgPath
  };
};

// 1. Ambil Semua Artikel Blog (Read All)
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { id: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json({
      success: true,
      data: blogs.map(formatBlog)
    });
  } catch (error) {
    console.error('Error pada getAllBlogs:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data artikel: ' + error.message });
  }
};

// 2. Tambah Artikel Blog Baru (Create)
exports.createBlog = async (req, res) => {
  try {
    const { title, excerpt, content, author_id, authorId, is_published, isPublished } = req.body;

    if (!title || !content) {
      if (req.file) deleteImageFile(`/uploads/${req.file.filename}`);
      return res.status(400).json({ success: false, message: 'Judul dan isi artikel wajib diisi!' });
    }

    const slug = `${createSlug(title)}-${Date.now()}`;
    const uploadedImageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const rawIsPublished = is_published !== undefined ? is_published : isPublished;
    const rawAuthorId = author_id !== undefined ? author_id : authorId;

    const parsedIsPublished = rawIsPublished === true || rawIsPublished === 'true' || rawIsPublished === '1' || rawIsPublished === 1;
    const parsedAuthorId = rawAuthorId && !isNaN(Number(rawAuthorId)) && Number(rawAuthorId) > 0 ? Number(rawAuthorId) : null;

    const newBlog = await prisma.blog.create({
      data: {
        title,
        slug,
        excerpt: excerpt || '',
        content,
        imageUrl: uploadedImageUrl,
        authorId: parsedAuthorId,
        isPublished: parsedIsPublished
      }
    });

    res.status(201).json({
      success: true,
      message: 'Artikel berhasil diterbitkan!',
      id: newBlog.id,
      data: formatBlog(newBlog)
    });
  } catch (error) {
    if (req.file) deleteImageFile(`/uploads/${req.file.filename}`);
    console.error('Error pada createBlog:', error);
    res.status(500).json({ success: false, message: 'Gagal menerbitkan artikel: ' + error.message });
  }
};

// 3. Perbarui Artikel Blog (Update)
exports.updateBlog = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      if (req.file) deleteImageFile(`/uploads/${req.file.filename}`);
      return res.status(400).json({ success: false, message: 'ID artikel tidak valid' });
    }

    const { title, excerpt, content, author_id, authorId, is_published, isPublished } = req.body;

    // Mengambil data artikel dari database menggunakan properti imageUrl
    const existing = await prisma.blog.findUnique({
      where: { id },
      select: { imageUrl: true, title: true }
    });

    if (!existing) {
      if (req.file) deleteImageFile(`/uploads/${req.file.filename}`);
      return res.status(404).json({ success: false, message: 'Artikel tidak ditemukan!' });
    }

    let newImageUrl = existing.imageUrl;
    if (req.file) {
      newImageUrl = `/uploads/${req.file.filename}`;
      if (existing.imageUrl) {
        deleteImageFile(existing.imageUrl);
      }
    }

    const updateData = {};
    if (title !== undefined && title !== '') {
      updateData.title = title;
      if (title !== existing.title) {
        updateData.slug = `${createSlug(title)}-${Date.now()}`;
      }
    }
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content !== undefined) updateData.content = content;

    const rawIsPublished = is_published !== undefined ? is_published : isPublished;
    if (rawIsPublished !== undefined) {
      updateData.isPublished = rawIsPublished === true || rawIsPublished === 'true' || rawIsPublished === '1' || rawIsPublished === 1;
    }

    const rawAuthorId = author_id !== undefined ? author_id : authorId;
    if (rawAuthorId !== undefined) {
      updateData.authorId = rawAuthorId && !isNaN(Number(rawAuthorId)) && Number(rawAuthorId) > 0 ? Number(rawAuthorId) : null;
    }

    updateData.imageUrl = newImageUrl;

    const updated = await prisma.blog.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Artikel berhasil diperbarui!',
      data: formatBlog(updated)
    });
  } catch (error) {
    if (req.file) deleteImageFile(`/uploads/${req.file.filename}`);
    console.error('Error pada updateBlog:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui artikel: ' + error.message });
  }
};

// 4. Hapus Artikel Blog (Delete)
exports.deleteBlog = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID artikel tidak valid' });

    const existing = await prisma.blog.findUnique({
      where: { id },
      select: { imageUrl: true }
    });

    if (!existing) return res.status(404).json({ success: false, message: 'Artikel tidak ditemukan!' });

    await prisma.blog.delete({ where: { id } });

    if (existing.imageUrl) {
      deleteImageFile(existing.imageUrl);
    }

    res.json({ success: true, message: 'Artikel berhasil dihapus!' });
  } catch (error) {
    console.error('Error pada deleteBlog:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus artikel: ' + error.message });
  }
};
