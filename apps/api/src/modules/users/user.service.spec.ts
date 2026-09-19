import { describe, it, expect, vi, beforeEach } from "vitest"

/**
 * Unit tests for UserService.
 * Mock @packages/db & @packages/auth untuk isolasi.
 */

// ── Mock prisma ──────────────────────────────────────────────
const mocks = vi.hoisted(() => ({
  userFindMany: vi.fn(),
  userCount: vi.fn(),
  userFindUnique: vi.fn(),
  userFindFirst: vi.fn(),
  userCreate: vi.fn(),
  userUpdate: vi.fn(),
  userDelete: vi.fn(),
  roleFindUnique: vi.fn(),
}))

vi.mock("@packages/db", () => ({
  prisma: {
    user: {
      findMany: mocks.userFindMany,
      count: mocks.userCount,
      findUnique: mocks.userFindUnique,
      findFirst: mocks.userFindFirst,
      create: mocks.userCreate,
      update: mocks.userUpdate,
      delete: mocks.userDelete,
    },
    role: { findUnique: mocks.roleFindUnique },
  },
}))

// ── Mock auth ────────────────────────────────────────────────
vi.mock("@packages/auth", () => ({
  hashPassword: async (pwd: string) => `hashed:${pwd}`,
}))

import { UserService } from "./user.service.js"
import { ConflictError, NotFoundError } from "@packages/core"

const service = new UserService()

function makeUserRow(overrides: Record<string, unknown> = {}) {
  const now = new Date("2026-01-01T00:00:00.000Z")
  return {
    id: overrides.id ?? "00000000-0000-0000-0000-000000000002",
    username: overrides.username ?? "alice",
    email: overrides.email ?? "alice@test.com",
    password: overrides.password ?? "hashed:pass",
    roleId: overrides.roleId ?? "role-1",
    createdAt: now,
    updatedAt: now,
    role: overrides.role ?? { id: "role-1", title: "admin", description: null },
  }
}

function makeRoleRow(id = "role-1", title = "admin") {
  return { id, title, description: null, createdAt: new Date(), updatedAt: new Date() }
}

describe("UserService", () => {
  beforeEach(() => { vi.resetAllMocks() })

  describe("findAll", () => {
    it("mengembalikan paginated users", async () => {
      mocks.userFindMany.mockResolvedValue([makeUserRow()])
      mocks.userCount.mockResolvedValue(1)

      const result = await service.findAll({ page: 1, limit: 10 })

      expect(result.data).toHaveLength(1)
      expect(result.meta).toHaveProperty("total", 1)
    })
  })

  describe("create", () => {
    it("membuat user baru dengan hashing password", async () => {
      mocks.userFindFirst.mockResolvedValueOnce(null) // username check
      mocks.userFindFirst.mockResolvedValueOnce(null) // email check
      mocks.roleFindUnique.mockResolvedValue(makeRoleRow())
      mocks.userCreate.mockResolvedValue(makeUserRow())

      const result = await service.create({
        username: "alice",
        email: "alice@test.com",
        password: "secret123",
        roleId: "role-1",
      })

      expect(mocks.userCreate).toHaveBeenCalledOnce()
      // Password harus ter-hash
      const createCall = mocks.userCreate.mock.calls[0]![0]
      expect(createCall.data.password).toBe("hashed:secret123")
      expect(result).toHaveProperty("username", "alice")
    })

    it("melempar ConflictError jika username sudah ada", async () => {
      mocks.userFindFirst.mockResolvedValueOnce(makeUserRow()) // username taken
      mocks.userFindFirst.mockResolvedValueOnce(null)

      await expect(
        service.create({ username: "alice", email: "new@test.com", password: "pass", roleId: "r1" })
      ).rejects.toThrow(ConflictError)
    })

    it("melempar NotFoundError jika role tidak ditemukan", async () => {
      mocks.userFindFirst.mockResolvedValueOnce(null) // username ok
      mocks.userFindFirst.mockResolvedValueOnce(null) // email ok
      mocks.roleFindUnique.mockResolvedValue(null) // role missing

      await expect(
        service.create({ username: "new", email: "new@test.com", password: "pass", roleId: "missing" })
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe("findById", () => {
    it("mengembalikan user jika ditemukan", async () => {
      mocks.userFindUnique.mockResolvedValue(makeUserRow({ id: "user-1" }))

      const result = await service.findById("user-1")
      expect(result).toHaveProperty("id", "user-1")
    })

    it("melempar NotFoundError jika tidak ditemukan", async () => {
      mocks.userFindUnique.mockResolvedValue(null)
      await expect(service.findById("x")).rejects.toThrow(NotFoundError)
    })
  })

  describe("remove", () => {
    it("menghapus user", async () => {
      mocks.userFindUnique.mockResolvedValue(makeUserRow({ id: "user-1" }))
      mocks.userDelete.mockResolvedValue(makeUserRow({ id: "user-1" }))

      const result = await service.remove("user-1")
      expect(mocks.userDelete).toHaveBeenCalledOnce()
      expect(result).toHaveProperty("id", "user-1")
    })

    it("melempar NotFoundError jika tidak ditemukan", async () => {
      mocks.userFindUnique.mockResolvedValue(null)
      await expect(service.remove("missing")).rejects.toThrow(NotFoundError)
    })
  })
})