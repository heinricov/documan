import { Injectable } from "@nestjs/common"
import { prisma, type Role as RoleRecord } from "@packages/db"
import {
  ConflictError,
  NotFoundError,
  paginatedResponse,
  parseOffsetPagination,
  toPrismaArgs,
  type PaginatedResponse,
} from "@packages/core"
import type {
  CreateRole,
  Role,
  RoleQuery,
  UpdateRole,
} from "@packages/validator"

/**
 * ============================================================
 *  Role Service
 * ============================================================
 *
 * Operasi CRUD roles via Prisma. Error memakai AppError dari
 * @packages/core agar filter global menghasilkan format standar.
 *
 * catatan:
 * - `title` dinormalisasi (trim) dan keunikan dicek case-insensitive
 *   (App-level; DB unique tetap case-sensitive).
 * - `createdAt`/`updatedAt` diserialisasi ke ISO string via serializeRole.
 */
@Injectable()
export class RoleService {
  async findAll(query: RoleQuery): Promise<PaginatedResponse<Role>> {
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
      prisma.role.findMany({
        where,
        skip,
        take,
        orderBy: { title: "asc" },
        include: { _count: { select: { users: true } } },
      }),
      prisma.role.count({ where }),
    ])

    return paginatedResponse(items.map(serializeRole), { page, limit, total })
  }

  async findById(id: string): Promise<Role> {
    const role = await prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    })

    if (!role) {
      throw new NotFoundError("Role")
    }

    return serializeRole(role)
  }

  async create(data: CreateRole): Promise<Role> {
    const title = normalizeTitle(data.title)

    const existing = await prisma.role.findFirst({
      where: { title: { equals: title, mode: "insensitive" } },
    })

    if (existing) {
      throw new ConflictError(`Role "${title}" sudah ada`)
    }

    return serializeRole(
      await prisma.role.create({
        data: { title, description: data.description },
        include: { _count: { select: { users: true } } },
      })
    )
  }

  async update(id: string, data: UpdateRole): Promise<Role> {
    const existing = await prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    })

    if (!existing) {
      throw new NotFoundError("Role")
    }

    const title = data.title ? normalizeTitle(data.title) : undefined

    if (title && title !== existing.title) {
      const clash = await prisma.role.findFirst({
        where: {
          title: { equals: title, mode: "insensitive" },
          id: { not: id },
        },
      })

      if (clash) {
        throw new ConflictError(`Role "${title}" sudah ada`)
      }
    }

    return serializeRole(
      await prisma.role.update({
        where: { id },
        data: {
          ...(title ? { title } : {}),
          ...(data.description !== undefined
            ? { description: data.description }
            : {}),
        },
        include: { _count: { select: { users: true } } },
      })
    )
  }

  async remove(id: string): Promise<Role> {
    const existing = await prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    })

    if (!existing) {
      throw new NotFoundError("Role")
    }

    return serializeRole(await prisma.role.delete({ where: { id } }))
  }
}

function normalizeTitle(title: string): string {
  return title.trim()
}

function serializeRole(role: RoleRecord & { _count?: { users: number } }): Role {
  return {
    id: role.id,
    title: role.title,
    description: role.description,
    userCount: role._count?.users ?? 0,
    createdAt: role.createdAt.toISOString(),
    updatedAt: role.updatedAt.toISOString(),
  }
}