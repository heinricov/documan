import { createParamDecorator, type ExecutionContext } from "@nestjs/common"
import type { z } from "zod"
import { parseZodSchema } from "./pipes/zod-validation.pipe.js"

/**
 * ============================================================
 *  Zod Parameter Decorators
 * ============================================================
 *
 * Parse & validasi parameter request langsung dengan schema dari
 * @packages/validator (SSOT). Gagal → ValidationError (400).
 *
 * NOTE: schema TIDAK boleh dikirim langsung maupun lewat `{ schema }`:
 * - ZodObject punya method `transform()` → dianggap PipeTransform.
 * - objek `{ schema }` → dianggap `ParameterDecoratorOptions` Nest 12.
 *   Kedua kasus membuat data akhir menjadi `undefined`.
 * Solusinya: bungkus dalam objek dengan key netral `zod`.
 *
 * @example
 * ```ts
 * @Post()
 * create(@ZodBody({ zod: CreateRoleSchema }) body: CreateRole) { ... }
 *
 * @Get()
 * findAll(@ZodQuery({ zod: RoleQuerySchema }) query: RoleQuery) { ... }
 *
 * @Get(":id")
 * findOne(@ZodParams({ zod: roleIdParams }) params: { id: string }) { ... }
 * ```
 */

interface ZodSchema {
  zod: z.ZodType
}

function valueFromContext(
  context: ExecutionContext,
  source: "body" | "query" | "params"
): unknown {
  const request = context.switchToHttp().getRequest()
  return request[source]
}

function parseWithSchema(
  data: ZodSchema | undefined,
  context: ExecutionContext,
  source: "body" | "query" | "params"
): unknown {
  if (!data?.zod) {
    throw new Error(
      `[zod.decorators] gunakan bentuk { zod: MySchema } pada @Zod${
        source.charAt(0).toUpperCase() + source.slice(1)
      }`
    )
  }
  return parseZodSchema(data.zod, valueFromContext(context, source))
}

export const ZodBody = createParamDecorator(
  (data: ZodSchema, context: ExecutionContext) =>
    parseWithSchema(data, context, "body")
)

export const ZodQuery = createParamDecorator(
  (data: ZodSchema, context: ExecutionContext) =>
    parseWithSchema(data, context, "query")
)

export const ZodParams = createParamDecorator(
  (data: ZodSchema, context: ExecutionContext) =>
    parseWithSchema(data, context, "params")
)