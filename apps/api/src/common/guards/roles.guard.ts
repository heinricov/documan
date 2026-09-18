import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { requireRole, type AuthContext } from "@packages/auth"
import { ROLES_KEY } from "../decorators/roles.js"

/**
 * ============================================================
 *  Roles Guard
 * ============================================================
 *
 * Guard yang mengecek role user dari JWT payload terhadap
 * daftar role yang diperlukan oleh route.
 *
 * Diproses SETELAH AuthGuard (yang mengisi `request.auth`).
 * Jika route tidak memiliki `@Roles()`, guard ini skip.
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
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Ambil roles yang dibutuhkan dari metadata
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    )

    // Jika tidak ada @Roles(), skip
    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const authContext = request.auth as AuthContext | undefined

    // AuthGuard harusnya sudah jalan — tapi safety check
    if (!authContext) {
      throw new ForbiddenException("Unauthorized — tidak ada auth context.")
    }

    const result = requireRole(authContext, { roles: requiredRoles })

    if (!result.ok) {
      throw new ForbiddenException(result.message)
    }

    return true
  }
}