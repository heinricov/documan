import { Injectable } from "@nestjs/common"
import { prisma, type DocumentReceipt as DocumentReceiptRecord } from "@packages/db"
import {
  NotFoundError,
  paginatedResponse,
  parseOffsetPagination,
  toPrismaArgs,
  type PaginatedResponse,
} from "@packages/core"
import type {
  CreateDocumentReceipt,
  DocumentReceipt,
  DocumentReceiptQuery,
  UpdateDocumentReceipt,
} from "@packages/validator"

/**
 * ============================================================
 *  DocumentReceipt Service
 * ============================================================
 *
 * Operasi CRUD document receipts via Prisma.
 */
@Injectable()
export class DocumentReceiptService {
  async findAll(query: DocumentReceiptQuery): Promise<PaginatedResponse<DocumentReceipt>> {
    const { page, limit, offset } = parseOffsetPagination(query)
    const { skip, take } = toPrismaArgs({ page, limit, offset })
    const { id, search, userId, docTypeId, boxId } = query

    const where = {
      ...(id ? { id } : {}),
      ...(search
        ? { title: { contains: search, mode: "insensitive" as const } }
        : {}),
      ...(userId ? { userId } : {}),
      ...(docTypeId ? { docTypeId } : {}),
      ...(boxId ? { boxId } : {}),
    }

    const [items, total] = await Promise.all([
      prisma.documentReceipt.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, username: true } },
          docType: { select: { id: true, title: true } },
          box: { select: { id: true, noBox: true } },
        },
      }),
      prisma.documentReceipt.count({ where }),
    ])

    return paginatedResponse(items.map(serializeDocumentReceipt), { page, limit, total })
  }

  async findById(id: string): Promise<DocumentReceipt> {
    const item = await prisma.documentReceipt.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true } },
        docType: { select: { id: true, title: true } },
        box: { select: { id: true, noBox: true } },
      },
    })

    if (!item) {
      throw new NotFoundError("Document Receipt")
    }

    return serializeDocumentReceipt(item)
  }

  async create(data: CreateDocumentReceipt & { userId: string }): Promise<DocumentReceipt> {
    return serializeDocumentReceipt(
      await prisma.documentReceipt.create({
        data: {
          title: data.title.trim(),
          description: data.description,
          userId: data.userId,
          docTypeId: data.docTypeId,
          boxId: data.boxId,
        },
        include: {
          user: { select: { id: true, username: true } },
          docType: { select: { id: true, title: true } },
          box: { select: { id: true, noBox: true } },
        },
      })
    )
  }

  async update(id: string, data: UpdateDocumentReceipt): Promise<DocumentReceipt> {
    const existing = await prisma.documentReceipt.findUnique({ where: { id } })

    if (!existing) {
      throw new NotFoundError("Document Receipt")
    }

    return serializeDocumentReceipt(
      await prisma.documentReceipt.update({
        where: { id },
        data: {
          ...(data.title !== undefined ? { title: data.title.trim() } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.userId !== undefined ? { userId: data.userId } : {}),
          ...(data.docTypeId !== undefined ? { docTypeId: data.docTypeId } : {}),
          ...(data.boxId !== undefined ? { boxId: data.boxId } : {}),
        },
        include: {
          user: { select: { id: true, username: true } },
          docType: { select: { id: true, title: true } },
          box: { select: { id: true, noBox: true } },
        },
      })
    )
  }

  async remove(id: string): Promise<DocumentReceipt> {
    const existing = await prisma.documentReceipt.findUnique({ where: { id } })

    if (!existing) {
      throw new NotFoundError("Document Receipt")
    }

    return serializeDocumentReceipt(
      await prisma.documentReceipt.delete({
        where: { id },
        include: {
          user: { select: { id: true, username: true } },
          docType: { select: { id: true, title: true } },
          box: { select: { id: true, noBox: true } },
        },
      })
    )
  }
}

function serializeDocumentReceipt(
  item: DocumentReceiptRecord & {
    user: { id: string; username: string }
    docType: { id: string; title: string }
    box: { id: string; noBox: string }
  }
): DocumentReceipt {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    userId: item.userId,
    docTypeId: item.docTypeId,
    boxId: item.boxId,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }
}
