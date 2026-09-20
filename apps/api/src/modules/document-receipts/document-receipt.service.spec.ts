import { describe, it, expect, vi, beforeEach } from "vitest"

/**
 * Unit tests for DocumentReceiptService.
 * Mock @packages/db untuk isolasi.
 */

// ── Mock prisma ──────────────────────────────────────────────
const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  count: vi.fn(),
  findUnique: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete_: vi.fn(),
}))

vi.mock("@packages/db", () => ({
  prisma: {
    documentReceipt: {
      findMany: mocks.findMany,
      count: mocks.count,
      findUnique: mocks.findUnique,
      create: mocks.create,
      update: mocks.update,
      delete: mocks.delete_,
    },
  },
}))

import { DocumentReceiptService } from "./document-receipt.service.js"
import { NotFoundError } from "@packages/core"

const service = new DocumentReceiptService()

function makeRow(overrides: Record<string, unknown> = {}) {
  const now = new Date("2026-01-01T00:00:00.000Z")
  return {
    id: "550e8400-e29b-41d4-a716-446655440000",
    title: "Test Document Receipt",
    description: "Test description",
    userId: "550e8400-e29b-41d4-a716-446655440001",
    docTypeId: "550e8400-e29b-41d4-a716-446655440002",
    subsidiaryId: "550e8400-e29b-41d4-a716-446655440003",
    partnerId: "550e8400-e29b-41d4-a716-446655440004",
    boxId: "550e8400-e29b-41d4-a716-446655440005",
    createdAt: now,
    updatedAt: now,
    user: { id: "550e8400-e29b-41d4-a716-446655440001", username: "admin" },
    docType: { id: "550e8400-e29b-41d4-a716-446655440002", title: "Invoice" },
    subsidiary: { id: "550e8400-e29b-41d4-a716-446655440003", title: "PT ABC" },
    partner: { id: "550e8400-e29b-41d4-a716-446655440004", name: "Partner X" },
    box: { id: "550e8400-e29b-41d4-a716-446655440005", noBox: "BOX-001" },
    ...overrides,
  }
}

describe("DocumentReceiptService", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("findAll", () => {
    it("should return paginated document receipts", async () => {
      const row = makeRow()
      mocks.findMany.mockResolvedValue([row])
      mocks.count.mockResolvedValue(1)

      const result = await service.findAll({
        page: 1,
        limit: 10,
        search: "",
      })

      expect(result.data).toHaveLength(1)
      expect(result.data[0]?.title).toBe("Test Document Receipt")
      expect(result.meta).toHaveProperty("total", 1)
    })

    it("should filter by userId", async () => {
      mocks.findMany.mockResolvedValue([])
      mocks.count.mockResolvedValue(0)

      await service.findAll({
        page: 1,
        limit: 10,
        userId: "550e8400-e29b-41d4-a716-446655440001",
      })

      expect(mocks.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: "550e8400-e29b-41d4-a716-446655440001",
          }),
        })
      )
    })

    it("should filter by docTypeId", async () => {
      mocks.findMany.mockResolvedValue([])
      mocks.count.mockResolvedValue(0)

      await service.findAll({
        page: 1,
        limit: 10,
        docTypeId: "550e8400-e29b-41d4-a716-446655440002",
      })

      expect(mocks.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            docTypeId: "550e8400-e29b-41d4-a716-446655440002",
          }),
        })
      )
    })

    it("should search by title", async () => {
      mocks.findMany.mockResolvedValue([])
      mocks.count.mockResolvedValue(0)

      await service.findAll({
        page: 1,
        limit: 10,
        search: "invoice",
      })

      expect(mocks.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            title: { contains: "invoice", mode: "insensitive" },
          }),
        })
      )
    })
  })

  describe("findById", () => {
    it("should return a document receipt by id", async () => {
      const row = makeRow()
      mocks.findUnique.mockResolvedValue(row)

      const result = await service.findById(row.id)

      expect(result.id).toBe(row.id)
      expect(result.title).toBe("Test Document Receipt")
    })

    it("should throw NotFoundError when id not found", async () => {
      mocks.findUnique.mockResolvedValue(null)

      await expect(
        service.findById("550e8400-e29b-41d4-a716-446655440999")
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe("create", () => {
    it("should create a new document receipt", async () => {
      const row = makeRow()
      mocks.create.mockResolvedValue(row)

      const result = await service.create({
        title: "Test Document Receipt",
        description: "Test description",
        userId: "550e8400-e29b-41d4-a716-446655440001",
        docTypeId: "550e8400-e29b-41d4-a716-446655440002",
        subsidiaryId: "550e8400-e29b-41d4-a716-446655440003",
        partnerId: "550e8400-e29b-41d4-a716-446655440004",
        boxId: "550e8400-e29b-41d4-a716-446655440005",
      })

      expect(result.title).toBe("Test Document Receipt")
      expect(mocks.create).toHaveBeenCalled()
    })

    it("should trim title", async () => {
      const row = makeRow({ title: "Trimmed Title" })
      mocks.create.mockResolvedValue(row)

      await service.create({
        title: "  Trimmed Title  ",
        userId: "550e8400-e29b-41d4-a716-446655440001",
        docTypeId: "550e8400-e29b-41d4-a716-446655440002",
        subsidiaryId: "550e8400-e29b-41d4-a716-446655440003",
        partnerId: "550e8400-e29b-41d4-a716-446655440004",
        boxId: "550e8400-e29b-41d4-a716-446655440005",
      })

      expect(mocks.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: "Trimmed Title",
          }),
        })
      )
    })
  })

  describe("update", () => {
    it("should update a document receipt", async () => {
      const existing = makeRow()
      const updated = makeRow({ title: "Updated Title" })
      mocks.findUnique.mockResolvedValue(existing)
      mocks.update.mockResolvedValue(updated)

      const result = await service.update(existing.id, { title: "Updated Title" })

      expect(result.title).toBe("Updated Title")
    })

    it("should throw NotFoundError when id not found", async () => {
      mocks.findUnique.mockResolvedValue(null)

      await expect(
        service.update("non-existent-id", { title: "test" })
      ).rejects.toThrow(NotFoundError)
    })
  })

  describe("remove", () => {
    it("should remove a document receipt", async () => {
      const row = makeRow()
      mocks.findUnique.mockResolvedValue(row)
      mocks.delete_.mockResolvedValue(row)

      const result = await service.remove(row.id)

      expect(result.id).toBe(row.id)
    })

    it("should throw NotFoundError when id not found", async () => {
      mocks.findUnique.mockResolvedValue(null)

      await expect(
        service.remove("non-existent-id")
      ).rejects.toThrow(NotFoundError)
    })
  })
})
