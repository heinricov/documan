import { ApiError, NetworkError } from "@packages/client"

export function getErrorMessage(
  error: unknown,
  defaultMessage = "Terjadi kesalahan. Silakan coba lagi."
): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof NetworkError) return "Tidak dapat terhubung ke server."
  if (error instanceof Error) return error.message
  return defaultMessage
}
