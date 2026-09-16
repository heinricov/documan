/**
 * @packages/documentation
 *
 * OpenAPI / Swagger integration untuk NestJS API.
 * Setup dokumentasi, DocumentBuilder config, dan konversi zod → JSON Schema.
 */

// ====================== Setup ======================
export { setupSwagger } from "./setup.js"

// ====================== Config ======================
export { buildSwaggerConfig } from "./config.js"

export type { SwaggerConfigOptions } from "./config.js"

// ====================== Zod → OpenAPI ======================
export { zodToOpenApi } from "./zod-openapi.js"

export type { OpenApiSchema } from "./zod-openapi.js"

// ====================== Pagination ======================
export { paginatedOpenApiResponse } from "./pagination.js"