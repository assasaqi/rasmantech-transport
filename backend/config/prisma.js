const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
require('dotenv').config();

// 1. Ambil URL database dengan fallback ke nama database rasmantech_transport
let dbUrlString = process.env.DATABASE_URL || "mysql://root@localhost:3306/rasmantech_transport";

if (!dbUrlString || dbUrlString.includes('prisma+postgres')) {
    dbUrlString = "mysql://root@localhost:3306/rasmantech_transport";
}
if (dbUrlString.includes('?')) {
    dbUrlString = dbUrlString.split('?')[0];
}

// 2. Parsing URL menjadi komponen agar sesuai dengan format Prisma v7
const dbUrl = new URL(dbUrlString);

const adapterConfig = {
    host: dbUrl.hostname,
    port: Number(dbUrl.port) || 3306,
    user: dbUrl.username,
    database: dbUrl.pathname.substring(1) // Mengambil 'rasmantech_transport'
};

// Tambahkan password hanya jika ada
if (dbUrl.password) {
    adapterConfig.password = decodeURIComponent(dbUrl.password);
}

// 3. Inisialisasi adapter dengan objek konfigurasi
const adapter = new PrismaMariaDb(adapterConfig);

// 4. Inisialisasi Prisma Client (Wajib menggunakan adapter di Prisma v7)
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
