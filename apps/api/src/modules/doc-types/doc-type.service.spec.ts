import { describe, it, expect, vi, beforeEach } from "vitest"

/**
 * Unit tests for DocTypeService.
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
    docType: {
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

import { DocTypeService } from "./doc-type.service.js"
import { ConflictError, NotFoundError } from "@packages/core"

const service = new DocTypeService()

function makeRow(overrides: Record<string, unknown> = {}) {
  const now = new Date("2026-01-01T00:00:00.000Z")
  return {
    id: overrides.id ?? "00000000-0000-0000-0000-000000000004",
    title: overrides.title ?? "do",
    description: overrides.description ?? "Delivery Order",
    createdAt: now,
    updatedAt: now,
  }
}

describe("DocTypeService", () => {
  beforeEach(() => { vi.resetAllMocks() })

  describe("findAll", () => {
    it("mengembalikan paginated doc types", async () => {
      mocks.findMany.mockResolvedValue([makeRow()])
      mocks.count.mockResolvedValue(1)

      const result = await service.findAll({ page: 1, limit: 10 })

      expect(result.data).toHaveLength(1)
      expect(result.meta).toHaveProperty("total", 1)
    })
  })

  describe("create", () => {
    it("membuat doc type baru jika title belum ada", async () => {
      mocks.findFirst.mockResolvedValueOnce(null)
      mocks.create.mockResolvedValue(makeRow({ title: "pv", description: "Payment Voucher" }))

      const result = await service.create({ title: "pv", description: "Payment Voucher" })

      expect(mocks.create).toHaveBeenCalledOnce()
      expect(result).toHaveProperty("title", "pv")
    })

    it("melempar ConflictError jika title sudah ada", async () => {
      mocks.findFirst.mockResolvedValueOnce(makeRow({ title: "do" }))

      await expect(service.create({ title: "do" })).rejects.toThrow(ConflictError)
      expect(mocks.create).not.toHaveBeenCalled()
    })
  })

  describe("findById", () => {
    it("mengembalikan doc type berdasarkan id", async () => {
      mocks.findUnique.mockResolvedValue(makeRow({ id: "doc-1" }))

      const result = await service.findById("doc-1")

      expect(result).toHaveProperty("id", "doc-1")
    })

    it("melempar NotFoundError jika tidak ditemukan", async () => {
      mocks.findUnique.mockResolvedValue(null)

      await expect(service.findById("missing")).rejects.toThrow(NotFoundError)
    })
  })

  describe("update", () => {
    it("memperbarui doc type", async () => {
      mocks.findUnique.mockResolvedValueOnce(makeRow({ id: "doc-1" }))
      mocks.update.mockResolvedValueOnce(makeRow({ id: "doc-1", description: "Delivery Order Updated" }))

      const result = await service.update("doc-1", { description: "Delivery Order Updated" })

      expect(result).toHaveProperty("description", "Delivery Order Updated")
    })

    it("melempar NotFoundError jika tidak ditemukan", async () => {
      mocks.findUnique.mockResolvedValue(null)

      await expect(service.update("x", { title: "do" })).rejects.toThrow(NotFoundError)
    })
  })

  describe("remove", () => {
    it("menghapus doc type", async () => {
      mocks.findUnique.mockResolvedValue(makeRow({ id: "doc-1" }))
      mocks.delete_.mockResolvedValue(makeRow({ id: "doc-1" }))

      const result = await service.remove("doc-1")
      expect(mocks.delete_).toHaveBeenCalledOnce()
      expect(result).toHaveProperty("id", "doc-1")
    })

    it("melempar NotFoundError jika tidak ditemukan", async () => {
      mocks.findUnique.mockResolvedValue(null)

      await expect(service.remove("x")).rejects.toThrow(NotFoundError)
    })
  })
})