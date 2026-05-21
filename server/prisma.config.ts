import { defineConfig, env } from "prisma/config";
import path from "path";

try {
  process.loadEnvFile(path.resolve(__dirname, ".env"));
} catch (e) {}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
