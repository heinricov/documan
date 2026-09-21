import { Injectable } from "@nestjs/common"
import { prisma, type DocumentReceiptDetail as DocumentReceiptDetailRecord } from "@packages/db"
import {
  NotFoundError,
  paginatedResponse,
  parseOffsetPagination,
  toPrismaArgs,
  type PaginatedResponse,
} from "@packages/core"
import type {
  CreateDocumentReceiptDetail,
  DocumentReceiptDetail,
  DocumentReceiptDetailQuery,
  UpdateDocumentReceiptDetail,
} from "@packages/validator"

/**
 * ============================================================
 *  DocumentReceiptDetail Service
 * ============================================================
 *
 * Operasi CRUD document receipt details via Prisma.
 */
@Injectable()
export class DocumentReceiptDetailService {
  async findAll(query: DocumentReceiptDetailQuery): Promise<PaginatedResponse<DocumentReceiptDetail>> {
    const { page, limit, offset } = parseOffsetPagination(query)
    const { skip, take } = toPrismaArgs({ page, limit, offset })
    const { id, search, documentReceiptId, docTypeId, subsidiaryId, partnerId } = query

    const where = {
      ...(id ? { id } : {}),
      ...(search
        ? {
            OR: [
              { nomorDoc: { contains: search, mode: "insensitive" as const } },
              { nomorFaktur: { contains: search, mode: "insensitive" as const } },
              { nomorPl: { contains: search, mode: "insensitive" as const } },
              { nomorDo: { contains: search, mode: "insensitive" as const } },
              { nomorInv: { contains: search, mode: "insensitive" as const } },
              { nomorPv: { contains: search, mode: "insensitive" as const } },
              { nomorNota: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(documentReceiptId ? { documentReceiptId } : {}),
      ...(docTypeId ? { docTypeId } : {}),
      ...(subsidiaryId ? { subsidiaryId } : {}),
      ...(partnerId ? { partnerId } : {}),
    }

    const [items, total] = await Promise.all([
      prisma.documentReceiptDetail.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          documentReceipt: { select: { id: true, title: true } },
          docType: { select: { id: true, title: true } },
          subsidiary: { select: { id: true, title: true } },
          partner: { select: { id: true, name: true } },
        },
      }),
      prisma.documentReceiptDetail.count({ where }),
    ])

    return paginatedResponse(items.map(serializeDocumentReceiptDetail), { page, limit, total })
  }

  async findById(id: string): Promise<DocumentReceiptDetail> {
    const item = await prisma.documentReceiptDetail.findUnique({
      where: { id },
      include: {
        documentReceipt: { select: { id: true, title: true } },
        docType: { select: { id: true, title: true } },
        subsidiary: { select: { id: true, title: true } },
        partner: { select: { id: true, name: true } },
      },
    })

    if (!item) {
      throw new NotFoundError("Document Receipt Detail")
    }

    return serializeDocumentReceiptDetail(item)
  }

  async create(data: CreateDocumentReceiptDetail): Promise<DocumentReceiptDetail> {
    return serializeDocumentReceiptDetail(
      await prisma.documentReceiptDetail.create({
        data: {
          documentReceiptId: data.documentReceiptId,
          docTypeId: data.docTypeId,
          subsidiaryId: data.subsidiaryId,
          partnerId: data.partnerId,
          nomorDoc: data.nomorDoc,
          nomorFaktur: data.nomorFaktur,
          nomorPl: data.nomorPl,
          nomorDo: data.nomorDo,
          nomorInv: data.nomorInv,
          nomorPv: data.nomorPv,
          nomorNota: data.nomorNota,
          description: data.description,
        },
        include: {
          documentReceipt: { select: { id: true, title: true } },
          docType: { select: { id: true, title: true } },
          subsidiary: { select: { id: true, title: true } },
          partner: { select: { id: true, name: true } },
        },
      })
    )
  }

  async update(id: string, data: UpdateDocumentReceiptDetail): Promise<DocumentReceiptDetail> {
    const existing = await prisma.documentReceiptDetail.findUnique({ where: { id } })

    if (!existing) {
      throw new NotFoundError("Document Receipt Detail")
    }

    return serializeDocumentReceiptDetail(
      await prisma.documentReceiptDetail.update({
        where: { id },
        data: {
          ...(data.documentReceiptId !== undefined ? { documentReceiptId: data.documentReceiptId } : {}),
          ...(data.docTypeId !== undefined ? { docTypeId: data.docTypeId } : {}),
          ...(data.subsidiaryId !== undefined ? { subsidiaryId: data.subsidiaryId } : {}),
          ...(data.partnerId !== undefined ? { partnerId: data.partnerId } : {}),
          ...(data.nomorDoc !== undefined ? { nomorDoc: data.nomorDoc } : {}),
          ...(data.nomorFaktur !== undefined ? { nomorFaktur: data.nomorFaktur } : {}),
          ...(data.nomorPl !== undefined ? { nomorPl: data.nomorPl } : {}),
          ...(data.nomorDo !== undefined ? { nomorDo: data.nomorDo } : {}),
          ...(data.nomorInv !== undefined ? { nomorInv: data.nomorInv } : {}),
          ...(data.nomorPv !== undefined ? { nomorPv: data.nomorPv } : {}),
          ...(data.nomorNota !== undefined ? { nomorNota: data.nomorNota } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
        },
        include: {
          documentReceipt: { select: { id: true, title: true } },
          docType: { select: { id: true, title: true } },
          subsidiary: { select: { id: true, title: true } },
          partner: { select: { id: true, name: true } },
        },
      })
    )
  }

  async remove(id: string): Promise<DocumentReceiptDetail> {
    const existing = await prisma.documentReceiptDetail.findUnique({ where: { id } })

    if (!existing) {
      throw new NotFoundError("Document Receipt Detail")
    }

    return serializeDocumentReceiptDetail(
      await prisma.documentReceiptDetail.delete({
        where: { id },
        include: {
          documentReceipt: { select: { id: true, title: true } },
          docType: { select: { id: true, title: true } },
          subsidiary: { select: { id: true, title: true } },
          partner: { select: { id: true, name: true } },
        },
      })
    )
  }
}

function serializeDocumentReceiptDetail(
  item: DocumentReceiptDetailRecord & {
    documentReceipt: { id: string; title: string }
    docType: { id: string; title: string }
    subsidiary: { id: string; title: string }
    partner: { id: string; name: string }
  }
): DocumentReceiptDetail {
  return {
    id: item.id,
    documentReceiptId: item.documentReceiptId,
    docTypeId: item.docTypeId,
    subsidiaryId: item.subsidiaryId,
    partnerId: item.partnerId,
    nomorDoc: item.nomorDoc,
    nomorFaktur: item.nomorFaktur,
    nomorPl: item.nomorPl,
    nomorDo: item.nomorDo,
    nomorInv: item.nomorInv,
    nomorPv: item.nomorPv,
    nomorNota: item.nomorNota,
    description: item.description,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }
}
