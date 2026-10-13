const { z } = require('zod');

// Middleware pemroses skema Zod
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Validasi input gagal',
      errors: result.error.flatten().fieldErrors,
    });
  }
  req.body = result.data; // Mengganti req.body dengan data yang sudah dibersihkan & divalidasi
  next();
};

// ==========================================
// DEFINISI SKEMA VALIDASI ZOD
// ==========================================

// 1. Skema Login (Admin & Client)
const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

// 2. Skema Register (Admin & Client)
const registerSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  phone: z.string().optional(),
});

// 3. Skema Route / Rute & Tarif
const routeSchema = z.object({
  origin: z.string().min(2, 'Kota asal wajib diisi'),
  destination: z.string().min(2, 'Kota tujuan wajib diisi'),
  price: z.coerce.number().positive('Harga harus berupa angka positif'),
  description: z.string().optional(),
});

// 4. Skema Vehicle / Armada
const vehicleSchema = z.object({
  name: z.string().min(2, 'Nama kendaraan wajib diisi'),
  type: z.string().optional(),
  capacity: z.coerce.number().int().positive('Kapasitas harus angka positif'),
  pricePerDay: z.coerce.number().positive('Harga sewa harus angka positif'),
  status: z.enum(['AVAILABLE', 'BOOKED', 'MAINTENANCE']).optional(),
});

// 5. Skema Booking / Pemesanan (Disesuaikan agar Toleran Snake_case, CamelCase, & Nullable)
const bookingSchema = z.object({
  customerName: z.string().optional(),
  customer_name: z.string().optional(),

  customerPhone: z.string().optional(),
  customer_phone: z.string().optional(),

  customerEmail: z.string().email('Format email tidak valid').nullable().optional(),
  customer_email: z.string().email('Format email tidak valid').nullable().optional(),

  serviceType: z.string().optional(),
  service_type: z.string().optional(),

  vehicleId: z.coerce.number().nullable().optional(),
  vehicle_id: z.coerce.number().nullable().optional(),

  routeId: z.coerce.number().nullable().optional(),
  route_id: z.coerce.number().nullable().optional(),

  tourPackageId: z.coerce.number().nullable().optional(),
  tour_package_id: z.coerce.number().nullable().optional(),

  startDate: z.string().optional(),
  pickupDate: z.string().optional(),
  pickup_date: z.string().optional(),

  pickupTime: z.string().optional(),
  pickup_time: z.string().optional(),

  pickupAddress: z.string().optional(),
  pickup_address: z.string().optional(),
  pickup_location: z.string().optional(),
  dropoff_location: z.string().optional(),

  passengerCount: z.coerce.number().optional(),
  passenger_count: z.coerce.number().optional(),

  totalPrice: z.coerce.number().optional(),
  total_price: z.coerce.number().optional(),

  notes: z.string().optional(),
  status: z.string().optional(),
});

// 6. Skema Blog / Artikel
const blogSchema = z.object({
  title: z.string().min(5, 'Judul artikel minimal 5 karakter'),
  content: z.string().min(10, 'Konten artikel minimal 10 karakter'),
  category: z.string().optional(),
});

// 7. Skema Gallery / Foto
const gallerySchema = z.object({
  title: z.string().min(2, 'Judul galeri wajib diisi'),
  description: z.string().optional(),
});

module.exports = {
  validate,
  loginSchema,
  registerSchema,
  routeSchema,
  vehicleSchema,
  bookingSchema,
  blogSchema,
  gallerySchema,
};
