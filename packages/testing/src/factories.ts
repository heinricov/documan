import type { CreateRole } from "@packages/validator"

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
