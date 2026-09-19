import { Injectable } from "@nestjs/common"
import { prisma, type Partner as PartnerRecord } from "@packages/db"
import {
  ConflictError,
  NotFoundError,
  paginatedResponse,
  parseOffsetPagination,
  toPrismaArgs,
  type PaginatedResponse,
} from "@packages/core"
import type {
  CreatePartner,
  Partner,
  PartnerQuery,
  UpdatePartner,
} from "@packages/validator"

/**
 * ============================================================
 *  Partner Service
 * ============================================================
 *
 * Operasi CRUD partners via Prisma.
 */
@Injectable()
export class PartnerService {
  async findAll(query: PartnerQuery): Promise<PaginatedResponse<Partner>> {
    const { page, limit, offset } = parseOffsetPagination(query)
    const { skip, take } = toPrismaArgs({ page, limit, offset })
    const { id, search, name, type } = query
    const keyword = search ?? name

    const where = {
      ...(id ? { id } : {}),
      ...(type ? { type } : {}),
      ...(keyword
        ? { name: { contains: keyword, mode: "insensitive" as const } }
        : {}),
    }

    const [items, total] = await Promise.all([
      prisma.partner.findMany({
        where,
        skip,
        take,
        orderBy: { name: "asc" },
      }),
      prisma.partner.count({ where }),
    ])

    return paginatedResponse(items.map(serializePartner), { page, limit, total })
  }

  async findById(id: string): Promise<Partner> {
    const partner = await prisma.partner.findUnique({ where: { id } })

    if (!partner) {
      throw new NotFoundError("Partner")
    }

    return serializePartner(partner)
  }

  async create(data: CreatePartner): Promise<Partner> {
    const name = data.name.trim()

    const existing = await prisma.partner.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    })

    if (existing) {
      throw new ConflictError(`Nama "${name}" sudah ada`)
    }

    return serializePartner(
      await prisma.partner.create({
        data: { name, description: data.description, type: data.type },
      })
    )
  }

  async update(id: string, data: UpdatePartner): Promise<Partner> {
    const existing = await prisma.partner.findUnique({ where: { id } })

    if (!existing) {
      throw new NotFoundError("Partner")
    }

    const name = data.name ? data.name.trim() : undefined

    if (name && name !== existing.name) {
      const clash = await prisma.partner.findFirst({
        where: {
          name: { equals: name, mode: "insensitive" },
          id: { not: id },
        },
      })

      if (clash) {
        throw new ConflictError(`Nama "${name}" sudah ada`)
      }
    }

    return serializePartner(
      await prisma.partner.update({
        where: { id },
        data: {
          ...(name ? { name } : {}),
          ...(data.description !== undefined
            ? { description: data.description }
            : {}),
          ...(data.type ? { type: data.type } : {}),
        },
      })
    )
  }

  async remove(id: string): Promise<Partner> {
    const existing = await prisma.partner.findUnique({ where: { id } })

    if (!existing) {
      throw new NotFoundError("Partner")
    }

    return serializePartner(await prisma.partner.delete({ where: { id } }))
  }
}

function serializePartner(partner: PartnerRecord): Partner {
  return {
    id: partner.id,
    name: partner.name,
    description: partner.description,
    type: partner.type,
    createdAt: partner.createdAt.toISOString(),
    updatedAt: partner.updatedAt.toISOString(),
  }
}