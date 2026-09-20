import { z } from "zod"

/**
 * Base Box Schema
 * Digunakan untuk validasi data Box dari database
 */
export const BoxSchema = z.object({
  id: z.string().uuid(),
  noBox: z.string().min(1, "Nomor box wajib diisi").max(100, "Nomor box maksimal 100 karakter"),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

/**
 * Schema untuk membuat Box baru
 */
export const CreateBoxSchema = z.object({
  noBox: z.string().min(1, "Nomor box wajib diisi").max(100, "Nomor box maksimal 100 karakter"),
  title: z.string().max(200, "Title maksimal 200 karakter").nullable().optional(),
  description: z.string().nullable().optional(),
})

/**
 * Schema untuk update Box
 * Semua field optional kecuali yang mau diupdate
 */
export const UpdateBoxSchema = z.object({
  noBox: z.string().min(1, "Nomor box wajib diisi").max(100, "Nomor box maksimal 100 karakter").optional(),
  title: z.string().max(200, "Title maksimal 200 karakter").nullable().optional(),
  description: z.string().nullable().optional(),
})

/**
 * Schema untuk query/list Boxes
 */
export const BoxQuerySchema = z.object({
  id: z.string().uuid().optional(),
  noBox: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
})

// ====================== Types ======================

/** Type Box dari database */
export type Box = z.infer<typeof BoxSchema>

/** Type untuk create Box baru */
export type CreateBox = z.infer<typeof CreateBoxSchema>

/** Type untuk update Box */
export type UpdateBox = z.infer<typeof UpdateBoxSchema>

/** Type untuk query/list Boxes */
export type BoxQuery = z.infer<typeof BoxQuerySchema>