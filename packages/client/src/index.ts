/**
 * @packages/client
 *
 * Typed API client untuk memanggil API dengan type-safe + response validation.
 * Single source of truth untuk komunikasi web ↔ api menggunakan schemas dari @packages/validator.
 */

import { createClient } from "./client"

export { createClient }
export default createClient

export type { Client, ClientOptions, Resources } from "./client"
export type { AuthResource, AuthResult } from "./resources/index"
export type { RolesResource } from "./resources/index"
export type { UsersResource } from "./resources/index"
export type { SubsidiariesResource } from "./resources/index"
export type { DocTypesResource } from "./resources/index"
export type { PartnersResource } from "./resources/index"
export { ApiError, NetworkError, ResponseValidationError } from "./http"
export type { Http, HttpOptions } from "./http"
