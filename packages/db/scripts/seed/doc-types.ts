import { prisma } from "../../src/client.js"
import { runScript } from "../lib/run-main.js"

/**
 * Seed tabel `doc_types`.
 * Idempotent — skip jika title sudah ada.
 *
 * Langsung: pnpm --filter @packages/db db:seed:doc-types
 * Di-import: dipanggil oleh `seed/index.ts` (seed semua).
 */

const DEFAULT_DOC_TYPES = [
  { title: "do", description: "Delivery Order" },
  { title: "pv", description: "Payment Voucher" },
] as const

export async function seedDocTypes(): Promise<void> {
  let inserted = 0

  for (const docType of DEFAULT_DOC_TYPES) {
    const existing = await prisma.docType.findUnique({
      where: { title: docType.title },
    })

    if (existing) continue

    await prisma.docType.create({
      data: {
        title: docType.title,
        description: docType.description,
      },
    })
    inserted++
  }

  process.stdout.write(`Seed doc types selesai: ${inserted} doc type dibuat.\n`)
}

runScript("Seed doc types", import.meta.url, seedDocTypes)