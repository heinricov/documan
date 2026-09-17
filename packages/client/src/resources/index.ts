import type { Http } from "../http"
import { createRolesResource } from "./roles"
import type { RolesResource } from "./roles"

export interface Resources {
  roles: RolesResource
}

export function createResources(http: Http): Resources {
  return {
    roles: createRolesResource(http),
  }
}

export type { RolesResource } from "./roles"
