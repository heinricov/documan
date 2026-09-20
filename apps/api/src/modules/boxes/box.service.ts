import { Injectable } from "@nestjs/common"
import { prisma, type Box as BoxRecord } from "@packages/db"
import {
  ConflictError,
  NotFoundError,
  paginatedResponse,
  parseOffsetPagination,
  toPrismaArgs,
  type PaginatedResponse,
} from "@packages/core"
import type {
  CreateBox,
  Box,
  BoxQuery,
  UpdateBox,
} from "@packages/validator"

/**
 * ============================================================
 *  Box Service
 * ============================================================
 *
 * Operasi CRUD boxes via Prisma.
 */
@Injectable()
export class BoxService {
  async findAll(query: BoxQuery): Promise<PaginatedResponse<Box>> {
    const { page, limit, offset } = parseOffsetPagination(query)
    const { skip, take } = toPrismaArgs({ page, limit, offset })
    const { id, search, noBox } = query
    const keyword = search ?? noBox

    const where = {
      ...(id ? { id } : {}),
      ...(keyword
        ? { noBox: { contains: keyword, mode: "insensitive" as const } }
        : {}),
    }

    const [items, total] = await Promise.all([
      prisma.box.findMany({
        where,
        skip,
        take,
        orderBy: { noBox: "asc" },
      }),
      prisma.box.count({ where }),
    ])

    return paginatedResponse(items.map(serializeBox), { page, limit, total })
  }

  async findById(id: string): Promise<Box> {
    const box = await prisma.box.findUnique({ where: { id } })

    if (!box) {
      throw new NotFoundError("Box")
    }

    return serializeBox(box)
  }

  async create(data: CreateBox): Promise<Box> {
    const noBox = data.noBox.trim()

    const existing = await prisma.box.findFirst({
      where: { noBox: { equals: noBox, mode: "insensitive" } },
    })

    if (existing) {
      throw new ConflictError(`Nomor box "${noBox}" sudah ada`)
    }

    return serializeBox(
      await prisma.box.create({
        data: { noBox, title: data.title, description: data.description },
      })
    )
  }

  async update(id: string, data: UpdateBox): Promise<Box> {
    const existing = await prisma.box.findUnique({ where: { id } })

    if (!existing) {
      throw new NotFoundError("Box")
    }

    const noBox = data.noBox ? data.noBox.trim() : undefined

    if (noBox && noBox !== existing.noBox) {
      const clash = await prisma.box.findFirst({
        where: {
          noBox: { equals: noBox, mode: "insensitive" },
          id: { not: id },
        },
      })

      if (clash) {
        throw new ConflictError(`Nomor box "${noBox}" sudah ada`)
      }
    }

    return serializeBox(
      await prisma.box.update({
        where: { id },
        data: {
          ...(noBox ? { noBox } : {}),
          ...(data.title !== undefined ? { title: data.title } : {}),
          ...(data.description !== undefined
            ? { description: data.description }
            : {}),
        },
      })
    )
  }

  async remove(id: string): Promise<Box> {
    const existing = await prisma.box.findUnique({ where: { id } })

    if (!existing) {
      throw new NotFoundError("Box")
    }

    return serializeBox(await prisma.box.delete({ where: { id } }))
  }
}

function serializeBox(box: BoxRecord): Box {
  return {
    id: box.id,
    noBox: box.noBox,
    title: box.title,
    description: box.description,
    createdAt: box.createdAt.toISOString(),
    updatedAt: box.updatedAt.toISOString(),
  }
}