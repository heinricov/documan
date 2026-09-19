import { z } from "zod"

/**
 * Base Partner Schema
 * Digunakan untuk validasi data Partner dari database
 */
export const PartnerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().nullable().optional(),
  type: z.string().min(1).max(100),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

/**
 * Schema untuk membuat Partner baru
 */
export const CreatePartnerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(200, "Nama maksimal 200 karakter"),
  description: z.string().nullable().optional(),
  type: z.string().min(1, "Tipe wajib diisi").max(100, "Tipe maksimal 100 karakter"),
})

/**
 * Schema untuk update Partner
 * Semua field optional kecuali yang mau diupdate
 */
export const UpdatePartnerSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").max(200, "Nama maksimal 200 karakter").optional(),
  description: z.string().nullable().optional(),
  type: z.string().min(1, "Tipe wajib diisi").max(100, "Tipe maksimal 100 karakter").optional(),
})

/**
 * Schema untuk query/list Partners
 */
export const PartnerQuerySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().optional(),
  type: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
})

// ====================== Types ======================

/** Type Partner dari database */
export type Partner = z.infer<typeof PartnerSchema>

/** Type untuk create Partner baru */
export type CreatePartner = z.infer<typeof CreatePartnerSchema>

/** Type untuk update Partner */
export type UpdatePartner = z.infer<typeof UpdatePartnerSchema>

/** Type untuk query/list Partners */
export type PartnerQuery = z.infer<typeof PartnerQuerySchema>