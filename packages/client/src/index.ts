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
export type { RolesResource } from "./resources/index"
export { ApiError, NetworkError, ValidationError } from "./http"
export type { Http, HttpOptions } from "./http"