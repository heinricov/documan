import type { Http } from "../http"
import { createRolesResource } from "./roles"
import type { RolesResource } from "./roles"
import { createUsersResource } from "./users"
import type { UsersResource } from "./users"
import { createSubsidiariesResource } from "./subsidiaries"
import type { SubsidiariesResource } from "./subsidiaries"
import { createDocTypesResource } from "./doc-types"
import type { DocTypesResource } from "./doc-types"
import { createPartnersResource } from "./partners"
import type { PartnersResource } from "./partners"
import { createAuthResource } from "./auth"
import type { AuthResource } from "./auth"

export interface Resources {
  auth: AuthResource
  roles: RolesResource
  users: UsersResource
  subsidiaries: SubsidiariesResource
  docTypes: DocTypesResource
  partners: PartnersResource
}

export function createResources(http: Http): Resources {
  return {
    auth: createAuthResource(http),
    roles: createRolesResource(http),
    users: createUsersResource(http),
    subsidiaries: createSubsidiariesResource(http),
    docTypes: createDocTypesResource(http),
    partners: createPartnersResource(http),
  }
}

export type { AuthResource, AuthResult } from "./auth"
export type { RolesResource } from "./roles"
export type { UsersResource } from "./users"
export type { SubsidiariesResource } from "./subsidiaries"
export type { DocTypesResource } from "./doc-types"
export type { PartnersResource } from "./partners"
