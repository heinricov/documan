import { prisma } from "../../src/client.js"
import { runScript } from "../lib/run-main.js"

/**
 * Seed tabel `boxes` dengan data default.
 * Idempotent — skip jika noBox sudah ada.
 *
 * Langsung: pnpm --filter @packages/db db:seed:boxes
 * Di-import: dipanggil oleh `seed/index.ts` (seed semua).
 */

const DEFAULT_BOXES = [
  { noBox: "BOX-001", title: "Arsip Dokumen 2026", description: "Box untuk arsip dokumen tahun 2026" },
  { noBox: "BOX-002", title: "Dokumen Keuangan", description: "Box khusus dokumen keuangan" },
  { noBox: "BOX-003", title: "Dokumen Legal", description: "Box untuk dokumen legal & perizinan" },
] as const

export async function seedBoxes(): Promise<void> {
  let inserted = 0

  for (const box of DEFAULT_BOXES) {
    const existing = await prisma.box.findUnique({
      where: { noBox: box.noBox },
    })

    if (existing) continue

    await prisma.box.create({
      data: {
        noBox: box.noBox,
        title: box.title,
        description: box.description,
      },
    })
    inserted++
  }

  process.stdout.write(`Seed boxes selesai: ${inserted} box dibuat.\n`)
}

runScript("Seed boxes", import.meta.url, seedBoxes)
