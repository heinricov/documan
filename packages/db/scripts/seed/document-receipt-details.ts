import { prisma } from "../../src/client.js"
import { runScript } from "../lib/run-main.js"

/**
 * Seed tabel `document_receipt_details` dengan data default.
 * Idempotent — skip jika nomorDoc sudah ada.
 *
 * Langsung: pnpm --filter @packages/db db:seed:document-receipt-details
 * Di-import: dipanggil oleh `seed/index.ts` (seed semua).
 */

const DEFAULT_DETAILS = [
  {
    nomorDoc: "DOC-001",
    nomorFaktur: "FAK-001",
    description: "Detail invoice Januari 2026",
  },
  {
    nomorDoc: "DOC-002",
    nomorPl: "PL-001",
    description: "Detail packing list Januari 2026",
  },
  {
    nomorDoc: "DOC-003",
    nomorDo: "DO-001",
    nomorInv: "INV-001",
    description: "Detail delivery order dan invoice",
  },
] as const

export async function seedDocumentReceiptDetails(): Promise<void> {
  let inserted = 0

  // Ambil data referensi
  const docReceipts = await prisma.documentReceipt.findMany({ take: 1 })
  const subsidiaries = await prisma.subsidiary.findMany({ take: 1 })
  const partners = await prisma.partner.findMany({ take: 1 })

  if (!docReceipts[0] || !subsidiaries[0] || !partners[0]) {
    process.stdout.write(
      "Seed document_receipt_details dilewati: pastikan document_receipts, subsidiaries, dan partners sudah di-seed.\n"
    )
    return
  }

  for (const item of DEFAULT_DETAILS) {
    const existing = await prisma.documentReceiptDetail.findFirst({
      where: { nomorDoc: item.nomorDoc },
    })

    if (existing) continue

    await prisma.documentReceiptDetail.create({
      data: {
        documentReceiptId: docReceipts[0].id,
        subsidiaryId: subsidiaries[0].id,
        partnerId: partners[0].id,
        nomorDoc: item.nomorDoc,
        nomorFaktur: item.nomorFaktur ?? null,
        nomorPl: item.nomorPl ?? null,
        nomorDo: item.nomorDo ?? null,
        nomorInv: item.nomorInv ?? null,
        description: item.description,
      },
    })
    inserted++
  }

  process.stdout.write(`Seed document_receipt_details selesai: ${inserted} detail dibuat.\n`)
}

runScript("Seed document_receipt_details", import.meta.url, seedDocumentReceiptDetails)
