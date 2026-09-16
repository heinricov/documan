import { z } from "zod"

/**
 * Schema param ID path — dipakai semua endpoint `:id`.
 * SSOT sehingga controller tidak perlu mendefinisikan ulang.
 */
export const IdParamsSchema = z.object({
  id: z.string().uuid("ID tidak valid"),
})

/**
 * Meta pagination (offset-based) — standar API.
 */
export const PaginationMetaSchema = z.object({
  page: z.number().int(),
  limit: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
  hasNext: z.boolean(),
  hasPrevious: z.boolean(),
})

/**
 * Bangun schema paginated response (list) generik untuk suatu item schema.
 *
 * @example
 * ```ts
 * const RoleListSchema = paginatedResponseSchema(RoleSchema)
 * ```
 */
export function paginatedResponseSchema<TSchema extends z.ZodType>(
  itemSchema: TSchema
) {
  return z.object({
    success: z.literal(true),
    data: z.array(itemSchema),
    meta: PaginationMetaSchema,
  })
}

// ====================== Types ======================

export type IdParams = z.infer<typeof IdParamsSchema>
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>
export type PaginatedResponseSchema<TItem> = {
  success: true
  data: TItem[]
  meta: PaginationMeta
}