import { Controller, Get, Post, Inject } from "@nestjs/common"
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
  RegisterSchema,
  type LoginBody,
  type RegisterBody,
} from "./auth.validator.js"
import {
  loginSchema,
  registerSchema,
  authResponseSchema,
  userSchema,
} from "./auth.swagger.js"
import { AuthService } from "./auth.service.js"

/**
 * ============================================================
 *  Auth Controller
 * ============================================================
 *
 * Endpoint autentikasi: login, register, me.
 * - login & register adalah public (tidak perlu token).
 * - me memerlukan autentikasi (Bearer JWT).
 */
@Controller("auth")
@ApiTags("auth")
export class AuthController {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService
  ) {}

  @Post("login")
  @Public()
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

  @Post("register")
  @Public()
  @ApiOperation({ summary: "Register akun baru" })
  @ApiBody({ schema: registerSchema })
  @ApiOkResponse({
    description: "Register berhasil — mengembalikan token & user data",
    schema: authResponseSchema,
  })
  @ApiResponse({ status: 409, description: "Username atau email sudah ada" })
  register(@ZodBody({ zod: RegisterSchema }) body: RegisterBody) {
    return this.authService.register(body)
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