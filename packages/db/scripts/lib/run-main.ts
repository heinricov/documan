import { fileURLToPath } from "node:url"
import { prisma } from "../../src/client.js"

/**
 * True jika file sedang dijalankan langsung (bukan di-import).
 *
 * @example
 * ```ts
 * if (isMain(import.meta.url)) {
 *   // hanya jalan saat `tsx scripts/...`
 * }
 * ```
 */
export function isMain(moduleUrl: string): boolean {
  return fileURLToPath(moduleUrl) === process.argv[1]
}

/**
 * Jalankan script sebagai entry point (langsung), lengkap dengan
 * pengelolaan `prisma.$disconnect()` & error exit.
 * Tidak melakukan apa-apa jika file ini hanya di-import.
 *
 * @example
 * ```ts
 * runScript("Seed roles", import.meta.url, seedRoles)
 * ```
 */
export function runScript(
  label: string,
  moduleUrl: string,
  fn: () => Promise<void>
): void {
  if (!isMain(moduleUrl)) return

  void (async () => {
    try {
      await fn()
      await prisma.$disconnect()
    } catch (error) {
      process.stderr.write(`${label} gagal: ${String(error)}\n`)
      await prisma.$disconnect()
      process.exitCode = 1
    }
  })()
}