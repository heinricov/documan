import { UserSchema, CreateUserSchema, UpdateUserSchema } from "@packages/validator"
import { zodToOpenApi, paginatedOpenApiResponse } from "@packages/documentation"

/**
 * ============================================================
 *  Swagger Schema Utk Users
 * ============================================================
 *
 * Item users memakai zodToOpenApi dari schema validator (SSOT).
 * Pagination memakai helper generik @packages/documentation.
 */

export const userSchema = zodToOpenApi(UserSchema)
export const createUserSchema = zodToOpenApi(CreateUserSchema)
export const updateUserSchema = zodToOpenApi(UpdateUserSchema)
export const paginatedUserSchema = paginatedOpenApiResponse(userSchema)
