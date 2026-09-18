import { Injectable } from "@nestjs/common"
import { prisma, type User as UserRecord } from "@packages/db"
import {
  ConflictError,
  NotFoundError,
  paginatedResponse,
  parseOffsetPagination,
  toPrismaArgs,
  type PaginatedResponse,
} from "@packages/core"
import type {
  CreateUser,
  User,
  UserQuery,
  UpdateUser,
} from "@packages/validator"
import { hashPassword } from "@packages/auth"

/**
 * ============================================================
 *  User Service
 * ============================================================
 *
 * Operasi CRUD users via Prisma. Error memakai AppError dari
 * @packages/core agar filter global menghasilkan format standar.
 *
 * catatan:
 * - `username` dinormalisasi (trim) dan keunikan dicek case-insensitive
 *   (App-level; DB unique tetap case-sensitive).
 * - `email` dinormalisasi (trim + lowercase) dan keunikan dicek.
 * - `password` di-hash dengan Argon2id via @packages/auth sebelum disimpan.
 * - `createdAt`/`updatedAt` diserialisasi ke ISO string via serializeUser.
 */
@Injectable()
export class UserService {
  async findAll(query: UserQuery): Promise<PaginatedResponse<User>> {
    const { page, limit, offset } = parseOffsetPagination(query)
    const { skip, take } = toPrismaArgs({ page, limit, offset })
    const { id, search, username, email, roleId } = query
    const keyword = search ?? username

    const where = {
      ...(id ? { id } : {}),
      ...(roleId ? { roleId } : {}),
      ...(email ? { email: { equals: email, mode: "insensitive" as const } } : {}),
      ...(keyword
        ? { username: { contains: keyword, mode: "insensitive" as const } }
        : {}),
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { username: "asc" },
        include: { role: true },
      }),
      prisma.user.count({ where }),
    ])

    return paginatedResponse(items.map(serializeUser), { page, limit, total })
  }

  async findById(id: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: true },
    })

    if (!user) {
      throw new NotFoundError("User")
    }

    return serializeUser(user)
  }

  async create(data: CreateUser): Promise<User> {
    const username = normalizeUsername(data.username)
    const email = normalizeEmail(data.email)

    const existingUsername = await prisma.user.findFirst({
      where: { username: { equals: username, mode: "insensitive" } },
    })

    if (existingUsername) {
      throw new ConflictError(`Username "${username}" sudah ada`)
    }

    const existingEmail = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    })

    if (existingEmail) {
      throw new ConflictError(`Email "${email}" sudah ada`)
    }

    const role = await prisma.role.findUnique({ where: { id: data.roleId } })
    if (!role) {
      throw new NotFoundError("Role")
    }

    const hashedPassword = await hashPassword(data.password)

    return serializeUser(
      await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          roleId: data.roleId,
        },
        include: { role: true },
      })
    )
  }

  async update(id: string, data: UpdateUser): Promise<User> {
    const existing = await prisma.user.findUnique({ where: { id } })

    if (!existing) {
      throw new NotFoundError("User")
    }

    const username = data.username ? normalizeUsername(data.username) : undefined
    const email = data.email ? normalizeEmail(data.email) : undefined

    if (username && username !== existing.username) {
      const clash = await prisma.user.findFirst({
        where: {
          username: { equals: username, mode: "insensitive" },
          id: { not: id },
        },
      })

      if (clash) {
        throw new ConflictError(`Username "${username}" sudah ada`)
      }
    }

    if (email && email !== existing.email) {
      const clash = await prisma.user.findFirst({
        where: {
          email: { equals: email, mode: "insensitive" },
          id: { not: id },
        },
      })

      if (clash) {
        throw new ConflictError(`Email "${email}" sudah ada`)
      }
    }

    if (data.roleId) {
      const role = await prisma.role.findUnique({ where: { id: data.roleId } })
      if (!role) {
        throw new NotFoundError("Role")
      }
    }

    const hashedPassword = data.password ? await hashPassword(data.password) : undefined

    return serializeUser(
      await prisma.user.update({
        where: { id },
        data: {
          ...(username ? { username } : {}),
          ...(email ? { email } : {}),
          ...(hashedPassword ? { password: hashedPassword } : {}),
          ...(data.roleId ? { roleId: data.roleId } : {}),
        },
        include: { role: true },
      })
    )
  }

  async remove(id: string): Promise<User> {
    const existing = await prisma.user.findUnique({
      where: { id },
      include: { role: true },
    })

    if (!existing) {
      throw new NotFoundError("User")
    }

    return serializeUser(await prisma.user.delete({ where: { id }, include: { role: true } }))
  }
}

function normalizeUsername(username: string): string {
  return username.trim()
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function serializeUser(user: UserRecord & { role: { id: string; title: string; description: string | null } }): User {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    roleId: user.roleId,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}
