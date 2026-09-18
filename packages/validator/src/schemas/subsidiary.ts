import { z } from "zod"

/**
 * Base Subsidiary Schema
 * Digunakan untuk validasi data Subsidiary dari database
 */
export const SubsidiarySchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  logo: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

/**
 * Schema untuk membuat Subsidiary baru
 * Tidak perlu id (akan di-generate otomatis)
 */
export const CreateSubsidiarySchema = z.object({
  title: z.string().min(1, "Title wajib diisi").max(100, "Title maksimal 100 karakter"),
  name: z.string().min(1, "Nama wajib diisi").max(200, "Nama maksimal 200 karakter"),
  logo: z.string().nullable().optional(),
})

/**
 * Schema untuk update Subsidiary
 * Semua field optional kecuali yang mau diupdate
 */
export const UpdateSubsidiarySchema = z.object({
  title: z.string().min(1, "Title wajib diisi").max(100, "Title maksimal 100 karakter").optional(),
  name: z.string().min(1, "Nama wajib diisi").max(200, "Nama maksimal 200 karakter").optional(),
  logo: z.string().nullable().optional(),
})

/**
 * Schema untuk query/list Subsidiaries
 * Note: page/limit pakai z.coerce.number karena nilai query HTTP selalu string.
 */
export const SubsidiaryQuerySchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().optional(),
  name: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
})

// ====================== Types ======================

/** Type Subsidiary dari database */
export type Subsidiary = z.infer<typeof SubsidiarySchema>

/** Type untuk create Subsidiary baru */
export type CreateSubsidiary = z.infer<typeof CreateSubsidiarySchema>

/** Type untuk update Subsidiary */
export type UpdateSubsidiary = z.infer<typeof UpdateSubsidiarySchema>

/** Type untuk query/list Subsidiaries */
export type SubsidiaryQuery = z.infer<typeof SubsidiaryQuerySchema>