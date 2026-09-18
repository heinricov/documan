import type { CreateRole, CreateUser, CreateSubsidiary } from "@packages/validator"

/**
 * ============================================================
 *  Role Factory
 * ============================================================
 */

let roleCounter = 0

export interface RoleOverrides {
  title?: string
  description?: CreateRole["description"]
}

/**
 * Membuat fixture data Role yang valid (siap divalidasi `CreateRoleSchema`).
 * `title` digenerate unik otomatis jika tidak di-supply.
 *
 * @example
 * ```ts
 * const role = createRoleFixture()
 * // { title: "role-abc12345", description: undefined }
 *
 * const admin = createRoleFixture({ title: "admin", description: "Admin role" })
 * // { title: "admin", description: "Admin role" }
 * ```
 */
export function createRoleFixture(overrides: RoleOverrides = {}): CreateRole {
  roleCounter++

  return {
    title: overrides.title ?? `role-${roleCounter}-${crypto.randomUUID().slice(0, 8)}`,
    description: overrides.description,
  }
}

/**
 * Reset counter — berguna di `beforeAll` / `beforeEach` untuk judul yang
 * lebih predictable dalam test.
 */
export function resetRoleCounter(): void {
  roleCounter = 0
}

/**
 * ============================================================
 *  User Factory
 * ============================================================
 */

let userCounter = 0

export interface UserOverrides {
  username?: string
  email?: string
  password?: string
  roleId?: string
}

/**
 * Membuat fixture data User yang valid (siap divalidasi `CreateUserSchema`).
 * `username` & `email` digenerate unik otomatis jika tidak di-supply.
 *
 * @example
 * ```ts
 * const user = createUserFixture({ roleId: "abc-123" })
 * // { username: "user-1-abc12345", email: "user-1-abc12345@test.com", password: "password123", roleId: "abc-123" }
 *
 * const admin = createUserFixture({ username: "admin", email: "admin@test.com", roleId: "abc-123" })
 * // { username: "admin", email: "admin@test.com", password: "password123", roleId: "abc-123" }
 * ```
 */
export function createUserFixture(overrides: UserOverrides = {}): CreateUser {
  userCounter++
  const unique = `${userCounter}-${crypto.randomUUID().slice(0, 8)}`

  return {
    username: overrides.username ?? `user-${unique}`,
    email: overrides.email ?? `user-${unique}@test.com`,
    password: overrides.password ?? "password123",
    roleId: overrides.roleId ?? crypto.randomUUID(),
  }
}

/**
 * Reset user counter — berguna di `beforeAll` / `beforeEach`.
 */
export function resetUserCounter(): void {
  userCounter = 0
}

/**
 * ============================================================
 *  Subsidiary Factory
 * ============================================================
 */

let subsidiaryCounter = 0

export interface SubsidiaryOverrides {
  title?: string
  name?: string
  logo?: string
}

/**
 * Membuat fixture data Subsidiary yang valid (siap divalidasi `CreateSubsidiarySchema`).
 * `title` & `name` digenerate unik otomatis jika tidak di-supply.
 *
 * @example
 * ```ts
 * const subsidiary = createSubsidiaryFixture()
 * // { title: "subsidiary-1-abc12345", name: "Subsidiary abc12345", logo: undefined }
 * ```
 */
export function createSubsidiaryFixture(overrides: SubsidiaryOverrides = {}): CreateSubsidiary {
  subsidiaryCounter++
  const unique = `${subsidiaryCounter}-${crypto.randomUUID().slice(0, 8)}`

  return {
    title: overrides.title ?? `subsidiary-${unique}`,
    name: overrides.name ?? `PT Subsidiary ${unique}`,
    logo: overrides.logo,
  }
}

/**
 * Reset subsidiary counter — berguna di `beforeAll` / `beforeEach`.
 */
export function resetSubsidiaryCounter(): void {
  subsidiaryCounter = 0
}
