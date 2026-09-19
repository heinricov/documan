import { Controller, Get, Post, Inject, HttpCode } from "@nestjs/common"
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBearerAuth,
} from "@nestjs/swagger"
import { Public, CurrentUser } from "../../common/auth.js"
import type { AuthContext } from "@packages/auth"
import { ZodBody } from "../../common/zod.decorators.js"
import {
  LoginSchema,
  type LoginBody,
} from "./auth.validator.js"
import {
  loginSchema,
  authResponseSchema,
  userSchema,
} from "./auth.swagger.js"
import { AuthService } from "./auth.service.js"

/**
 * ============================================================
 *  Auth Controller
 * ============================================================
 *
 * Endpoint autentikasi: login, me.
 * - login adalah public (tidak perlu token).
 * - me memerlukan autentikasi (Bearer JWT).
 * - User baru dibuat oleh admin via POST /users.
 */
@Controller("auth")
@ApiTags("auth")
export class AuthController {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService
  ) {}

  @Post("login")
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: "Login dengan email & password" })
  @ApiBody({ schema: loginSchema })
  @ApiOkResponse({
    description: "Login berhasil — mengembalikan token & user data",
    schema: authResponseSchema,
  })
  @ApiResponse({ status: 401, description: "Email atau password salah" })
  login(@ZodBody({ zod: LoginSchema }) body: LoginBody) {
    return this.authService.login(body)
  }

  @Get("me")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Ambil data user yang sedang login" })
  @ApiOkResponse({
    description: "Data user saat ini",
    schema: userSchema,
  })
  @ApiResponse({ status: 401, description: "Unauthorized — token tidak valid" })
  getMe(@CurrentUser() auth: AuthContext) {
    return this.authService.getMe(auth.userId)
  }
}