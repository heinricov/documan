import { describe, it, expect, vi, beforeEach } from "vitest"

/**
 * Unit tests for RoleService.
 *
 * Kita mock `@packages/db` supaya tidak perlu koneksi DB nyata.
 * `@packages/core` helpers (paginatedResponse, dll.) dipanggil asli
 * untuk menguji integrasi pagination.
 */

// ── Mock prisma ──────────────────────────────────────────────
const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  count: vi.fn(),
  findUnique: vi.fn(),
  findFirst: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete_: vi.fn(),
}))

vi.mock("@packages/db", () => ({
  prisma: {
    role: {
      findMany: mocks.findMany,
      count: mocks.count,
      findUnique: mocks.findUnique,
      findFirst: mocks.findFirst,
      create: mocks.create,
      update: mocks.update,
      delete: mocks.delete_,
    },
  },
}))

// Import sesudah mock agar mock sudah terpasang
import { RoleService } from "./role.service.js"
import { ConflictError, NotFoundError } from "@packages/core"

const service = new RoleService()

function makeRoleRow(overrides: Record<string, unknown> = {}) {
  const now = new Date("2026-01-01T00:00:00.000Z")
  return {
    id: overrides.id ?? "00000000-0000-0000-0000-000000000001",
    title: overrides.title ?? "admin",
    description: overrides.description ?? null,
    createdAt: now,
    updatedAt: now,
    _count: overrides._count ?? { users: 0 },
  }
}

describe("RoleService", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  // ── findAll ────────────────────────────────────────────────
  describe("findAll", () => {
    it("mengembalikan paginated roles", async () => {
      mocks.findMany.mockResolvedValue([makeRoleRow()])
      mocks.count.mockResolvedValue(1)

      const result = await service.findAll({ page: 1, limit: 10 })

      expect(mocks.findMany).toHaveBeenCalledOnce()
      expect(mocks.count).toHaveBeenCalledOnce()
      expect(result).toHaveProperty("success", true)
      expect(result.data).toHaveLength(1)
      expect(result.data[0]).toHaveProperty("title", "admin")
      expect(result.meta).toHaveProperty("total", 1)
    })
  })

  // ── create ─────────────────────────────────────────────────
  describe("create", () => {
    it("membuat role baru jika title belum ada", async () => {
      mocks.findFirst.mockResolvedValue(null) // tidak ada duplikat
      mocks.create.mockResolvedValue(makeRoleRow({ title: "editor" }))

      const result = await service.create({ title: "editor" })

      expect(mocks.findFirst).toHaveBeenCalledOnce()
      expect(mocks.create).toHaveBeenCalledOnce()
      expect(result).toHaveProperty("title", "editor")
    })

    it("melempar ConflictError jika title sudah ada", async () => {
      mocks.findFirst.mockResolvedValue(makeRoleRow({ title: "admin" })) // sudah ada

      await expect(
        service.create({ title: "admin" })
      ).rejects.toThrow(ConflictError)
    })
  })

  // ── findById ───────────────────────────────────────────────
  describe("findById", () => {
    it("mengembalikan role jika ditemukan", async () => {
      mocks.findUnique.mockResolvedValue(makeRoleRow({ id: "role-1" }))

      const result = await service.findById("role-1")

      expect(result).toHaveProperty("id", "role-1")
    })

    it("melempar NotFoundError jika tidak ditemukan", async () => {
      mocks.findUnique.mockResolvedValue(null)

      await expect(service.findById("missing")).rejects.toThrow(NotFoundError)
    })
  })

  // ── update ─────────────────────────────────────────────────
  describe("update", () => {
    it("memperbarui role dengan data baru", async () => {
      mocks.findUnique.mockResolvedValueOnce(makeRoleRow({ id: "role-1" })) // existing check
      mocks.findFirst.mockResolvedValue(null) // no duplicate
      mocks.update.mockResolvedValue(makeRoleRow({ id: "role-1", title: "new-title" }))

      const result = await service.update("role-1", { title: "new-title" })

      expect(mocks.update).toHaveBeenCalledOnce()
      expect(result).toHaveProperty("title", "new-title")
    })

    it("melempar NotFoundError jika role tidak ada", async () => {
      mocks.findUnique.mockResolvedValue(null)

      await expect(
        service.update("missing", { title: "x" })
      ).rejects.toThrow(NotFoundError)
    })

    it("melempar ConflictError jika title sudah dipakai role lain", async () => {
      mocks.findUnique.mockResolvedValueOnce(makeRoleRow({ id: "role-1" }))
      mocks.findFirst.mockResolvedValue(makeRoleRow({ id: "role-2", title: "taken" }))

      await expect(
        service.update("role-1", { title: "taken" })
      ).rejects.toThrow(ConflictError)
    })
  })

  // ── remove ─────────────────────────────────────────────────
  describe("remove", () => {
    it("menghapus role jika ditemukan", async () => {
      mocks.findUnique.mockResolvedValue(makeRoleRow({ id: "role-1" }))
      mocks.delete_.mockResolvedValue(makeRoleRow({ id: "role-1" }))

      const result = await service.remove("role-1")

      expect(mocks.delete_).toHaveBeenCalledOnce()
      expect(result).toHaveProperty("id", "role-1")
    })

    it("melempar NotFoundError jika role tidak ada", async () => {
      mocks.findUnique.mockResolvedValue(null)

      await expect(service.remove("missing")).rejects.toThrow(NotFoundError)
    })
  })
})