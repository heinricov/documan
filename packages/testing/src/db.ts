import { prisma as defaultPrisma } from "@packages/db"
import type { Role, User } from "@packages/validator"
import { createRoleFixture, type RoleOverrides, createUserFixture, type UserOverrides } from "./factories.js"

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
 * Default: semua tabel (["users", "roles"]) agar aman untuk suite e2e.
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
  tables: string[] = ["users", "roles"],
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
  return serializeRole(
    await db.role.create({
      data: {
        title: data.title,
        description: data.description ?? undefined,
      },
    })
  )
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

  return serializeRoleList(
    await db.$transaction(
      data.map((role) =>
        db.role.create({
          data: {
            title: role.title,
            description: role.description ?? undefined,
          },
        })
      )
    )
  )
}

type RoleRecord = {
  id: string
  title: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}

function serializeRole(role: RoleRecord): Role {
  return {
    id: role.id,
    title: role.title,
    description: role.description,
    createdAt: role.createdAt.toISOString(),
    updatedAt: role.updatedAt.toISOString(),
  }
}

function serializeRoleList(roles: RoleRecord[]): Role[] {
  return roles.map(serializeRole)
}

/**
 * ============================================================
 *  User Seed
 * ============================================================
 */

/**
 * Menyisipkan fixture User ke database dan mengembalikan record
 * yang tersimpan (lengkap dengan `id` uuid) untuk referensi test.
 *
 * @example
 * ```ts
 * const role = await seedRole({ title: "admin" })
 * const user = await seedUser({ roleId: role.id, username: "admin" })
 * // { id: "0c5f...", username: "admin", email: "admin@test.com", roleId: "abc-123" }
 * ```
 */
export async function seedUser(
  overrides: UserOverrides = {},
  db: Db = defaultPrisma
): Promise<User> {
  const data = createUserFixture(overrides)
  return serializeUser(
    await db.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: "hashed-password-for-test",
        roleId: data.roleId,
      },
    })
  )
}

/**
 * Menyisipkan banyak User sekaligus dalam satu transaction.
 * Mengembalikan record yang tersimpan dalam urutan input.
 *
 * @example
 * ```ts
 * const role = await seedRole({ title: "admin" })
 * const [user1, user2] = await seedUsers([
 *   { roleId: role.id, username: "admin" },
 *   { roleId: role.id, username: "editor" },
 * ])
 * ```
 */
export async function seedUsers(
  items: UserOverrides[] = [],
  db: Db = defaultPrisma
): Promise<User[]> {
  const fixtures = items.length > 0 ? items : [{}]
  const data = fixtures.map((fixture) => createUserFixture(fixture))

  return serializeUserList(
    await db.$transaction(
      data.map((user) =>
        db.user.create({
          data: {
            username: user.username,
            email: user.email,
            password: "hashed-password-for-test",
            roleId: user.roleId,
          },
        })
      )
    )
  )
}

type UserRecord = {
  id: string
  username: string
  email: string
  roleId: string
  createdAt: Date
  updatedAt: Date
}

function serializeUser(user: UserRecord): User {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    roleId: user.roleId,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}

function serializeUserList(users: UserRecord[]): User[] {
  return users.map(serializeUser)
}