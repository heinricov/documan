import { defineConfig } from "prisma/config"
import { loadEnv } from "@configs/environment"

// Load environment variables from root .env
loadEnv()

export default defineConfig({
  // earlyAccess: true,
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
})
