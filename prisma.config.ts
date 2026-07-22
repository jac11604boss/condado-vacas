import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Conexión DIRECTA (no pooled) para CLI: migraciones e introspección
    url: env("DIRECT_URL"),
  },
});
