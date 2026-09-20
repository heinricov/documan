import { prisma } from "../../src/client.js"
import { runScript } from "../lib/run-main.js"

/**
 * Seed tabel `document_receipts` dengan data default.
 * Idempotent — skip jika title sudah ada.
 *
 * Langsung: pnpm --filter @packages/db db:seed:document-receipts
 * Di-import: dipanggil oleh `seed/index.ts` (seed semua).
 */

const DEFAULT_DOCUMENT_RECEIPTS = [
  {
    title: "Invoice Januari 2026",
    description: "Invoice dari PT Maju untuk layanan konsultasi",
  },
  {
    title: "Surat Perjanjian Kerjasama",
    description: "Perjanjian kerjasama dengan PT Sejahtera",
  },
  {
    title: "Bukti Pembayaran",
    description: "Bukti pembayaran Invoice Januari 2026",
  },
] as const

export async function seedDocumentReceipts(): Promise<void> {
  let inserted = 0

  // Ambil data referensi yang diperlukan
  const users = await prisma.user.findMany({ take: 1 })
  const docTypes = await prisma.docType.findMany({ take: 1 })
  const subsidiaries = await prisma.subsidiary.findMany({ take: 1 })
  const partners = await prisma.partner.findMany({ take: 1 })
  const boxes = await prisma.box.findMany({ take: 1 })

  if (!users[0] || !docTypes[0] || !subsidiaries[0] || !partners[0] || !boxes[0]) {
    process.stdout.write(
      "Seed document_receipts dilewati: pastikan users, doc_types, subsidiaries, partners, dan boxes sudah di-seed.\n"
    )
    return
  }

  for (const item of DEFAULT_DOCUMENT_RECEIPTS) {
    const existing = await prisma.documentReceipt.findFirst({
      where: { title: item.title },
    })

    if (existing) continue

    await prisma.documentReceipt.create({
      data: {
        title: item.title,
        description: item.description,
        userId: users[0].id,
        docTypeId: docTypes[0].id,
        subsidiaryId: subsidiaries[0].id,
        partnerId: partners[0].id,
        boxId: boxes[0].id,
      },
    })
    inserted++
  }

  process.stdout.write(`Seed document_receipts selesai: ${inserted} document receipt dibuat.\n`)
}

runScript("Seed document_receipts", import.meta.url, seedDocumentReceipts)
