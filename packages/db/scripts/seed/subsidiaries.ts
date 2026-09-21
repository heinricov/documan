import { prisma } from "../../src/client.js"
import { runScript } from "../lib/run-main.js"

/**
 * Seed tabel `subsidiaries` dengan data default.
 * Idempotent — skip jika title sudah ada.
 *
 * Langsung: pnpm --filter @packages/db db:seed:subsidiaries
 * Di-import: dipanggil oleh `seed/index.ts` (seed semua).
 */

const DEFAULT_SUBSIDIARIES = [
  { title: "PT Maju Bersama", name: "Maju Bersama", logo: null },
  { title: "PT Sejahtera Abadi", name: "Sejahtera Abadi", logo: null },
  { title: "PT Jaya Makmur", name: "Jaya Makmur", logo: null },
] as const

export async function seedSubsidiaries(): Promise<void> {
  let inserted = 0

  for (const sub of DEFAULT_SUBSIDIARIES) {
    const existing = await prisma.subsidiary.findUnique({
      where: { title: sub.title },
    })

    if (existing) continue

    await prisma.subsidiary.create({
      data: {
        title: sub.title,
        name: sub.name,
        logo: sub.logo,
      },
    })
    inserted++
  }

  process.stdout.write(`Seed subsidiaries selesai: ${inserted} subsidiary dibuat.\n`)
}

runScript("Seed subsidiaries", import.meta.url, seedSubsidiaries)
