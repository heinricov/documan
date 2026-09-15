/**
 * @packages/client
 *
 * Typed API client untuk memanggil API dengan type-safe + response validation.
 * Single source of truth untuk komunikasi web ↔ api menggunakan schemas dari @packages/validator.
 */

import { createClient } from "./client.js"

export { createClient }
export default createClient

export type { Client, ClientOptions, Resources } from "./client.js"
export type { RolesResource } from "./resources/index.js"
export { ApiError, NetworkError, ValidationError } from "./http.js"
export type { Http, HttpOptions } from "./http.js"