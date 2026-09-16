import { NestFactory } from "@nestjs/core"
import helmet from "helmet"
import type { Request, Response, NextFunction } from "express"
import { loadEnv, validateEnv } from "@configs/environment"
import { setupSwagger } from "@packages/documentation"
import {
  buildHttpContext,
  createLogger,
  withLogContext,
} from "@packages/logger"
import { AppModule } from "./app.module.js"
import { HttpExceptionFilter } from "./common/filters/http-exception.filter.js"
import { TransformInterceptor } from "./common/interceptors/transform.interceptor.js"
import { NestLoggerAdapter } from "./common/logger/nest-logger.adapter.js"

const logger = createLogger({ service: "api" })

function corsOrigins(): boolean | string | string[] {
  const raw = process.env.CORS_ORIGIN?.trim()

  if (!raw || raw === "*") return true

  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
}

async function bootstrap() {
  // Load .env dari root monorepo (cari pnpm-workspace.yaml)
  loadEnv()

  // Fail-fast: tolak konfigurasi tidak aman sebelum server hidup
  for (const warning of validateEnv({
    required: ["DATABASE_URL"],
    jwt: { minLength: 32 },
    cors: true,
  })) {
    logger.warn(warning)
  }

  const app = await NestFactory.create(AppModule)

  // Matikan proses secara graceful pada SIGTERM/SIGINT
  app.enableShutdownHooks()

  // Satu hop di belakang proxy agar IP benar (dipakai rate limiter)
  const expressApp = app.getHttpAdapter().getInstance() as {
    set: (name: string, value: unknown) => void
  }
  expressApp.set("trust proxy", 1)

  // Logger terpusat (pino) + request context
  app.useLogger(new NestLoggerAdapter(logger))
  app.use((req: Request, res: Response, next: NextFunction) => {
    const context = buildHttpContext(req)
    if (context.requestId) {
      res.setHeader("x-request-id", context.requestId)
    }
    void withLogContext(context, () => next())
  })

  // CORS
  app.enableCors({
    origin: corsOrigins(),
    credentials: true,
  })

  // Security headers
  app.use(helmet())

  // Response pipeline global — semua respons seragam @packages/core
  app.useGlobalFilters(new HttpExceptionFilter())
  app.useGlobalInterceptors(new TransformInterceptor())

  // Dokumentasi OpenAPI (dev only)
  if (process.env.NODE_ENV !== "production") {
    setupSwagger(app, {
      title: "Documan API",
      description: "REST API untuk aplikasi Documan",
      version: "1.0",
    })
    logger.info("Swagger UI tersedia di /docs")
  }

  const port = Number(process.env.API_PORT) || 3001
  await app.listen(port)

  logger.info(`API running on http://localhost:${port}`)
}

await bootstrap()