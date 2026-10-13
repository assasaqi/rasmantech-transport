const prisma = require('../config/prisma');
const { deleteImageFile } = require('../middleware/upload');

// Helper format respon komprehensif agar 100% kompatibel dengan Frontend React Beranda & Admin
const formatRoute = (item) => {
  if (!item) return null;

  const pickup = item.pickupLocation || item.pickup_location || item.origin || '';
  const dropoff = item.dropoffLocation || item.dropoff_location || item.destination || '';
  const routeName = pickup && dropoff ? `${pickup} - ${dropoff}` : (item.name || item.title || '-');
  const routeImage = item.imageUrl || item.image_url || item.image || '';

  return {
    ...item,
    // CamelCase (Prisma Schema Utama)
    pickupLocation: pickup,
    dropoffLocation: dropoff,
    estimatedTime: item.estimatedTime || item.estimated_time || item.duration || '',
    imageUrl: routeImage,
    isActive: item.isActive !== undefined ? item.isActive : (item.is_active !== undefined ? item.is_active : true),

    // Alias & Kompatibilitas untuk Frontend React
    origin: pickup,
    destination: dropoff,
    title: routeName,
    name: routeName,
    image: routeImage,
    pickup_location: pickup,
    dropoff_location: dropoff,
    estimated_time: item.estimatedTime || item.estimated_time || item.duration || '',
    image_url: routeImage,
    is_active: item.isActive !== undefined ? item.isActive : (item.is_active !== undefined ? item.is_active : true)
  };
};

// 1. Ambil Semua Data Rute (Read All)
exports.getAllRoutes = async (req, res) => {
  try {
    const routes = await prisma.route.findMany({
      orderBy: { id: 'desc' }
    });

    res.json({
      success: true,
      data: routes.map(formatRoute)
    });
  } catch (error) {
    console.error('Error pada getAllRoutes:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data rute: ' + error.message
    });
  }
};

// 2. Tambah Rute Baru (Create)
exports.createRoute = async (req, res) => {
  try {
    const {
      pickup_location, pickupLocation, origin,
      dropoff_location, dropoffLocation, destination,
      price,
      estimated_time, estimatedTime, duration,
      is_active, isActive
    } = req.body;

    const uploadedImageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const finalPickup = pickupLocation || pickup_location || origin || '';
    const finalDropoff = dropoffLocation || dropoff_location || destination || '';
    const finalTime = estimatedTime || estimated_time || duration || '';
    const finalIsActive = isActive !== undefined ? Boolean(isActive) : (is_active !== undefined ? Boolean(is_active) : true);

    if (!finalPickup || !finalDropoff) {
      if (req.file) deleteImageFile(`/uploads/${req.file.filename}`);
      return res.status(400).json({
        success: false,
        message: 'Lokasi Penjemputan dan Lokasi Tujuan wajib diisi!'
      });
    }

    const priceNum = price ? parseFloat(price) : 0;

    const newRoute = await prisma.route.create({
      data: {
        pickupLocation: finalPickup,
        dropoffLocation: finalDropoff,
        price: priceNum,
        estimatedTime: finalTime,
        imageUrl: uploadedImageUrl,
        isActive: finalIsActive
      }
    });

    res.status(201).json({
      success: true,
      message: 'Rute berhasil ditambahkan!',
      data: formatRoute(newRoute)
    });
  } catch (error) {
    if (req.file) deleteImageFile(`/uploads/${req.file.filename}`);
    console.error('Error pada createRoute:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan rute: ' + error.message
    });
  }
};

// 3. Perbarui Data Rute (Update)
exports.updateRoute = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      if (req.file) deleteImageFile(`/uploads/${req.file.filename}`);
      return res.status(400).json({ success: false, message: 'ID rute tidak valid' });
    }

    const {
      pickup_location, pickupLocation, origin,
      dropoff_location, dropoffLocation, destination,
      price,
      estimated_time, estimatedTime, duration,
      is_active, isActive
    } = req.body;

    const existing = await prisma.route.findUnique({ where: { id } });

    if (!existing) {
      if (req.file) deleteImageFile(`/uploads/${req.file.filename}`);
      return res.status(404).json({ success: false, message: 'Data rute tidak ditemukan!' });
    }

    const oldImage = existing.imageUrl || existing.image_url || existing.image;
    let newImageUrl = oldImage;

    if (req.file) {
      newImageUrl = `/uploads/${req.file.filename}`;
      if (oldImage) deleteImageFile(oldImage);
    }

    const finalPickup = pickupLocation || pickup_location || origin;
    const finalDropoff = dropoffLocation || dropoff_location || destination;
    const finalTime = estimatedTime || estimated_time || duration;
    const finalIsActive = isActive !== undefined ? isActive : is_active;

    const updateData = {};
    if (finalPickup !== undefined) updateData.pickupLocation = finalPickup;
    if (finalDropoff !== undefined) updateData.dropoffLocation = finalDropoff;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (finalTime !== undefined) updateData.estimatedTime = finalTime;
    if (finalIsActive !== undefined) updateData.isActive = Boolean(finalIsActive);
    updateData.imageUrl = newImageUrl;

    const updatedRoute = await prisma.route.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Rute berhasil diperbarui!',
      data: formatRoute(updatedRoute)
    });
  } catch (error) {
    if (req.file) deleteImageFile(`/uploads/${req.file.filename}`);
    console.error('Error pada updateRoute:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui rute: ' + error.message
    });
  }
};

// 4. Hapus Data Rute (Delete)
exports.deleteRoute = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID rute tidak valid' });

    const existing = await prisma.route.findUnique({ where: { id } });

    if (!existing) return res.status(404).json({ success: false, message: 'Data rute tidak ditemukan!' });

    await prisma.route.delete({ where: { id } });

    const imageToDelete = existing.imageUrl || existing.image_url || existing.image;
    if (imageToDelete) deleteImageFile(imageToDelete);

    res.json({
      success: true,
      message: 'Rute berhasil dihapus!'
    });
  } catch (error) {
    console.error('Error pada deleteRoute:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus rute: ' + error.message
    });
  }
};
