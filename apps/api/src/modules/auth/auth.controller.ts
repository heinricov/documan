import { Controller, Get, Post, Inject, HttpCode, Req, Res } from "@nestjs/common"
import type { Request, Response } from "express"
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
  refreshResponseSchema,
} from "./auth.swagger.js"
import { AuthService } from "./auth.service.js"
import { UnauthorizedException } from "@nestjs/common"

/**
 * ============================================================
 *  Auth Controller
 * ============================================================
 *
 * Endpoint autentikasi: login, me, refresh, logout.
 * - login adalah public (tidak perlu token).
 * - me memerlukan autentikasi (Bearer JWT).
 * - refresh membaca refresh token dari HttpOnly cookie.
 * - logout menghapus refresh token cookie.
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
    description: "Login berhasil — mengembalikan access token & user data. Refresh token diset sebagai HttpOnly cookie.",
    schema: authResponseSchema,
  })
  @ApiResponse({ status: 401, description: "Email atau password salah" })
  async login(
    @ZodBody({ zod: LoginSchema }) body: LoginBody,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.login(body)

    // Generate refresh token and set as HttpOnly cookie
    const refreshToken = await this.authService.generateRefreshToken(result.user.id)
    this.setRefreshTokenCookie(res, refreshToken)

    return {
      accessToken: result.accessToken,
      user: result.user,
    }
  }

  @Post("refresh")
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: "Refresh access token menggunakan refresh token dari HttpOnly cookie" })
  @ApiOkResponse({
    description: "Token berhasil diperbarui — mengembalikan access token baru",
    schema: refreshResponseSchema,
  })
  @ApiResponse({ status: 401, description: "Refresh token tidak valid atau expired" })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    // Read refresh token from cookie
    const refreshToken = req.cookies?.refresh_token

    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token tidak ditemukan")
    }

    const newAccessToken = await this.authService.refresh(refreshToken)

    if (!newAccessToken) {
      // Clear invalid refresh token cookie
      this.clearRefreshTokenCookie(res)
      throw new UnauthorizedException("Refresh token tidak valid atau expired")
    }

    return { accessToken: newAccessToken }
  }

  @Post("logout")
  @HttpCode(200)
  @ApiOperation({ summary: "Logout — hapus refresh token" })
  @ApiOkResponse({ description: "Logout berhasil" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async logout(
    @CurrentUser() auth: AuthContext,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    // Read refresh token from cookie
    const refreshToken = req.cookies?.refresh_token

    if (refreshToken) {
      await this.authService.removeRefreshToken(refreshToken)
    }

    // Clear cookie
    this.clearRefreshTokenCookie(res)

    return { message: "Logout berhasil" }
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

  /**
   * Set refresh token as HttpOnly cookie.
   */
  private setRefreshTokenCookie(res: Response, token: string): void {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/auth",
      maxAge: this.getCookieMaxAge(),
    }
    res.cookie("refresh_token", token, cookieOptions)
  }

  /**
   * Clear refresh token cookie.
   */
  private clearRefreshTokenCookie(res: Response): void {
    res.cookie("refresh_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/auth",
      maxAge: 0,
    })
  }

  /**
   * Get cookie max age in seconds from env.
   */
  private getCookieMaxAge(): number {
    const expiry = process.env.REFRESH_TOKEN_EXPIRES_IN ?? "7d"
    return this.parseExpiry(expiry)
  }

  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/)
    if (!match) return 7 * 24 * 60 * 60 // default 7d in seconds

    const value = parseInt(match[1], 10)
    const unit = match[2]

    switch (unit) {
      case "s":
        return value
      case "m":
        return value * 60
      case "h":
        return value * 60 * 60
      case "d":
        return value * 24 * 60 * 60
      default:
        return 7 * 24 * 60 * 60
    }
  }
}