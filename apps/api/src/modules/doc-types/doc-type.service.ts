import { Injectable } from "@nestjs/common"
import { prisma, type DocType as DocTypeRecord } from "@packages/db"
import {
  ConflictError,
  NotFoundError,
  paginatedResponse,
  parseOffsetPagination,
  toPrismaArgs,
  type PaginatedResponse,
} from "@packages/core"
import type {
  CreateDocType,
  DocType,
  DocTypeQuery,
  UpdateDocType,
} from "@packages/validator"

/**
 * ============================================================
 *  DocType Service
 * ============================================================
 *
 * Operasi CRUD doc types via Prisma.
 */
@Injectable()
export class DocTypeService {
  async findAll(query: DocTypeQuery): Promise<PaginatedResponse<DocType>> {
    const { page, limit, offset } = parseOffsetPagination(query)
    const { skip, take } = toPrismaArgs({ page, limit, offset })
    const { id, search, title } = query
    const keyword = search ?? title

    const where = {
      ...(id ? { id } : {}),
      ...(keyword
        ? { title: { contains: keyword, mode: "insensitive" as const } }
        : {}),
    }

    const [items, total] = await Promise.all([
      prisma.docType.findMany({
        where,
        skip,
        take,
        orderBy: { title: "asc" },
      }),
      prisma.docType.count({ where }),
    ])

    return paginatedResponse(items.map(serializeDocType), { page, limit, total })
  }

  async findById(id: string): Promise<DocType> {
    const docType = await prisma.docType.findUnique({ where: { id } })

    if (!docType) {
      throw new NotFoundError("DocType")
    }

    return serializeDocType(docType)
  }

  async create(data: CreateDocType): Promise<DocType> {
    const title = data.title.trim()

    const existing = await prisma.docType.findFirst({
      where: { title: { equals: title, mode: "insensitive" } },
    })

    if (existing) {
      throw new ConflictError(`Title "${title}" sudah ada`)
    }

    return serializeDocType(
      await prisma.docType.create({
        data: { title, description: data.description },
      })
    )
  }

  async update(id: string, data: UpdateDocType): Promise<DocType> {
    const existing = await prisma.docType.findUnique({ where: { id } })

    if (!existing) {
      throw new NotFoundError("DocType")
    }

    const title = data.title ? data.title.trim() : undefined

    if (title && title !== existing.title) {
      const clash = await prisma.docType.findFirst({
        where: {
          title: { equals: title, mode: "insensitive" },
          id: { not: id },
        },
      })

      if (clash) {
        throw new ConflictError(`Title "${title}" sudah ada`)
      }
    }

    return serializeDocType(
      await prisma.docType.update({
        where: { id },
        data: {
          ...(title ? { title } : {}),
          ...(data.description !== undefined
            ? { description: data.description }
            : {}),
        },
      })
    )
  }

  async remove(id: string): Promise<DocType> {
    const existing = await prisma.docType.findUnique({ where: { id } })

    if (!existing) {
      throw new NotFoundError("DocType")
    }

    return serializeDocType(await prisma.docType.delete({ where: { id } }))
  }
}

function serializeDocType(docType: DocTypeRecord): DocType {
  return {
    id: docType.id,
    title: docType.title,
    description: docType.description,
    createdAt: docType.createdAt.toISOString(),
    updatedAt: docType.updatedAt.toISOString(),
  }
}