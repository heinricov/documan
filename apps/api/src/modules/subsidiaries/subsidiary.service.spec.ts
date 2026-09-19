import { describe, it, expect, vi, beforeEach } from "vitest"

/**
 * Unit tests for SubsidiaryService.
 * Mock @packages/db untuk isolasi.
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
    subsidiary: {
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

import { SubsidiaryService } from "./subsidiary.service.js"
import { ConflictError, NotFoundError } from "@packages/core"

const service = new SubsidiaryService()

function makeRow(overrides: Record<string, unknown> = {}) {
  const now = new Date("2026-01-01T00:00:00.000Z")
  return {
    id: overrides.id ?? "00000000-0000-0000-0000-000000000003",
    title: overrides.title ?? "PT Maju",
    name: overrides.name ?? "PT Maju Bersama",
    logo: overrides.logo ?? null,
    createdAt: now,
    updatedAt: now,
  }
}

describe("SubsidiaryService", () => {
  beforeEach(() => { vi.resetAllMocks() })

  describe("findAll", () => {
    it("mengembalikan paginated subsidiaries", async () => {
      mocks.findMany.mockResolvedValue([makeRow()])
      mocks.count.mockResolvedValue(1)

      const result = await service.findAll({ page: 1, limit: 10 })

      expect(result.data).toHaveLength(1)
      expect(result.meta).toHaveProperty("total", 1)
    })
  })

  describe("create", () => {
    it("membuat subsidiary baru jika title & name belum ada", async () => {
      mocks.findFirst.mockResolvedValueOnce(null) // title check
      mocks.findFirst.mockResolvedValueOnce(null) // name check
      mocks.create.mockResolvedValue(makeRow({ title: "PT Baru", name: "PT Baru Jaya" }))

      const result = await service.create({ title: "PT Baru", name: "PT Baru Jaya" })

      expect(mocks.create).toHaveBeenCalledOnce()
      expect(result).toHaveProperty("title", "PT Baru")
    })

    it("melempar ConflictError jika title sudah ada", async () => {
      mocks.findFirst.mockResolvedValueOnce(makeRow({ title: "PT Existing" })) // title taken

      await expect(
        service.create({ title: "PT Existing", name: "Any" })
      ).rejects.toThrow(ConflictError)
    })

    it("melempar ConflictError jika name sudah ada", async () => {
      mocks.findFirst.mockResolvedValueOnce(null) // title ok
      mocks.findFirst.mockResolvedValueOnce(makeRow({ name: "PT Existing" })) // name taken

      await expect(
        service.create({ title: "PT New", name: "PT Existing" })
      ).rejects.toThrow(ConflictError)
    })
  })

  describe("findById", () => {
    it("mengembalikan subsidiary jika ditemukan", async () => {
      mocks.findUnique.mockResolvedValue(makeRow({ id: "sub-1" }))

      const result = await service.findById("sub-1")
      expect(result).toHaveProperty("id", "sub-1")
    })

    it("melempar NotFoundError jika tidak ditemukan", async () => {
      mocks.findUnique.mockResolvedValue(null)
      await expect(service.findById("missing")).rejects.toThrow(NotFoundError)
    })
  })

  describe("remove", () => {
    it("menghapus subsidiary", async () => {
      mocks.findUnique.mockResolvedValue(makeRow({ id: "sub-1" }))
      mocks.delete_.mockResolvedValue(makeRow({ id: "sub-1" }))

      const result = await service.remove("sub-1")
      expect(mocks.delete_).toHaveBeenCalledOnce()
      expect(result).toHaveProperty("id", "sub-1")
    })

    it("melempar NotFoundError jika tidak ditemukan", async () => {
      mocks.findUnique.mockResolvedValue(null)
      await expect(service.remove("x")).rejects.toThrow(NotFoundError)
    })
  })
})