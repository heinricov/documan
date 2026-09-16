import { defineConfig } from "prisma/config"
import { getAllEnv, loadEnv } from "@configs/environment"

// Ambil env dari root .env monorepo.
// getAllEnv() selalu membaca file .env (tidak bergantung pada
// env var yang sudah ada di konteks CLI — lebih deterministik).
loadEnv()
const env = getAllEnv()

export default defineConfig({
  // earlyAccess: true,
  schema: "prisma/schema.prisma",
  datasource: {
    url: env.DATABASE_URL,
  },
})