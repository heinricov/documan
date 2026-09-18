import type { Http } from "../http"
import { createRolesResource } from "./roles"
import type { RolesResource } from "./roles"
import { createUsersResource } from "./users"
import type { UsersResource } from "./users"

export interface Resources {
  roles: RolesResource
  users: UsersResource
}

export function createResources(http: Http): Resources {
  return {
    roles: createRolesResource(http),
    users: createUsersResource(http),
  }
}

export type { RolesResource } from "./roles"
export type { UsersResource } from "./users"
