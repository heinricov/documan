import { z } from "zod"

export const DocumentReceiptDetailSchema = z.object({
  id: z.string().uuid(),
  documentReceiptId: z.string().uuid(),
  subsidiaryId: z.string().uuid(),
  partnerId: z.string().uuid(),
  nomorDoc: z.string().nullable().optional(),
  nomorFaktur: z.string().nullable().optional(),
  nomorPl: z.string().nullable().optional(),
  nomorDo: z.string().nullable().optional(),
  nomorInv: z.string().nullable().optional(),
  nomorPv: z.string().nullable().optional(),
  nomorNota: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const CreateDocumentReceiptDetailSchema = z.object({
  documentReceiptId: z.string().uuid("Document Receipt ID tidak valid"),
  subsidiaryId: z.string().uuid("Subsidiary ID tidak valid"),
  partnerId: z.string().uuid("Partner ID tidak valid"),
  nomorDoc: z.string().nullable().optional(),
  nomorFaktur: z.string().nullable().optional(),
  nomorPl: z.string().nullable().optional(),
  nomorDo: z.string().nullable().optional(),
  nomorInv: z.string().nullable().optional(),
  nomorPv: z.string().nullable().optional(),
  nomorNota: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
})

export const UpdateDocumentReceiptDetailSchema = z.object({
  documentReceiptId: z.string().uuid().optional(),
  subsidiaryId: z.string().uuid().optional(),
  partnerId: z.string().uuid().optional(),
  nomorDoc: z.string().nullable().optional(),
  nomorFaktur: z.string().nullable().optional(),
  nomorPl: z.string().nullable().optional(),
  nomorDo: z.string().nullable().optional(),
  nomorInv: z.string().nullable().optional(),
  nomorPv: z.string().nullable().optional(),
  nomorNota: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
})

export const DocumentReceiptDetailQuerySchema = z.object({
  id: z.string().uuid().optional(),
  search: z.string().optional(),
  documentReceiptId: z.string().uuid().optional(),
  subsidiaryId: z.string().uuid().optional(),
  partnerId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
})

export type DocumentReceiptDetail = z.infer<typeof DocumentReceiptDetailSchema>
export type CreateDocumentReceiptDetail = z.infer<typeof CreateDocumentReceiptDetailSchema>
export type UpdateDocumentReceiptDetail = z.infer<typeof UpdateDocumentReceiptDetailSchema>
export type DocumentReceiptDetailQuery = z.infer<typeof DocumentReceiptDetailQuerySchema>
