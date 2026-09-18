import { Injectable } from "@nestjs/common"
import { prisma, type Subsidiary as SubsidiaryRecord } from "@packages/db"
import {
  ConflictError,
  NotFoundError,
  paginatedResponse,
  parseOffsetPagination,
  toPrismaArgs,
  type PaginatedResponse,
} from "@packages/core"
import type {
  CreateSubsidiary,
  Subsidiary,
  SubsidiaryQuery,
  UpdateSubsidiary,
} from "@packages/validator"

/**
 * ============================================================
 *  Subsidiary Service
 * ============================================================
 *
 * Operasi CRUD subsidiaries via Prisma. Error memakai AppError dari
 * @packages/core agar filter global menghasilkan format standar.
 *
 * catatan:
 * - `title` dinormalisasi (trim) dan keunikan dicek case-insensitive
 *   (App-level; DB unique tetap case-sensitive).
 * - `name` dinormalisasi (trim) dan keunikan dicek case-insensitive.
 * - `createdAt`/`updatedAt` diserialisasi ke ISO string via serializeSubsidiary.
 */
@Injectable()
export class SubsidiaryService {
  async findAll(query: SubsidiaryQuery): Promise<PaginatedResponse<Subsidiary>> {
    const { page, limit, offset } = parseOffsetPagination(query)
    const { skip, take } = toPrismaArgs({ page, limit, offset })
    const { id, search, title, name } = query
    const keyword = search ?? title

    const where = {
      ...(id ? { id } : {}),
      ...(name ? { name: { contains: name, mode: "insensitive" as const } } : {}),
      ...(keyword
        ? { OR: [
            { title: { contains: keyword, mode: "insensitive" as const } },
            { name: { contains: keyword, mode: "insensitive" as const } },
          ]}
        : {}),
    }

    const [items, total] = await Promise.all([
      prisma.subsidiary.findMany({
        where,
        skip,
        take,
        orderBy: { title: "asc" },
      }),
      prisma.subsidiary.count({ where }),
    ])

    return paginatedResponse(items.map(serializeSubsidiary), { page, limit, total })
  }

  async findById(id: string): Promise<Subsidiary> {
    const subsidiary = await prisma.subsidiary.findUnique({ where: { id } })

    if (!subsidiary) {
      throw new NotFoundError("Subsidiary")
    }

    return serializeSubsidiary(subsidiary)
  }

  async create(data: CreateSubsidiary): Promise<Subsidiary> {
    const title = normalizeTitle(data.title)
    const name = normalizeName(data.name)

    const existingTitle = await prisma.subsidiary.findFirst({
      where: { title: { equals: title, mode: "insensitive" } },
    })

    if (existingTitle) {
      throw new ConflictError(`Title "${title}" sudah ada`)
    }

    const existingName = await prisma.subsidiary.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    })

    if (existingName) {
      throw new ConflictError(`Nama "${name}" sudah ada`)
    }

    return serializeSubsidiary(
      await prisma.subsidiary.create({
        data: { title, name, logo: data.logo },
      })
    )
  }

  async update(id: string, data: UpdateSubsidiary): Promise<Subsidiary> {
    const existing = await prisma.subsidiary.findUnique({ where: { id } })

    if (!existing) {
      throw new NotFoundError("Subsidiary")
    }

    const title = data.title ? normalizeTitle(data.title) : undefined
    const name = data.name ? normalizeName(data.name) : undefined

    if (title && title !== existing.title) {
      const clash = await prisma.subsidiary.findFirst({
        where: {
          title: { equals: title, mode: "insensitive" },
          id: { not: id },
        },
      })

      if (clash) {
        throw new ConflictError(`Title "${title}" sudah ada`)
      }
    }

    if (name && name !== existing.name) {
      const clash = await prisma.subsidiary.findFirst({
        where: {
          name: { equals: name, mode: "insensitive" },
          id: { not: id },
        },
      })

      if (clash) {
        throw new ConflictError(`Nama "${name}" sudah ada`)
      }
    }

    return serializeSubsidiary(
      await prisma.subsidiary.update({
        where: { id },
        data: {
          ...(title ? { title } : {}),
          ...(name ? { name } : {}),
          ...(data.logo !== undefined ? { logo: data.logo } : {}),
        },
      })
    )
  }

  async remove(id: string): Promise<Subsidiary> {
    const existing = await prisma.subsidiary.findUnique({ where: { id } })

    if (!existing) {
      throw new NotFoundError("Subsidiary")
    }

    return serializeSubsidiary(await prisma.subsidiary.delete({ where: { id } }))
  }
}

function normalizeTitle(title: string): string {
  return title.trim()
}

function normalizeName(name: string): string {
  return name.trim()
}

function serializeSubsidiary(subsidiary: SubsidiaryRecord): Subsidiary {
  return {
    id: subsidiary.id,
    title: subsidiary.title,
    name: subsidiary.name,
    logo: subsidiary.logo,
    createdAt: subsidiary.createdAt.toISOString(),
    updatedAt: subsidiary.updatedAt.toISOString(),
  }
}