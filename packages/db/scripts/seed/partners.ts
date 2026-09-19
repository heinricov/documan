import { prisma } from "../../src/client.js"
import { runScript } from "../lib/run-main.js"

/**
 * Seed tabel `partners` dengan data default.
 * Idempotent — skip jika name sudah ada.
 *
 * Langsung: pnpm --filter @packages/db db:seed:partners
 * Di-import: dipanggil oleh `seed/index.ts` (seed semua).
 */

const DEFAULT_PARTNERS = [
  { name: "PT Sumber Jaya", description: "Supplier utama bahan baku", type: "supplier" },
  { name: "CV Logistik Nusantara", description: "Jasa pengiriman barang", type: "logistics" },
  { name: "Bank BCA", description: "Layanan pembayaran & transfer", type: "bank" },
] as const

export async function seedPartners(): Promise<void> {
  let inserted = 0

  for (const partner of DEFAULT_PARTNERS) {
    const existing = await prisma.partner.findUnique({
      where: { name: partner.name },
    })

    if (existing) continue

    await prisma.partner.create({
      data: {
        name: partner.name,
        description: partner.description,
        type: partner.type,
      },
    })
    inserted++
  }

  process.stdout.write(`Seed partners selesai: ${inserted} partner dibuat.\n`)
}

runScript("Seed partners", import.meta.url, seedPartners)