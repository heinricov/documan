import { cleanTable } from "../lib/clean-table.js"
import { runScript } from "../lib/run-main.js"

/**
 * Hapus data tabel `boxes` saja.
 *
 * Jalankan: pnpm --filter @packages/db db:clean:boxes
 */

export async function cleanBoxes(): Promise<void> {
  await cleanTable("boxes")
}

runScript("Clean boxes", import.meta.url, cleanBoxes)
