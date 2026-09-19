/**
 * @packages/testing
 *
 * Test utilities & data factories untuk aplikasi.
 * Framework-agnostic — dipakai di apps/api (vitest), apps/web, dll.
 */

// ====================== Factories ======================
export { createRoleFixture, resetRoleCounter, createUserFixture, resetUserCounter, createSubsidiaryFixture, resetSubsidiaryCounter, createDocTypeFixture, resetDocTypeCounter, createPartnerFixture, resetPartnerCounter } from "./factories.js"

export type { RoleOverrides, UserOverrides, SubsidiaryOverrides, DocTypeOverrides, PartnerOverrides } from "./factories.js"

// ====================== DB Helpers ======================
export { cleanDatabase, seedRole, seedRoles, seedUser, seedUsers, seedSubsidiary, seedSubsidiaries, seedDocType, seedDocTypes, seedPartner, seedPartners } from "./db.js"

export type { PrismaClientLike } from "./db.js"

// ====================== Auth Helpers ======================
export { createTestToken, authHeader } from "./auth.js"