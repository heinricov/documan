import type { Http } from "../http"
import { createRolesResource } from "./roles"
import type { RolesResource } from "./roles"
import { createUsersResource } from "./users"
import type { UsersResource } from "./users"
import { createSubsidiariesResource } from "./subsidiaries"
import type { SubsidiariesResource } from "./subsidiaries"

export interface Resources {
  roles: RolesResource
  users: UsersResource
  subsidiaries: SubsidiariesResource
}

export function createResources(http: Http): Resources {
  return {
    roles: createRolesResource(http),
    users: createUsersResource(http),
    subsidiaries: createSubsidiariesResource(http),
  }
}

export type { RolesResource } from "./roles"
export type { UsersResource } from "./users"
export type { SubsidiariesResource } from "./subsidiaries"
