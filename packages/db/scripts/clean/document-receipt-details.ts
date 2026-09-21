import { cleanTable } from "../lib/clean-table.js"
import { runScript } from "../lib/run-main.js"

/**
 * Hapus data tabel `document_receipt_details` saja.
 *
 * Jalankan: pnpm --filter @packages/db db:clean:document-receipt-details
 */

export async function cleanDocumentReceiptDetails(): Promise<void> {
  await cleanTable("document_receipt_details")
}

runScript("Clean document_receipt_details", import.meta.url, cleanDocumentReceiptDetails)
