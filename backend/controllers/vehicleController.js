const prisma = require('../config/prisma');
const { deleteImageFile } = require('../middleware/upload');

// Helper format respon komprehensif agar 100% kompatibel dengan Frontend React (Menyediakan camelCase & snake_case)
const formatVehicle = (item) => {
  if (!item) return null;

  const imgPath = item.imageUrl || item.image_url || '';
  const price = item.pricePerDay !== undefined ? item.pricePerDay : item.price_per_day;
  const available = item.isAvailable !== undefined ? item.isAvailable : item.is_available;

  return {
    ...item,
    // CamelCase (Prisma Schema Utama)
    pricePerDay: price,
    isAvailable: available,
    imageUrl: imgPath,

    // Alias & Kompatibilitas untuk Frontend React
    price_per_day: price,
    is_available: available,
    image_url: imgPath
  };
};

// 1. Ambil Semua Data Armada (Read All)
exports.getAllVehicles = async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { id: 'desc' }
    });

    res.json({
      success: true,
      data: vehicles.map(formatVehicle)
    });
  } catch (error) {
    console.error('Error pada getAllVehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data armada: ' + error.message
    });
  }
};

// 2. Tambah Armada Baru (Create)
exports.createVehicle = async (req, res) => {
  try {
    const {
      name, category, capacity, transmission,
      price_per_day, pricePerDay, description, status,
      is_available, isAvailable
    } = req.body;

    const uploadedImageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const finalPrice = pricePerDay !== undefined ? pricePerDay : price_per_day;
    const finalIsAvailable = isAvailable !== undefined ? Boolean(isAvailable) : (is_available !== undefined ? Boolean(is_available) : true);
    const validTransmission = ['Manual', 'Automatic'].includes(transmission) ? transmission : 'Manual';
    const validStatus = ['Tersedia', 'Disewa', 'Maintenance'].includes(status) ? status : 'Tersedia';

    const newVehicle = await prisma.vehicle.create({
      data: {
        name: name || '',
        category: category || 'MPV',
        capacity: capacity ? Number(capacity) : 6,
        transmission: validTransmission,
        description: description || '',
        status: validStatus,
        pricePerDay: finalPrice ? parseFloat(finalPrice) : 0,
        isAvailable: finalIsAvailable,
        imageUrl: uploadedImageUrl
      }
    });

    res.status(201).json({
      success: true,
      message: 'Armada berhasil ditambahkan!',
      data: formatVehicle(newVehicle)
    });
  } catch (error) {
    if (req.file) deleteImageFile(`/uploads/${req.file.filename}`);
    console.error('Error pada createVehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan armada: ' + error.message
    });
  }
};

// 3. Perbarui Data Armada (Update)
exports.updateVehicle = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      if (req.file) deleteImageFile(`/uploads/${req.file.filename}`);
      return res.status(400).json({ success: false, message: 'ID armada tidak valid' });
    }

    const {
      name, category, capacity, transmission,
      price_per_day, pricePerDay, description, status,
      is_available, isAvailable
    } = req.body;

    const existing = await prisma.vehicle.findUnique({ where: { id } });

    if (!existing) {
      if (req.file) deleteImageFile(`/uploads/${req.file.filename}`);
      return res.status(404).json({ success: false, message: 'Data armada tidak ditemukan!' });
    }

    const oldImage = existing.imageUrl || existing.image_url;
    let newImageUrl = oldImage;

    if (req.file) {
      newImageUrl = `/uploads/${req.file.filename}`;
      if (oldImage) deleteImageFile(oldImage);
    }

    const finalPrice = pricePerDay !== undefined ? pricePerDay : price_per_day;
    const finalIsAvailable = isAvailable !== undefined ? isAvailable : is_available;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (capacity !== undefined) updateData.capacity = Number(capacity);
    if (transmission && ['Manual', 'Automatic'].includes(transmission)) updateData.transmission = transmission;
    if (description !== undefined) updateData.description = description;
    if (status && ['Tersedia', 'Disewa', 'Maintenance'].includes(status)) updateData.status = status;
    if (finalPrice !== undefined) updateData.pricePerDay = parseFloat(finalPrice);
    if (finalIsAvailable !== undefined) updateData.isAvailable = Boolean(finalIsAvailable);
    updateData.imageUrl = newImageUrl;

    const updated = await prisma.vehicle.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Armada berhasil diperbarui!',
      data: formatVehicle(updated)
    });
  } catch (error) {
    if (req.file) deleteImageFile(`/uploads/${req.file.filename}`);
    console.error('Error pada updateVehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui armada: ' + error.message
    });
  }
};

// 4. Hapus Data Armada (Delete)
exports.deleteVehicle = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID armada tidak valid' });

    const existing = await prisma.vehicle.findUnique({ where: { id } });

    if (!existing) return res.status(404).json({ success: false, message: 'Data armada tidak ditemukan!' });

    await prisma.vehicle.delete({ where: { id } });

    const imageToDelete = existing.imageUrl || existing.image_url;
    if (imageToDelete) deleteImageFile(imageToDelete);

    res.json({
      success: true,
      message: 'Armada berhasil dihapus!'
    });
  } catch (error) {
    console.error('Error pada deleteVehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus armada: ' + error.message
    });
  }
};
