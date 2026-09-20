import { cleanTable } from "../lib/clean-table.js"
import { runScript } from "../lib/run-main.js"

/**
 * Hapus data tabel `document_receipts` saja.
 *
 * Jalankan: pnpm --filter @packages/db db:clean:document-receipts
 */

export async function cleanDocumentReceipts(): Promise<void> {
  await cleanTable("document_receipts")
}

runScript("Clean document_receipts", import.meta.url, cleanDocumentReceipts)
