import { readFileSync, existsSync } from "node:fs"
import { resolve, join } from "node:path"

/**
 * Find the root directory of the monorepo
 * by looking for pnpm-workspace.yaml
 */
function findRootDir(startDir: string): string {
  let dir = startDir

  while (dir !== "/") {
    if (existsSync(join(dir, "pnpm-workspace.yaml"))) {
      return dir
    }
    dir = resolve(dir, "..")
  }

  throw new Error("Could not find monorepo root (pnpm-workspace.yaml)")
}

/**
 * Parse a .env file content into a record
 */
function parseEnvFile(content: string): Record<string, string> {
  const env: Record<string, string> = {}

  const lines = content.split("\n")

  for (const line of lines) {
    const trimmed = line.trim()

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith("#")) {
      continue
    }

    // Find the first = sign
    const equalIndex = trimmed.indexOf("=")
    if (equalIndex === -1) {
      continue
    }

    const key = trimmed.slice(0, equalIndex).trim()
    let value = trimmed.slice(equalIndex + 1).trim()

    // Remove quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    env[key] = value
  }

  return env
}

/**
 * Load environment variables from root .env file
 * This will set variables in process.env
 */
export function loadEnv(): Record<string, string> {
  const rootDir = findRootDir(process.cwd())
  const envPath = join(rootDir, ".env")

  if (!existsSync(envPath)) {
    console.warn(`[configs/environment] .env file not found at: ${envPath}`)
    return {}
  }

  const content = readFileSync(envPath, "utf-8")
  const env = parseEnvFile(content)

  // Set environment variables
  for (const [key, value] of Object.entries(env)) {
    if (!(key in process.env)) {
      process.env[key] = value
    }
  }

  return env
}

/**
 * Get a specific environment variable from root .env
 * Without setting it in process.env
 */
export function getEnv(key: string): string | undefined {
  const rootDir = findRootDir(process.cwd())
  const envPath = join(rootDir, ".env")

  if (!existsSync(envPath)) {
    return undefined
  }

  const content = readFileSync(envPath, "utf-8")
  const env = parseEnvFile(content)

  return env[key]
}

/**
 * Get all environment variables from root .env
 * Without setting them in process.env
 */
export function getAllEnv(): Record<string, string> {
  const rootDir = findRootDir(process.cwd())
  const envPath = join(rootDir, ".env")

  if (!existsSync(envPath)) {
    return {}
  }

  const content = readFileSync(envPath, "utf-8")
  return parseEnvFile(content)
}
