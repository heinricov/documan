import { z } from "zod"

/**
 * Base Role Schema
 * Digunakan untuk validasi data Role dari database
 */
export const RoleSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(100),
  description: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

/**
 * Schema untuk membuat Role baru
 * Tidak perlu id (akan di-generate otomatis)
 */
export const CreateRoleSchema = z.object({
  title: z.string().min(1, "Title wajib diisi").max(100, "Title maksimal 100 karakter"),
  description: z.string().nullable().optional(),
})

/**
 * Schema untuk update Role
 * Semua field optional kecuali yang mau diupdate
 */
export const UpdateRoleSchema = z.object({
  title: z.string().min(1, "Title wajib diisi").max(100, "Title maksimal 100 karakter").optional(),
  description: z.string().nullable().optional(),
})

/**
 * Schema untuk query/list Roles
 * Note: page/limit pakai z.coerce.number karena nilai query HTTP selalu string.
 */
export const RoleQuerySchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
})

// ====================== Types ======================

/** Type Role dari database */
export type Role = z.infer<typeof RoleSchema>

/** Type untuk create Role baru */
export type CreateRole = z.infer<typeof CreateRoleSchema>

/** Type untuk update Role */
export type UpdateRole = z.infer<typeof UpdateRoleSchema>

/** Type untuk query/list Roles */
export type RoleQuery = z.infer<typeof RoleQuerySchema>
