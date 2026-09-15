import type { Http } from "../http.js"
import { createRolesResource } from "./roles.js"
import type { RolesResource } from "./roles.js"

export interface Resources {
  roles: RolesResource
}

export function createResources(http: Http): Resources {
  return {
    roles: createRolesResource(http),
  }
}

export type { RolesResource } from "./roles.js"