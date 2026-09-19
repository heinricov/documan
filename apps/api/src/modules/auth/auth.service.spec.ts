import { describe, it, expect, vi, beforeEach } from "vitest"

/**
 * Unit tests for AuthService.
 * Mock @packages/db & @packages/auth.
 */

// ── Mock prisma ──────────────────────────────────────────────
const mocks = vi.hoisted(() => ({
  userFindUnique: vi.fn(),
  userFindFirst: vi.fn(),
  userCreate: vi.fn(),
  roleFindUnique: vi.fn(),
}))

vi.mock("@packages/db", () => ({
  prisma: {
    user: {
      findUnique: mocks.userFindUnique,
      findFirst: mocks.userFindFirst,
      create: mocks.userCreate,
    },
    role: { findUnique: mocks.roleFindUnique },
  },
}))

// ── Mock auth ────────────────────────────────────────────────
vi.mock("@packages/auth", () => ({
  signToken: async () => "mocked-jwt-token",
  hashPassword: async (pwd: string) => `hashed:${pwd}`,
  verifyPassword: async (_hash: string, pwd: string) => {
    return pwd === "correct"
      ? { ok: true as const, password: pwd }
      : { ok: false as const, password: false as const, reason: "not-matched" as const }
  },
}))

import { AuthService } from "./auth.service.js"
import { UnauthorizedException } from "@nestjs/common"
import { NotFoundError } from "@packages/core"

const service = new AuthService()

function makeUserRow(overrides: Record<string, unknown> = {}) {
  const now = new Date("2026-01-01T00:00:00.000Z")
  return {
    id: overrides.id ?? "user-1",
    username: overrides.username ?? "alice",
    email: overrides.email ?? "alice@test.com",
    password: overrides.password ?? "hashed:correct",
    roleId: overrides.roleId ?? "role-1",
    createdAt: now,
    updatedAt: now,
    role: overrides.role ?? { id: "role-1", title: "admin", description: null },
  }
}

describe("AuthService", () => {
  beforeEach(() => { vi.resetAllMocks() })

  describe("login", () => {
    it("mengembalikan token & user jika kredensial valid", async () => {
      mocks.userFindUnique.mockResolvedValue(makeUserRow())

      const result = await service.login({ email: "alice@test.com", password: "correct" })

      expect(mocks.userFindUnique).toHaveBeenCalledOnce()
      expect(result).toHaveProperty("token", "mocked-jwt-token")
      expect(result.user).toHaveProperty("username", "alice")
    })

    it("melempar UnauthorizedException jika email tidak ada", async () => {
      mocks.userFindUnique.mockResolvedValue(null)

      await expect(
        service.login({ email: "unknown@test.com", password: "pass" })
      ).rejects.toThrow(UnauthorizedException)
    })

    it("melempar UnauthorizedException jika password salah", async () => {
      mocks.userFindUnique.mockResolvedValue(makeUserRow({ password: "hashed:correct" }))

      await expect(
        service.login({ email: "alice@test.com", password: "wrong" })
      ).rejects.toThrow(UnauthorizedException)
    })
  })

  describe("getMe", () => {
    it("mengembalikan user jika ditemukan", async () => {
      mocks.userFindUnique.mockResolvedValue(makeUserRow({ id: "user-1" }))

      const result = await service.getMe("user-1")
      expect(result).toHaveProperty("id", "user-1")
    })

    it("melempar NotFoundError jika tidak ditemukan", async () => {
      mocks.userFindUnique.mockResolvedValue(null)

      await expect(service.getMe("missing")).rejects.toThrow(NotFoundError)
    })
  })
})