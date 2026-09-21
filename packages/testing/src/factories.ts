import type { CreateRole, CreateUser, CreateSubsidiary, CreateDocType, CreatePartner, CreateBox, CreateDocumentReceipt, CreateDocumentReceiptDetail } from "@packages/validator"

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

/**
 * ============================================================
 *  DocType Factory
 * ============================================================
 */

let docTypeCounter = 0

export interface DocTypeOverrides {
  title?: string
  description?: CreateDocType["description"]
}

/**
 * Membuat fixture data DocType yang valid (siap divalidasi `CreateDocTypeSchema`).
 * `title` digenerate unik otomatis jika tidak di-supply.
 *
 * @example
 * ```ts
 * const docType = createDocTypeFixture()
 * // { title: "doctype-1-abc12345", description: undefined }
 *
 * const doType = createDocTypeFixture({ title: "do", description: "Delivery Order" })
 * // { title: "do", description: "Delivery Order" }
 * ```
 */
export function createDocTypeFixture(overrides: DocTypeOverrides = {}): CreateDocType {
  docTypeCounter++

  return {
    title: overrides.title ?? `doctype-${docTypeCounter}-${crypto.randomUUID().slice(0, 8)}`,
    description: overrides.description,
  }
}

/**
 * Reset docType counter — berguna di `beforeAll` / `beforeEach`.
 */
export function resetDocTypeCounter(): void {
  docTypeCounter = 0
}

/**
 * ============================================================
 *  Partner Factory
 * ============================================================
 */

let partnerCounter = 0

export interface PartnerOverrides {
  name?: string
  description?: CreatePartner["description"]
  type?: string
}

/**
 * Membuat fixture data Partner yang valid (siap divalidasi `CreatePartnerSchema`).
 * `name` digenerate unik otomatis jika tidak di-supply.
 *
 * @example
 * ```ts
 * const partner = createPartnerFixture()
 * // { name: "partner-1-abc12345", description: undefined, type: "vendor" }
 *
 * const supplier = createPartnerFixture({ name: "PT Supplier", type: "supplier", description: "Main supplier" })
 * // { name: "PT Supplier", description: "Main supplier", type: "supplier" }
 * ```
 */
export function createPartnerFixture(overrides: PartnerOverrides = {}): CreatePartner {
  partnerCounter++

  return {
    name: overrides.name ?? `partner-${partnerCounter}-${crypto.randomUUID().slice(0, 8)}`,
    description: overrides.description,
    type: overrides.type ?? "vendor",
  }
}

/**
 * Reset partner counter — berguna di `beforeAll` / `beforeEach`.
 */
export function resetPartnerCounter(): void {
  partnerCounter = 0
}

/**
 * ============================================================
 *  Box Factory
 * ============================================================
 */

let boxCounter = 0

export interface BoxOverrides {
  noBox?: string
  title?: CreateBox["title"]
  description?: CreateBox["description"]
}

/**
 * Membuat fixture data Box yang valid (siap divalidasi `CreateBoxSchema`).
 * `noBox` digenerate unik otomatis jika tidak di-supply.
 *
 * @example
 * ```ts
 * const box = createBoxFixture()
 * // { noBox: "BOX-1-abc12345", title: undefined, description: undefined }
 *
 * const arsip = createBoxFixture({ noBox: "BOX-001", title: "Arsip 2026" })
 * // { noBox: "BOX-001", title: "Arsip 2026", description: undefined }
 * ```
 */
export function createBoxFixture(overrides: BoxOverrides = {}): CreateBox {
  boxCounter++

  return {
    noBox: overrides.noBox ?? `BOX-${boxCounter}-${crypto.randomUUID().slice(0, 8)}`,
    title: overrides.title,
    description: overrides.description,
  }
}

/**
 * Reset box counter — berguna di `beforeAll` / `beforeEach`.
 */
export function resetBoxCounter(): void {
  boxCounter = 0
}

/**
 * ============================================================
 *  DocumentReceipt Factory
 * ============================================================
 */

let documentReceiptCounter = 0

export interface DocumentReceiptOverrides {
  title?: string
  description?: CreateDocumentReceipt["description"]
  userId?: string
  docTypeId?: string
  boxId?: string
}

export interface DocumentReceiptFixture extends CreateDocumentReceipt {
  userId: string
}

/**
 * Membuat fixture data DocumentReceipt yang valid.
 * `title` digenerate unik otomatis jika tidak di-supply.
 */
export function createDocumentReceiptFixture(
  overrides: DocumentReceiptOverrides = {}
): DocumentReceiptFixture {
  documentReceiptCounter++

  return {
    title: overrides.title ?? `doc-receipt-${documentReceiptCounter}-${crypto.randomUUID().slice(0, 8)}`,
    description: overrides.description,
    userId: overrides.userId ?? crypto.randomUUID(),
    docTypeId: overrides.docTypeId ?? crypto.randomUUID(),
    boxId: overrides.boxId ?? crypto.randomUUID(),
  }
}

export function resetDocumentReceiptCounter(): void {
  documentReceiptCounter = 0
}

/**
 * ============================================================
 *  DocumentReceiptDetail Factory
 * ============================================================
 */

let documentReceiptDetailCounter = 0

export interface DocumentReceiptDetailOverrides {
  documentReceiptId?: string
  docTypeId?: string
  subsidiaryId?: string
  partnerId?: string
  nomorDoc?: CreateDocumentReceiptDetail["nomorDoc"]
  nomorFaktur?: CreateDocumentReceiptDetail["nomorFaktur"]
  nomorPl?: CreateDocumentReceiptDetail["nomorPl"]
  nomorDo?: CreateDocumentReceiptDetail["nomorDo"]
  nomorInv?: CreateDocumentReceiptDetail["nomorInv"]
  nomorPv?: CreateDocumentReceiptDetail["nomorPv"]
  nomorNota?: CreateDocumentReceiptDetail["nomorNota"]
  description?: CreateDocumentReceiptDetail["description"]
}

/**
 * Membuat fixture data DocumentReceiptDetail yang valid.
 */
export function createDocumentReceiptDetailFixture(
  overrides: DocumentReceiptDetailOverrides = {}
): CreateDocumentReceiptDetail {
  documentReceiptDetailCounter++

  return {
    documentReceiptId: overrides.documentReceiptId ?? crypto.randomUUID(),
    docTypeId: overrides.docTypeId ?? crypto.randomUUID(),
    subsidiaryId: overrides.subsidiaryId ?? crypto.randomUUID(),
    partnerId: overrides.partnerId ?? crypto.randomUUID(),
    nomorDoc: overrides.nomorDoc ?? `DOC-${documentReceiptDetailCounter}-${crypto.randomUUID().slice(0, 8)}`,
    nomorFaktur: overrides.nomorFaktur,
    nomorPl: overrides.nomorPl,
    nomorDo: overrides.nomorDo,
    nomorInv: overrides.nomorInv,
    nomorPv: overrides.nomorPv,
    nomorNota: overrides.nomorNota,
    description: overrides.description,
  }
}

export function resetDocumentReceiptDetailCounter(): void {
  documentReceiptDetailCounter = 0
}
