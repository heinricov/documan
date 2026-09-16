import { Injectable } from "@nestjs/common"
import { prisma } from "@packages/db"
import {
  ConflictError,
  NotFoundError,
  paginatedResponse,
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
 */
@Injectable()
export class RoleService {
  async findAll(query: RoleQuery): Promise<PaginatedResponse<Role>> {
    const { page, limit, id, search, title } = query
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
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { title: "asc" },
      }),
      prisma.role.count({ where }),
    ])

    return paginatedResponse(items, { page, limit, total })
  }

  async findById(id: string): Promise<Role> {
    const role = await prisma.role.findUnique({ where: { id } })

    if (!role) {
      throw new NotFoundError("Role")
    }

    return role
  }

  async create(data: CreateRole): Promise<Role> {
    const existing = await prisma.role.findUnique({
      where: { title: data.title },
    })

    if (existing) {
      throw new ConflictError(`Role "${data.title}" sudah ada`)
    }

    return prisma.role.create({ data })
  }

  async update(id: string, data: UpdateRole): Promise<Role> {
    const existing = await prisma.role.findUnique({ where: { id } })

    if (!existing) {
      throw new NotFoundError("Role")
    }

    if (data.title && data.title !== existing.title) {
      const clash = await prisma.role.findUnique({
        where: { title: data.title },
      })

      if (clash) {
        throw new ConflictError(`Role "${data.title}" sudah ada`)
      }
    }

    return prisma.role.update({ where: { id }, data })
  }

  async remove(id: string): Promise<Role> {
    const existing = await prisma.role.findUnique({ where: { id } })

    if (!existing) {
      throw new NotFoundError("Role")
    }

    return prisma.role.delete({ where: { id } })
  }
}