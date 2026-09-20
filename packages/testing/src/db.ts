import { prisma as defaultPrisma } from "@packages/db"
import type { Role, User, Subsidiary, DocType, Partner, Box } from "@packages/validator"
import { createRoleFixture, type RoleOverrides, createUserFixture, type UserOverrides, createSubsidiaryFixture, type SubsidiaryOverrides, createDocTypeFixture, type DocTypeOverrides, createPartnerFixture, type PartnerOverrides, createBoxFixture, type BoxOverrides } from "./factories.js"

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
 * Default: semua tabel (["users", "roles", "subsidiaries"]) agar aman untuk suite e2e.
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
  tables: string[] = ["users", "roles", "subsidiaries"],
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

/**
 * ============================================================
 *  Subsidiary Seed
 * ============================================================
 */

/**
 * Menyisipkan fixture Subsidiary ke database dan mengembalikan record
 * yang tersimpan (lengkap dengan `id` uuid) untuk referensi test.
 *
 * @example
 * ```ts
 * const subsidiary = await seedSubsidiary({ title: "PT Maju", name: "PT Maju Bersama" })
 * // { id: "0c5f...", title: "PT Maju", name: "PT Maju Bersama", logo: null }
 * ```
 */
export async function seedSubsidiary(
  overrides: SubsidiaryOverrides = {},
  db: Db = defaultPrisma
): Promise<Subsidiary> {
  const data = createSubsidiaryFixture(overrides)
  return serializeSubsidiary(
    await db.subsidiary.create({
      data: {
        title: data.title,
        name: data.name,
        logo: data.logo ?? undefined,
      },
    })
  )
}

/**
 * Menyisipkan banyak Subsidiary sekaligus dalam satu transaction.
 * Mengembalikan record yang tersimpan dalam urutan input.
 *
 * @example
 * ```ts
 * const [subs1, subs2] = await seedSubsidiaries([
 *   { title: "PT Maju", name: "PT Maju Bersama" },
 *   { title: "PT Sejahtera", name: "PT Sejahtera Abadi" },
 * ])
 * ```
 */
export async function seedSubsidiaries(
  items: SubsidiaryOverrides[] = [],
  db: Db = defaultPrisma
): Promise<Subsidiary[]> {
  const fixtures = items.length > 0 ? items : [{}]
  const data = fixtures.map((fixture) => createSubsidiaryFixture(fixture))

  return serializeSubsidiaryList(
    await db.$transaction(
      data.map((subs) =>
        db.subsidiary.create({
          data: {
            title: subs.title,
            name: subs.name,
            logo: subs.logo ?? undefined,
          },
        })
      )
    )
  )
}

type SubsidiaryRecord = {
  id: string
  title: string
  name: string
  logo: string | null
  createdAt: Date
  updatedAt: Date
}

function serializeSubsidiary(subsidiary: SubsidiaryRecord): Subsidiary {
  return {
    id: subsidiary.id,
    title: subsidiary.title,
    name: subsidiary.name,
    logo: subsidiary.logo,
    createdAt: subsidiary.createdAt.toISOString(),
    updatedAt: subsidiary.updatedAt.toISOString(),
  }
}

function serializeSubsidiaryList(subsidiaries: SubsidiaryRecord[]): Subsidiary[] {
  return subsidiaries.map(serializeSubsidiary)
}

/**
 * ============================================================
 *  DocType Seed
 * ============================================================
 */

export async function seedDocType(
  overrides: DocTypeOverrides = {},
  db: Db = defaultPrisma
): Promise<DocType> {
  const data = createDocTypeFixture(overrides)
  return serializeDocType(
    await db.docType.create({
      data: {
        title: data.title,
        description: data.description ?? undefined,
      },
    })
  )
}

export async function seedDocTypes(
  items: DocTypeOverrides[] = [],
  db: Db = defaultPrisma
): Promise<DocType[]> {
  const fixtures = items.length > 0 ? items : [{}]
  const data = fixtures.map((fixture) => createDocTypeFixture(fixture))

  return serializeDocTypeList(
    await db.$transaction(
      data.map((docType) =>
        db.docType.create({
          data: {
            title: docType.title,
            description: docType.description ?? undefined,
          },
        })
      )
    )
  )
}

type DocTypeRecord = {
  id: string
  title: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}

function serializeDocType(docType: DocTypeRecord): DocType {
  return {
    id: docType.id,
    title: docType.title,
    description: docType.description,
    createdAt: docType.createdAt.toISOString(),
    updatedAt: docType.updatedAt.toISOString(),
  }
}

function serializeDocTypeList(docTypes: DocTypeRecord[]): DocType[] {
  return docTypes.map(serializeDocType)
}

/**
 * ============================================================
 *  Partner Seed
 * ============================================================
 */

export async function seedPartner(
  overrides: PartnerOverrides = {},
  db: Db = defaultPrisma
): Promise<Partner> {
  const data = createPartnerFixture(overrides)
  return serializePartner(
    await db.partner.create({
      data: {
        name: data.name,
        description: data.description ?? undefined,
        type: data.type,
      },
    })
  )
}

export async function seedPartners(
  items: PartnerOverrides[] = [],
  db: Db = defaultPrisma
): Promise<Partner[]> {
  const fixtures = items.length > 0 ? items : [{}]
  const data = fixtures.map((fixture) => createPartnerFixture(fixture))

  return serializePartnerList(
    await db.$transaction(
      data.map((partner) =>
        db.partner.create({
          data: {
            name: partner.name,
            description: partner.description ?? undefined,
            type: partner.type,
          },
        })
      )
    )
  )
}

type PartnerRecord = {
  id: string
  name: string
  description: string | null
  type: string
  createdAt: Date
  updatedAt: Date
}

function serializePartner(partner: PartnerRecord): Partner {
  return {
    id: partner.id,
    name: partner.name,
    description: partner.description,
    type: partner.type,
    createdAt: partner.createdAt.toISOString(),
    updatedAt: partner.updatedAt.toISOString(),
  }
}

function serializePartnerList(partners: PartnerRecord[]): Partner[] {
  return partners.map(serializePartner)
}

/**
 * ============================================================
 *  Box Seed
 * ============================================================
 */

export async function seedBox(
  overrides: BoxOverrides = {},
  db: Db = defaultPrisma
): Promise<Box> {
  const data = createBoxFixture(overrides)
  return serializeBox(
    await db.box.create({
      data: {
        noBox: data.noBox,
        title: data.title ?? undefined,
        description: data.description ?? undefined,
      },
    })
  )
}

export async function seedBoxes(
  items: BoxOverrides[] = [],
  db: Db = defaultPrisma
): Promise<Box[]> {
  const fixtures = items.length > 0 ? items : [{}]
  const data = fixtures.map((fixture) => createBoxFixture(fixture))

  return serializeBoxList(
    await db.$transaction(
      data.map((box) =>
        db.box.create({
          data: {
            noBox: box.noBox,
            title: box.title ?? undefined,
            description: box.description ?? undefined,
          },
        })
      )
    )
  )
}

type BoxRecord = {
  id: string
  noBox: string
  title: string | null
  description: string | null
  createdAt: Date
  updatedAt: Date
}

function serializeBox(box: BoxRecord): Box {
  return {
    id: box.id,
    noBox: box.noBox,
    title: box.title,
    description: box.description,
    createdAt: box.createdAt.toISOString(),
    updatedAt: box.updatedAt.toISOString(),
  }
}

function serializeBoxList(boxes: BoxRecord[]): Box[] {
  return boxes.map(serializeBox)
}