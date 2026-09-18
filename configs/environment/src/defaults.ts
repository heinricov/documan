/**
 * Default values untuk environment variables.
 * SSOT agar tidak ada fallback yang tersebar di berbagai file.
 */
export const envDefaults = {
  API_PORT: 3001,
  RATE_LIMIT_TTL_MS: 60_000,
  RATE_LIMIT_MAX: 100,
  JWT_EXPIRES_IN: "15m",
  JWT_ISSUER: "documan",
  LOG_LEVEL: "info",
} as const
