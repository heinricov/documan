import { Injectable, UnauthorizedException, ConflictException } from "@nestjs/common"
import { prisma, type User as UserRecord } from "@packages/db"
import {
  NotFoundError,
} from "@packages/core"
import type { User } from "@packages/validator"
import {
  signToken,
  hashPassword,
  verifyPassword,
  type AuthTokenPayload,
} from "@packages/auth"
import type { LoginBody, RegisterBody } from "./auth.validator.js"

/**
 * ============================================================
 *  Auth Service
 * ============================================================
 *
 * Layanan autentikasi: login, register, getMe.
 * Menggunakan @packages/auth untuk JWT signing & password hashing.
 */
@Injectable()
export class AuthService {
  /**
   * Login dengan email + password.
   * Mengembalikan JWT token + user data.
   */
  async login(data: LoginBody): Promise<{ token: string; user: User }> {
    const email = data.email.trim().toLowerCase()

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    })

    if (!user) {
      throw new UnauthorizedException("Email atau password salah.")
    }

    const result = await verifyPassword(user.password, data.password)

    if (!result.ok) {
      throw new UnauthorizedException("Email atau password salah.")
    }

    const token = await signToken({
      sub: user.id,
      userId: user.id,
      role: user.role.title,
    } satisfies AuthTokenPayload)

    return {
      token,
      user: serializeUser(user),
    }
  }

  /**
   * Register user baru.
   * Mengembalikan JWT token + user data.
   */
  async register(data: RegisterBody): Promise<{ token: string; user: User }> {
    const username = data.username.trim()
    const email = data.email.trim().toLowerCase()

    // Cek username unik
    const existingUsername = await prisma.user.findFirst({
      where: { username: { equals: username, mode: "insensitive" } },
    })

    if (existingUsername) {
      throw new ConflictException(`Username "${username}" sudah ada`)
    }

    // Cek email unik
    const existingEmail = await prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
    })

    if (existingEmail) {
      throw new ConflictException(`Email "${email}" sudah terdaftar`)
    }

    // Cek role exists
    const role = await prisma.role.findUnique({ where: { id: data.roleId } })
    if (!role) {
      throw new NotFoundError("Role")
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password)

    // Buat user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        roleId: data.roleId,
      },
      include: { role: true },
    })

    // Sign JWT
    const token = await signToken({
      sub: user.id,
      userId: user.id,
      role: user.role.title,
    } satisfies AuthTokenPayload)

    return {
      token,
      user: serializeUser(user),
    }
  }

  /**
   * Ambil data user berdasarkan ID (dari JWT payload).
   */
  async getMe(userId: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    })

    if (!user) {
      throw new NotFoundError("User")
    }

    return serializeUser(user)
  }
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