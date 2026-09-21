import { z } from "zod"

export const DocumentReceiptSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable().optional(),
  userId: z.string().uuid(),
  docTypeId: z.string().uuid(),
  boxId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const CreateDocumentReceiptSchema = z.object({
  title: z.string().min(1, "Title wajib diisi").max(200),
  description: z.string().nullable().optional(),
  docTypeId: z.string().uuid("Doc Type ID tidak valid"),
  boxId: z.string().uuid("Box ID tidak valid"),
})

export const UpdateDocumentReceiptSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().nullable().optional(),
  userId: z.string().uuid().optional(),
  docTypeId: z.string().uuid().optional(),
  boxId: z.string().uuid().optional(),
})

export const DocumentReceiptQuerySchema = z.object({
  id: z.string().uuid().optional(),
  search: z.string().optional(),
  userId: z.string().uuid().optional(),
  docTypeId: z.string().uuid().optional(),
  boxId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
})

export type DocumentReceipt = z.infer<typeof DocumentReceiptSchema>
export type CreateDocumentReceipt = z.infer<typeof CreateDocumentReceiptSchema>
export type UpdateDocumentReceipt = z.infer<typeof UpdateDocumentReceiptSchema>
export type DocumentReceiptQuery = z.infer<typeof DocumentReceiptQuerySchema>
