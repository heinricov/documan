import { createParamDecorator, type ExecutionContext } from "@nestjs/common"
import type { AuthContext } from "@packages/auth"

/**
 * ============================================================
 *  @CurrentUser() Parameter Decorator
 * ============================================================
 *
 * Extract AuthContext dari request object yang sudah diisi oleh AuthGuard.
 *
 * @example
 * ```ts
 * @Get("me")
 * getMe(@CurrentUser() user: AuthContext) {
 *   return this.userService.findById(user.userId)
 * }
 *
 * @Get("me")
 * getMe(@CurrentUser("userId") userId: string) {
 *   return this.userService.findById(userId)
 * }
 * ```
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthContext | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest()
    const authContext = request.auth as AuthContext | undefined

    if (!authContext) {
      throw new Error(
        "[CurrentUser] AuthContext tidak ditemukan di request. " +
          "Pastikan AuthGuard terdaftar sebelum decorator ini digunakan."
      )
    }

    return data ? authContext[data] : authContext
  }
)