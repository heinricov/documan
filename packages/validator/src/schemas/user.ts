import { z } from "zod"

/**
 * Base User Schema
 * Digunakan untuk validasi data User dari database
 * Note: password tidak disertakan dalam response schema
 */
export const UserSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(1).max(50),
  email: z.string().email(),
  roleId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

/**
 * Schema untuk membuat User baru
 * Tidak perlu id (akan di-generate otomatis)
 */
export const CreateUserSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter").max(50, "Username maksimal 50 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  roleId: z.string().uuid("Role ID tidak valid"),
})

/**
 * Schema untuk update User
 * Semua field optional kecuali yang mau diupdate
 */
export const UpdateUserSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter").max(50, "Username maksimal 50 karakter").optional(),
  email: z.string().email("Email tidak valid").optional(),
  password: z.string().min(8, "Password minimal 8 karakter").optional(),
  roleId: z.string().uuid("Role ID tidak valid").optional(),
})

/**
 * Schema untuk query/list Users
 * Note: page/limit pakai z.coerce.number karena nilai query HTTP selalu string.
 */
export const UserQuerySchema = z.object({
  id: z.string().uuid().optional(),
  username: z.string().optional(),
  email: z.string().optional(),
  roleId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
})

// ====================== Types ======================

/** Type User dari database (tanpa password) */
export type User = z.infer<typeof UserSchema>

/** Type untuk create User baru */
export type CreateUser = z.infer<typeof CreateUserSchema>

/** Type untuk update User */
export type UpdateUser = z.infer<typeof UpdateUserSchema>

/** Type untuk query/list Users */
export type UserQuery = z.infer<typeof UserQuerySchema>
