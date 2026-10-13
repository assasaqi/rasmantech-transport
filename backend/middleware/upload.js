const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Pastikan direktori 'uploads' ada
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Gunakan memoryStorage agar gambar ditampung di RAM saat proses kompresi
const storage = multer.memoryStorage();

// Validasi Ganda: Memeriksa MIME Type dan Ekstensi Ekstensi Berkas
const fileFilter = (req, file, cb) => {
    const allowedExts = /\.(jpg|jpeg|png|webp)$/i;
    const isExtensionValid = allowedExts.test(file.originalname);
    const isMimeValid = file.mimetype.startsWith('image/');

    if (isMimeValid && isExtensionValid) {
        cb(null, true);
    } else {
        cb(new Error('Hanya berkas gambar (JPG, JPEG, PNG, WEBP) yang diperbolehkan!'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Batas maksimum 5MB per berkas
});

// Helper internal untuk memproses dan mengompresi buffer gambar
const processAndSaveImage = async (fileBuffer) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `file-${uniqueSuffix}.webp`;
    const outputPath = path.join(uploadDir, filename);

    await sharp(fileBuffer)
        .resize({ width: 1200, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outputPath);

    return {
        filename,
        path: outputPath,
        destination: uploadDir
    };
};

// Middleware pemrosesan gambar ke format WebP (Mendukung single & multiple upload)
const compressImage = async (req, res, next) => {
    try {
        // 1. Penanganan Single File (req.file)
        if (req.file) {
            const processed = await processAndSaveImage(req.file.buffer);
            req.file.filename = processed.filename;
            req.file.path = processed.path;
            req.file.destination = processed.destination;
            return next();
        }

        // 2. Penanganan Multiple Files (req.files)
        if (req.files) {
            if (Array.isArray(req.files)) {
                // Kasus upload.array('images')
                await Promise.all(
                    req.files.map(async (file) => {
                        const processed = await processAndSaveImage(file.buffer);
                        file.filename = processed.filename;
                        file.path = processed.path;
                        file.destination = processed.destination;
                    })
                );
            } else if (typeof req.files === 'object') {
                // Kasus upload.fields([{ name: 'cover' }, { name: 'gallery' }])
                const filePromises = [];
                for (const fieldname of Object.keys(req.files)) {
                    for (const file of req.files[fieldname]) {
                        filePromises.push(
                            (async () => {
                                const processed = await processAndSaveImage(file.buffer);
                                file.filename = processed.filename;
                                file.path = processed.path;
                                file.destination = processed.destination;
                            })()
                        );
                    }
                }
                await Promise.all(filePromises);
            }
            return next();
        }

        // Jika tidak ada berkas yang diunggah, lanjut ke middleware berikutnya
        next();
    } catch (error) {
        next(error);
    }
};

// Helper Function: Menghapus File Fisik Gambar dengan Perlindungan Path Traversal
const deleteImageFile = (imageUrl) => {
    if (!imageUrl || typeof imageUrl !== 'string') return;

    if (imageUrl.startsWith('/uploads/')) {
        // Normalisasi path untuk mencegah manipulasi direktori seperti '../'
        const safeRelativePath = path.normalize(imageUrl).replace(/^(\.\.[\/\\])+/, '');
        const filePath = path.join(__dirname, '..', safeRelativePath);

        // Memastikan lokasi akhir berkas tetap di dalam direktori uploadDir
        const resolvedUploadDir = path.resolve(uploadDir);
        const resolvedFilePath = path.resolve(filePath);

        if (!resolvedFilePath.startsWith(resolvedUploadDir)) {
            console.error('Peringatan Keamanan: Percobaan Path Traversal terdeteksi pada deleteImageFile.');
            return;
        }

        fs.unlink(resolvedFilePath, (err) => {
            if (err && err.code !== 'ENOENT') {
                console.error('Gagal menghapus file gambar fisik:', err.message);
            }
        });
    }
};

module.exports = {
    upload,
    compressImage,
    deleteImageFile
};
