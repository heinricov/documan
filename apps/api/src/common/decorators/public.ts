import { SetMetadata } from "@nestjs/common"

/**
 * ============================================================
 *  @Public() Metadata Decorator
 * ============================================================
 *
 * Tandai route sebagai public (tidak perlu autentikasi).
 * Diproses oleh AuthGuard — jika @Public() ada, guard skip verifikasi.
 *
 * @example
 * ```ts
 * @Public()
 * @Get("health")
 * health() { return { ok: true } }
 *
 * @Public()
 * @Post("auth/login")
 * login(@Body() body: LoginDto) { ... }
 * ```
 */
export const IS_PUBLIC_KEY = "isPublic"

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)