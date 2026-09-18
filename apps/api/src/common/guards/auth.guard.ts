import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { getBearerToken, requireAuth, type AuthContext } from "@packages/auth"
import { IS_PUBLIC_KEY } from "../decorators/public.js"

/**
 * ============================================================
 *  Auth Guard
 * ============================================================
 *
 * Guard global — memverifikasi JWT Bearer token di setiap request.
 *
 * - Jika route memiliki `@Public()` → skip autentikasi.
 * - Jika token valid → isi `request.auth` dengan AuthContext.
 * - Jika token tidak valid / tidak ada → lempar UnauthorizedException.
 *
 * AuthContext tersedia via `@CurrentUser()` decorator di controller.
 *
 * @example
 * ```ts
 * // Public route
 * @Public()
 * @Get("health")
 * health() { return { ok: true } }
 *
 * // Protected route
 * @Get("me")
 * getMe(@CurrentUser() user: AuthContext) {
 *   return this.userService.findById(user.userId)
 * }
 * ```
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Cek apakah route ini public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (isPublic) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const token = getBearerToken(request.headers.authorization)

    const result = await requireAuth(token)

    if (!result.ok) {
      throw new UnauthorizedException(result.message)
    }

    // Simpan auth context di request untuk @CurrentUser()
    ;(request as { auth: AuthContext }).auth = result.context

    return true
  }
}