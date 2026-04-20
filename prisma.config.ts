import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local (Next.js convention for local secrets)
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
    // Note: DIRECT_URL is used for migrations (bypasses PgBouncer).
    // Prisma 7 migration CLI reads directUrl via env("DIRECT_URL") when available.
  },
});
