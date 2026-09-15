import { DocumentBuilder } from "@nestjs/swagger"
import type { OpenAPIObject } from "@nestjs/swagger"

/**
 * ============================================================
 *  Types
 * ============================================================
 */

export interface SwaggerConfigOptions {
  /** Judul API — default "Documan API" */
  title?: string
  /** Deskripsi API */
  description?: string
  /** Versi API — default "1.0" */
  version?: string
  /** Tambahkan security scheme Bearer (JWT) — default true */
  bearerAuth?: boolean
  /** Path untuk mengakses dokumentasi — default "docs" */
  path?: string
}

/**
 * ============================================================
 *  Document Builder
 * ============================================================
 */

/**
 * Membangun OpenAPI config dari @nestjs/swagger DocumentBuilder.
 * Hasilnya siap dilempar ke SwaggerModule.createDocument().
 *
 * @example
 * ```ts
 * import { buildSwaggerConfig } from "@packages/documentation"
 * import { SwaggerModule } from "@nestjs/swagger"
 *
 * const config = buildSwaggerConfig({ title: "My API" })
 * const document = SwaggerModule.createDocument(app, config)
 * ```
 */
export function buildSwaggerConfig(
  options: SwaggerConfigOptions = {}
): Omit<OpenAPIObject, "paths"> {
  const {
    title = "Documan API",
    description,
    version = "1.0",
    bearerAuth = true,
  } = options

  const builder = new DocumentBuilder()

  builder.setTitle(title).setVersion(version)

  if (description) {
    builder.setDescription(description)
  }

  if (bearerAuth) {
    builder.addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Masukkan JWT access token",
      },
      "access-token"
    )
  }

  return builder.build()
}