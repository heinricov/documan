import { Injectable, UnauthorizedException } from "@nestjs/common"
import { randomBytes } from "crypto"
import { prisma, type User as UserRecord } from "@packages/db"
import {
  NotFoundError,
} from "@packages/core"
import type { User } from "@packages/validator"
import {
  signToken,
  signRefreshToken,
  verifyPassword,
  type AuthTokenPayload,
} from "@packages/auth"
import type { LoginBody } from "./auth.validator.js"

/**
 * ============================================================
 *  Auth Service
 * ============================================================
 *
 * Layanan autentikasi: login, getMe, refresh, logout.
 * Menggunakan @packages/auth untuk JWT signing & password verification.
 *
 * User baru dibuat oleh admin via UserService.create().
 */
@Injectable()
export class AuthService {
  /**
   * Login dengan email + password.
   * Mengembalikan access token + user data.
   * Refresh token diset sebagai HttpOnly cookie via controller.
   */
  async login(data: LoginBody): Promise<{ accessToken: string; user: User }> {
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

    const accessToken = await signToken({
      sub: user.id,
      userId: user.id,
      role: user.role.title,
    } satisfies AuthTokenPayload)

    // Generate refresh token
    const refreshToken = await this.generateRefreshToken(user.id)

    return {
      accessToken,
      user: serializeUser(user),
    }
  }

  /**
   * Generate refresh token, store in DB, return plain token.
   */
  async generateRefreshToken(userId: string): Promise<string> {
    const plainToken = randomBytes(64).toString("hex")
    const hashedToken = await this.hashToken(plainToken)
    const expiresAt = new Date(Date.now() + this.getRefreshTokenExpiryMs())

    await prisma.refreshToken.create({
      data: {
        userId,
        token: hashedToken,
        expiresAt,
      },
    })

    return plainToken
  }

  /**
   * Validate refresh token from cookie, return userId if valid.
   */
  async validateRefreshToken(plainToken: string): Promise<string | null> {
    const hashedToken = await this.hashToken(plainToken)

    const stored = await prisma.refreshToken.findUnique({
      where: { token: hashedToken },
    })

    if (!stored) {
      return null
    }

    if (stored.expiresAt < new Date()) {
      // Expired - delete it
      await prisma.refreshToken.delete({ where: { id: stored.id } })
      return null
    }

    return stored.userId
  }

  /**
   * Remove refresh token from DB (logout).
   */
  async removeRefreshToken(plainToken: string): Promise<void> {
    const hashedToken = await this.hashToken(plainToken)
    await prisma.refreshToken.deleteMany({ where: { token: hashedToken } })
  }

  /**
   * Remove all refresh tokens for a user (logout all devices).
   */
  async removeAllRefreshTokens(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { userId } })
  }

  /**
   * Refresh access token using refresh token.
   */
  async refresh(plainRefreshToken: string): Promise<string | null> {
    const userId = await this.validateRefreshToken(plainRefreshToken)

    if (!userId) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    })

    if (!user) {
      return null
    }

    // Rotate refresh token: delete old, create new
    await this.removeRefreshToken(plainRefreshToken)
    await this.generateRefreshToken(userId)

    // Issue new access token
    return signToken({
      sub: user.id,
      userId: user.id,
      role: user.role.title,
    } satisfies AuthTokenPayload)
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

  /**
   * Hash token for storage (SHA-256).
   */
  private async hashToken(token: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(token)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  }

  /**
   * Get refresh token expiry in milliseconds from env.
   */
  private getRefreshTokenExpiryMs(): number {
    const expiry = process.env.REFRESH_TOKEN_EXPIRES_IN ?? "7d"
    return this.parseExpiry(expiry)
  }

  /**
   * Parse expiry string (e.g., "7d", "15m", "1h") to milliseconds.
   */
  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/)
    if (!match) return 7 * 24 * 60 * 60 * 1000 // default 7d

    const value = parseInt(match[1], 10)
    const unit = match[2]

    switch (unit) {
      case "s":
        return value * 1000
      case "m":
        return value * 60 * 1000
      case "h":
        return value * 60 * 60 * 1000
      case "d":
        return value * 24 * 60 * 60 * 1000
      default:
        return 7 * 24 * 60 * 60 * 1000
    }
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