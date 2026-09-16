import { PrismaClient } from "../prisma/generated/client/client.js"
import { PrismaPg } from "@prisma/adapter-pg"
import { loadEnv } from "@configs/environment"

// Load environment variables from root .env
loadEnv()

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * pg-connection-string memperingatkan bahwa 'prefer'/'require'/'verify-ca'
 * diperlakukan sebagai alias 'verify-full', dan mem-banjiri log dengan
 * SECURITY WARNING. Normalkan ke 'verify-full' secara eksplisit.
 */
function normalizeConnectionUrl(url: string): string {
  try {
    const parsed = new URL(url)
    const sslmode = parsed.searchParams.get("sslmode")
    if (sslmode && !["verify-full", "disable"].includes(sslmode)) {
      parsed.searchParams.set("sslmode", "verify-full")
    }
    return parsed.href
  } catch {
    return url
  }
}

function createPrismaClient() {
  const connectionString = normalizeConnectionUrl(process.env.DATABASE_URL!)
  const adapter = new PrismaPg({ connectionString })

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export type * from "../prisma/generated/client/client.js"
