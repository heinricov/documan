/**
 * @packages/testing
 *
 * Test utilities & data factories untuk aplikasi.
 * Framework-agnostic — dipakai di apps/api (vitest), apps/web, dll.
 */

// ====================== Factories ======================
export { createRoleFixture, resetRoleCounter } from "./factories.js"

export type { RoleOverrides } from "./factories.js"

// ====================== DB Helpers ======================
export { cleanDatabase, seedRole, seedRoles } from "./db.js"

export type { PrismaClientLike } from "./db.js"

// ====================== Auth Helpers ======================
export { createTestToken, authHeader } from "./auth.js"