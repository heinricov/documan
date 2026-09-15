import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
} from "@nestjs/common"
import { z } from "zod"
import { ValidationError } from "@packages/core"

/**
 * ============================================================
 *  Zod Parsing Helpers
 * ============================================================
 */

type ZodIssueLike = {
  path: PropertyKey[]
  message: string
}

export function toFieldErrors(error: { issues: ZodIssueLike[] }): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {}

  for (const issue of error.issues) {
    const path =
      issue.path.length > 0 ? issue.path.map(String).join(".") : "root"
    fieldErrors[path] = [...(fieldErrors[path] ?? []), issue.message]
  }

  return fieldErrors
}

/**
 * Parse nilai dengan zod schema. Gagal → ValidationError (dari @packages/core)
 * dengan fieldErrors per path, yang diterjemahkan filter global jadi 400.
 */
export function parseZodSchema<TSchema extends z.ZodType>(
  schema: TSchema,
  value: unknown
): z.output<TSchema> {
  const result = schema.safeParse(value)

  if (!result.success) {
    throw new ValidationError(
      "Validation failed",
      toFieldErrors(result.error)
    )
  }

  return result.data as z.output<TSchema>
}

/**
 * ============================================================
 *  PipeTransform
 * ============================================================
 */

/**
 * Pipe validasi berbasis zod untuk satu route.
 *
 * @example
 * ```ts
 * @Post()
 * @UsePipes(new ZodValidationPipe(CreateRoleSchema))
 * create(@Body() body: CreateRole) { ... }
 *
 * // Untuk query:
 * @Get()
 * findAll(@Query(new ZodValidationPipe(RoleQuerySchema)) query: RoleQuery) { ... }
 * ```
 */
@Injectable()
export class ZodValidationPipe<TSchema extends z.ZodType>
  implements PipeTransform<unknown, z.output<TSchema>>
{
  constructor(private readonly schema: TSchema) {}

  transform(
    value: unknown,
    _metadata: ArgumentMetadata
  ): z.output<TSchema> {
    return parseZodSchema(this.schema, value)
  }
}