import { Controller, Get, HttpStatus, Res } from "@nestjs/common"
import type { Response } from "express"
import { prisma } from "@packages/db"
import { ErrorCode, errorResponse } from "@packages/core"
import { Public } from "../common/auth.js"

/**
 * ============================================================
 *  Health Controller
 * ============================================================
 *
 * `GET /health`       — liveness: proses hidup (tanpa menyentuh DB)
 * `GET /health/ready` — readiness: cek koneksi database
 *
 * Keduanya tidak butuh autentikasi (diproteksi @Public()).
 */

@Controller("health")
@Public()
export class HealthController {
  /** Liveness — server merespons */
  @Get()
  liveness() {
    return {
      status: "ok",
      uptime: process.uptime(),
      version: "1.0",
      timestamp: new Date().toISOString(),
    }
  }

  /** Readiness — database bisa diakses */
  @Get("ready")
  async readiness(@Res({ passthrough: true }) res: Response) {
    try {
      await prisma.$queryRaw`SELECT 1`
      return { status: "ready", database: "ok" }
    } catch {
      res.status(HttpStatus.SERVICE_UNAVAILABLE)
      // TransformInterceptor melewati object yang sudah punya `success`
      return errorResponse(
        ErrorCode.INTERNAL_ERROR,
        "Database unavailable"
      )
    }
  }
}