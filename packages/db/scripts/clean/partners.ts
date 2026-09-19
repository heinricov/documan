import { cleanTable } from "../lib/clean-table.js"
import { runScript } from "../lib/run-main.js"

/**
 * Hapus data tabel `partners` saja.
 *
 * Jalankan: pnpm --filter @packages/db db:clean:partners
 */

export async function cleanPartners(): Promise<void> {
  await cleanTable("partners")
}

runScript("Clean partners", import.meta.url, cleanPartners)