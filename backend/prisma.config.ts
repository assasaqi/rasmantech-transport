// ✅ BENAR (Menggunakan ':' untuk object property)
import "dotenv/config";
import { defineConfig } from "prisma/config";

declare const process: {
  env: Record<string, string | undefined>;
};

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
