import { createParamDecorator, type ExecutionContext } from "@nestjs/common"
import type { z } from "zod"
import { parseZodSchema } from "./pipes/zod-validation.pipe.js"

function valueFromContext(
  context: ExecutionContext,
  source: "body" | "query" | "params"
): unknown {
  const request = context.switchToHttp().getRequest()
  return request[source]
}

/**
 * ============================================================
 *  Zod Parameter Decorators
 * ============================================================
 *
 * Parse & validasi parameter request langsung dengan schema dari
 * @packages/validator (SSOT). Gagal → ValidationError (400).
 *
 * @example
 * ```ts
 * @Post()
 * create(@ZodBody(CreateRoleSchema) body: CreateRole) {
 *   // body sudah tervalidasi & typed
 * }
 *
 * @Get()
 * findAll(@ZodQuery(RoleQuerySchema) query: RoleQuery) { ... }
 *
 * @Get(":id")
 * findOne(@ZodParams(z.object({ id: z.string().uuid() })) params: { id: string }) { ... }
 * ```
 */
export const ZodBody = createParamDecorator(
  (schema: z.ZodType, context: ExecutionContext) =>
    parseZodSchema(schema, valueFromContext(context, "body"))
)

export const ZodQuery = createParamDecorator(
  (schema: z.ZodType, context: ExecutionContext) =>
    parseZodSchema(schema, valueFromContext(context, "query"))
)

export const ZodParams = createParamDecorator(
  (schema: z.ZodType, context: ExecutionContext) =>
    parseZodSchema(schema, valueFromContext(context, "params"))
)