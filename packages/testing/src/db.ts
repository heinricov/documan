import { prisma as defaultPrisma } from "@packages/db"
import type { Role } from "@packages/validator"
import { createRoleFixture, type RoleOverrides } from "./factories.js"

/**
 * ============================================================
 *  Types
 * ============================================================
 */

/**
 * PrismaClient digunakan sebagai type saja (untuk parameter).
 * Diambil dari instance default agar konsisten dengan @packages/db.
 */
export type PrismaClientLike = Parameters<
  typeof defaultPrisma.$transaction
>[0]

type Db = typeof defaultPrisma

/**
 * ============================================================
 *  cleanDatabase
 * ============================================================
 */

/**
 * Membersihkan semua data dari tabel yang disebutkan.
 * Memakai `TRUNCATE ... RESTART IDENTITY CASCADE` untuk memastikan
 * tidak ada dangling FK & auto-increment di-reset.
 *
 * Default: semua tabel (["roles"]) agar aman untuk suite e2e.
 *
 * @example
 * ```ts
 * // sebelum semua test
 * beforeAll(async () => {
 *   await cleanDatabase()
 * })
 *
 * // hanya tabel tertentu
 * await cleanDatabase(["roles"])
 * ```
 */
export async function cleanDatabase(
  tables: string[] = ["roles"],
  db: Db = defaultPrisma
): Promise<void> {
  if (tables.length === 0) return

  // Escape identifiers agar aman dari injection
  const escaped = tables
    .map((table) => `"${table.replaceAll('"', '""')}"`)
    .join(", ")

  await db.$executeRawUnsafe(`TRUNCATE TABLE ${escaped} RESTART IDENTITY CASCADE`)
}

/**
 * ============================================================
 *  Seed
 * ============================================================
 */

/**
 * Menyisipkan fixture Role ke database dan mengembalikan record
 * yang tersimpan (lengkap dengan `id` uuid) untuk referensi test.
 *
 * @example
 * ```ts
 * const role = await seedRole({ title: "admin" })
 * // { id: "0c5f...", title: "admin", description: null }
 *
 * const batch = await Promise.all([
 *   seedRole(),
 *   seedRole({ title: "editor" }),
 * ])
 * ```
 */
export async function seedRole(
  overrides: RoleOverrides = {},
  db: Db = defaultPrisma
): Promise<Role> {
  const data = createRoleFixture(overrides)
  return db.role.create({
    data: {
      title: data.title,
      description: data.description ?? undefined,
    },
  })
}

/**
 * Menyisipkan banyak Role sekaligus dalam satu transaction.
 * Mengembalikan record yang tersimpan dalam urutan input.
 *
 * @example
 * ```ts
 * const [admin, editor] = await seedRoles([
 *   { title: "admin" },
 *   { title: "editor" },
 * ])
 * ```
 */
export async function seedRoles(
  items: RoleOverrides[] = [],
  db: Db = defaultPrisma
): Promise<Role[]> {
  const fixtures = items.length > 0 ? items : [{}]
  const data = fixtures.map((fixture) => createRoleFixture(fixture))

  return db.$transaction(
    data.map((role) =>
      db.role.create({
        data: {
          title: role.title,
          description: role.description ?? undefined,
        },
      })
    )
  )
}