import { z } from "zod"

/**
 * Base DocType Schema
 * Digunakan untuk validasi data DocType dari database
 */
export const DocTypeSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(100),
  description: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

/**
 * Schema untuk membuat DocType baru
 */
export const CreateDocTypeSchema = z.object({
  title: z.string().min(1, "Title wajib diisi").max(100, "Title maksimal 100 karakter"),
  description: z.string().nullable().optional(),
})

/**
 * Schema untuk update DocType
 * Semua field optional kecuali yang mau diupdate
 */
export const UpdateDocTypeSchema = z.object({
  title: z.string().min(1, "Title wajib diisi").max(100, "Title maksimal 100 karakter").optional(),
  description: z.string().nullable().optional(),
})

/**
 * Schema untuk query/list DocTypes
 */
export const DocTypeQuerySchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
})

// ====================== Types ======================

/** Type DocType dari database */
export type DocType = z.infer<typeof DocTypeSchema>

/** Type untuk create DocType baru */
export type CreateDocType = z.infer<typeof CreateDocTypeSchema>

/** Type untuk update DocType */
export type UpdateDocType = z.infer<typeof UpdateDocTypeSchema>

/** Type untuk query/list DocTypes */
export type DocTypeQuery = z.infer<typeof DocTypeQuerySchema>