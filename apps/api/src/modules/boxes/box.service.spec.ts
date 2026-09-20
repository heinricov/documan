import { describe, it, expect, vi, beforeEach } from "vitest"

/**
 * Unit tests for BoxService.
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
    box: {
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

import { BoxService } from "./box.service.js"
import { ConflictError, NotFoundError } from "@packages/core"

const service = new BoxService()

function makeRow(overrides: Record<string, unknown> = {}) {
  const now = new Date("2026-01-01T00:00:00.000Z")
  return {
    id: overrides.id ?? "00000000-0000-0000-0000-000000000005",
    noBox: overrides.noBox ?? "BOX-001",
    title: overrides.title ?? "Arsip Dokumen 2026",
    description: overrides.description ?? "Box untuk arsip dokumen tahun 2026",
    createdAt: now,
    updatedAt: now,
  }
}

describe("BoxService", () => {
  beforeEach(() => { vi.resetAllMocks() })

  describe("findAll", () => {
    it("mengembalikan paginated boxes", async () => {
      mocks.findMany.mockResolvedValue([makeRow()])
      mocks.count.mockResolvedValue(1)

      const result = await service.findAll({ page: 1, limit: 10 })

      expect(result.data).toHaveLength(1)
      expect(result.meta).toHaveProperty("total", 1)
    })
  })

  describe("create", () => {
    it("membuat box baru jika noBox belum ada", async () => {
      mocks.findFirst.mockResolvedValueOnce(null)
      mocks.create.mockResolvedValue(makeRow({ noBox: "BOX-002", title: "Dokumen Keuangan" }))

      const result = await service.create({ noBox: "BOX-002", title: "Dokumen Keuangan" })

      expect(mocks.create).toHaveBeenCalledOnce()
      expect(result).toHaveProperty("noBox", "BOX-002")
    })

    it("melempar ConflictError jika noBox sudah ada", async () => {
      mocks.findFirst.mockResolvedValueOnce(makeRow({ noBox: "BOX-001" }))

      await expect(service.create({ noBox: "BOX-001" })).rejects.toThrow(ConflictError)
      expect(mocks.create).not.toHaveBeenCalled()
    })
  })

  describe("findById", () => {
    it("mengembalikan box berdasarkan id", async () => {
      mocks.findUnique.mockResolvedValue(makeRow({ id: "box-1" }))

      const result = await service.findById("box-1")

      expect(result).toHaveProperty("id", "box-1")
    })

    it("melempar NotFoundError jika tidak ditemukan", async () => {
      mocks.findUnique.mockResolvedValue(null)

      await expect(service.findById("missing")).rejects.toThrow(NotFoundError)
    })
  })

  describe("update", () => {
    it("memperbarui box", async () => {
      mocks.findUnique.mockResolvedValueOnce(makeRow({ id: "box-1" }))
      mocks.update.mockResolvedValueOnce(makeRow({ id: "box-1", title: "Arsip Updated" }))

      const result = await service.update("box-1", { title: "Arsip Updated" })

      expect(result).toHaveProperty("title", "Arsip Updated")
    })

    it("melempar NotFoundError jika tidak ditemukan", async () => {
      mocks.findUnique.mockResolvedValue(null)

      await expect(service.update("x", { title: "BOX-001" })).rejects.toThrow(NotFoundError)
    })
  })

  describe("remove", () => {
    it("menghapus box", async () => {
      mocks.findUnique.mockResolvedValue(makeRow({ id: "box-1" }))
      mocks.delete_.mockResolvedValue(makeRow({ id: "box-1" }))

      const result = await service.remove("box-1")
      expect(mocks.delete_).toHaveBeenCalledOnce()
      expect(result).toHaveProperty("id", "box-1")
    })

    it("melempar NotFoundError jika tidak ditemukan", async () => {
      mocks.findUnique.mockResolvedValue(null)

      await expect(service.remove("x")).rejects.toThrow(NotFoundError)
    })
  })
})
