export type FieldErrors = Record<string, string>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySchema = { safeParse: (data: any) => any }

/**
 * Map Zod safeParse errors ke object { fieldName: errorMessage }.
 * Berguna untuk form yang perlu tampilkan error per field.
 */
export function mapSchemaErrors(
  result: { success: boolean; error?: { issues: Array<{ path: (string | number)[]; message: string }> } },
  fieldNames: string[]
): FieldErrors {
  if (result.success) return {}
  if (!result.error) return {}

  const errors: FieldErrors = {}
  for (const issue of result.error.issues) {
    const key = issue.path[0]
    if (typeof key === "string" && fieldNames.includes(key)) {
      errors[key] = issue.message
    }
  }
  return errors
}

/**
 * Validate data dengan schema, return field errors atau null jika valid.
 */
export function validateForm(
  schema: AnySchema,
  data: unknown,
  fieldNames: string[]
): FieldErrors | null {
  const result = schema.safeParse(data)
  if (result.success) return null
  return mapSchemaErrors(result, fieldNames)
}
