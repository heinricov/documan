import { SwaggerModule } from "@nestjs/swagger"
import type { INestApplication } from "@nestjs/common"
import {
  buildSwaggerConfig,
  type SwaggerConfigOptions,
} from "./config.js"

/**
 * ============================================================
 *  Setup
 * ============================================================
 */

/**
 * Mengaktifkan Swagger UI untuk aplikasi NestJS.
 *
 * @example
 * ```ts
 * // main.ts
 * import { NestFactory } from "@nestjs/core"
 * import { setupSwagger } from "@packages/documentation"
 *
 * const app = await NestFactory.create(AppModule)
 *
 * if (process.env.NODE_ENV !== "production") {
 *   setupSwagger(app, { title: "Documan API" })
 *   // UI tersedia di http://localhost:3001/docs
 * }
 * ```
 */
export function setupSwagger(
  app: INestApplication,
  options: SwaggerConfigOptions = {}
): void {
  const { path = "docs", ...configOptions } = options

  const config = buildSwaggerConfig(configOptions)
  const document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup(path, app, document)
}