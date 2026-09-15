import type { z } from "zod"

/**
 * ============================================================
 *  OpenAPI JSON Schema types
 * ============================================================
 */

export interface OpenApiSchema {
  type?: string
  format?: string
  enum?: unknown[]
  const?: unknown
  items?: OpenApiSchema
  properties?: Record<string, OpenApiSchema>
  required?: string[]
  additionalProperties?: boolean | OpenApiSchema
  anyOf?: OpenApiSchema[]
  nullable?: boolean
  description?: string
  default?: unknown
  [key: string]: unknown
}

/**
 * ============================================================
 *  zod v4 internal access
 * ============================================================
 *
 * zod v4 (>= 4.4) menyimpan metadata type di `schema._zod.def`:
 *   - `def.type`       — string literal ("string", "object", ...)
 *   - `def.shape`      — untuk object: `Record<key, schema>`
 *   - `def.innerType`  — untuk optional/nullable/default
 *   - `def.element`    — untuk array
 *   - `def.entries`    — untuk enum
 *   - `def.options`    — untuk union
 *   - `def.description`— dari `.describe()`
 *   - `_zod.traits`    — Set berisi nama format (mis. "$ZodUUID")
 *
 * Ini satu-satunya alat konversi zod → JSON Schema yang stabil di v4.4
 * (z.toJSONSchema belum tersedia di release ini).
 */

type ZodInternalSchema = z.ZodType & {
  _zod: {
    def: Record<string, unknown>
    traits?: Set<string>
    [key: string]: unknown
  }
}

function defOf(schema: unknown): Record<string, unknown> | undefined {
  return (schema as ZodInternalSchema | undefined)?._zod?.def
}

function hasTrait(schema: unknown, name: string): boolean {
  return (schema as ZodInternalSchema | undefined)?._zod?.traits?.has(name) ?? false
}

function formatFromTraits(schema: unknown): string | undefined {
  if (hasTrait(schema, "$ZodUUID")) return "uuid"
  if (hasTrait(schema, "$ZodCUID")) return "cuid"
  if (hasTrait(schema, "$ZodULID")) return "ulid"
  if (hasTrait(schema, "$ZodEmail")) return "email"
  if (hasTrait(schema, "$ZodURL")) return "uri"
  if (hasTrait(schema, "$ZodIPv4")) return "ipv4"
  if (hasTrait(schema, "$ZodIPv6")) return "ipv6"
  if (hasTrait(schema, "$ZodISODate")) return "date"
  if (hasTrait(schema, "$ZodISODateTime")) return "date-time"
  if (hasTrait(schema, "$ZodISOTime")) return "time"
  if (hasTrait(schema, "$ZodDate")) return "date-time"
  return undefined
}

/**
 * ============================================================
 *  Converter
 * ============================================================
 */

/**
 * Konversi zod schema menjadi JSON Schema yang bisa dipakai
 * decorator Swagger (`schema:` di `@ApiBody`, `@ApiOkResponse`, dll).
 *
 * Tidak melempar error untuk tipe yang tidak dikenal — fallback ke
 * `{}` (any schema) agar dokumentasi tetap tampil.
 *
 * @example
 * ```ts
 * import { ApiBody } from "@nestjs/swagger"
 * import { zodToOpenApi } from "@packages/documentation"
 * import { CreateRoleSchema } from "@packages/validator"
 *
 * @ApiBody({ schema: zodToOpenApi(CreateRoleSchema) })
 * ```
 */
export function zodToOpenApi(schema: z.ZodType): OpenApiSchema {
  const def = defOf(schema)

  if (!def) {
    return {}
  }

  const base = descriptionOf(def)

  switch (def.type) {
    case "string": {
      return { ...base, type: "string", format: formatFromTraits(schema) }
    }

    case "number": {
      return { ...base, type: "number" }
    }

    case "integer": {
      return { ...base, type: "integer" }
    }

    case "bigint": {
      return { ...base, type: "integer" }
    }

    case "boolean": {
      return { ...base, type: "boolean" }
    }

    case "date": {
      return { ...base, type: "string", format: "date-time" }
    }

    case "null": {
      return { ...base, type: "null" }
    }

    case "literal": {
      const values = def.values as unknown[]
      return { ...base, const: values[0] }
    }

    case "enum": {
      const entries = def.entries as Record<string, string | number>
      const values = Object.values(entries)
      return { ...base, type: values.some(isNumber) ? "number" : "string", enum: values }
    }

    case "array": {
      return {
        ...base,
        type: "array",
        items: zodToOpenApi(def.element as z.ZodType),
      }
    }

    case "object": {
      const shape = def.shape as Record<string, z.ZodType>
      const properties: Record<string, OpenApiSchema> = {}
      const required: string[] = []

      for (const [key, field] of Object.entries(shape)) {
        properties[key] = zodToOpenApi(field)
        if (!field.isOptional() && !hasTrait(field, "$ZodDefault")) {
          required.push(key)
        }
      }

      return {
        ...base,
        type: "object",
        properties,
        ...(required.length > 0 ? { required } : {}),
        additionalProperties: false,
      }
    }

    case "record": {
      return {
        ...base,
        type: "object",
        additionalProperties: zodToOpenApi(def.valueType as z.ZodType),
      }
    }

    case "optional": {
      // Optional hanya memengaruhi `required` pada object — di sini
      // cukup teruskan skema dalam.
      return zodToOpenApi(def.innerType as z.ZodType)
    }

    case "default": {
      return {
        ...zodToOpenApi(def.innerType as z.ZodType),
        default: def.defaultValue as unknown,
      }
    }

    case "nullable": {
      return {
        anyOf: [zodToOpenApi(def.innerType as z.ZodType), { type: "null" }],
        nullable: true,
      }
    }

    case "union": {
      const options = def.options as z.ZodType[]
      return { anyOf: options.map((option) => zodToOpenApi(option)) }
    }

    default: {
      return { ...base }
    }
  }
}

function descriptionOf(def: { [key: string]: unknown }): OpenApiSchema {
  const description = typeof def.description === "string" ? def.description : undefined
  const deprecated =
    typeof def.deprecated === "boolean" ? { deprecated: def.deprecated } : {}
  return { ...(description ? { description } : {}), ...deprecated }
}

function isNumber(value: unknown): boolean {
  return typeof value === "number"
}