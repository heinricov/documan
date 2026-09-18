/**
 * @packages/testing
 *
 * Test utilities & data factories untuk aplikasi.
 * Framework-agnostic — dipakai di apps/api (vitest), apps/web, dll.
 */

// ====================== Factories ======================
export { createRoleFixture, resetRoleCounter, createUserFixture, resetUserCounter } from "./factories.js"

export type { RoleOverrides, UserOverrides } from "./factories.js"

// ====================== DB Helpers ======================
export { cleanDatabase, seedRole, seedRoles, seedUser, seedUsers } from "./db.js"

export type { PrismaClientLike } from "./db.js"

// ====================== Auth Helpers ======================
export { createTestToken, authHeader } from "./auth.js"