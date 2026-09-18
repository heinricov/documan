import { SetMetadata } from "@nestjs/common"

/**
 * ============================================================
 *  @Roles() Metadata Decorator
 * ============================================================
 *
 * Deklarasikan role mana yang boleh mengakses route.
 * Diproses oleh RolesGuard — yang mengecek role dari JWT payload.
 *
 * @example
 * ```ts
 * @Roles("admin")
 * @Delete(":id")
 * remove(@Param("id") id: string) { ... }
 *
 * @Roles("admin", "editor")
 * @Patch(":id")
 * update(@Param("id") id: string, @Body() body: UpdateDto) { ... }
 * ```
 */
export const ROLES_KEY = "roles"

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles)