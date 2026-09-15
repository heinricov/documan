#!/usr/bin/env node

/**
 * Packages Scaffold Helper
 *
 * Location: scripts/packages-add.mjs
 *
 * Usage:
 *   pnpm packages:add <name> [options]
 *
 * Examples:
 *   pnpm packages:add db
 *   pnpm packages:add auth --description "Auth utilities"
 *   pnpm packages:add utils --deps zod date-fns
 *   pnpm packages:add config --dev
 */

import {
  existsSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
} from "node:fs"
import { resolve, join } from "node:path"
import { execSync } from "node:child_process"
import { parseArgs } from "node:util"

const ROOT = resolve(import.meta.dirname, "..")
const PACKAGES_DIR = join(ROOT, "packages")

// ====================== Helpers ======================

const colors = {
  cyan: (t) => `\x1b[36m${t}\x1b[0m`,
  green: (t) => `\x1b[32m${t}\x1b[0m`,
  red: (t) => `\x1b[31m${t}\x1b[0m`,
  yellow: (t) => `\x1b[33m${t}\x1b[0m`,
  dim: (t) => `\x1b[2m${t}\x1b[0m`,
  bold: (t) => `\x1b[1m${t}\x1b[0m`,
}

function log(msg) {
  console.log(`${colors.cyan("→")} ${msg}`)
}

function success(msg) {
  console.log(`${colors.green("✓")} ${msg}`)
}

function warn(msg) {
  console.log(`${colors.yellow("!")} ${msg}`)
}

function error(msg) {
  console.error(`${colors.red("✗")} ${msg}`)
  process.exit(1)
}

function run(cmd) {
  log(`Running: ${colors.dim(cmd)}`)
  try {
    execSync(cmd, { stdio: "inherit", cwd: ROOT, encoding: "utf8" })
  } catch {
    error(`Command failed: ${cmd}`)
  }
}

function write(filePath, content) {
  writeFileSync(filePath, content)
  success(`Created ${colors.dim(filePath.replace(ROOT + "/", ""))}`)
}

// ====================== Templates ======================

function createPackageJson({ name, description, isDev }) {
  const scopedName = `@workspace/${name}`

  const pkg = {
    name: scopedName,
    version: "0.0.0",
    private: true,
    type: "module",
    description: description || "",
    scripts: {
      lint: "eslint . --max-warnings 0",
      format: 'prettier --write "**/*.{ts,tsx,md}"',
      typecheck: "tsc --noEmit",
    },
    exports: {
      ".": "./src/index.ts",
      "./*": "./src/*.ts",
    },
    devDependencies: {
      "@configs/eslint": "workspace:*",
      "@configs/typescript": "workspace:*",
      "@types/node": "^20",
      eslint: "^9",
      typescript: "^5",
    },
  }

  // Hapus description kalau kosong biar rapi
  if (!pkg.description) delete pkg.description

  return JSON.stringify(pkg, null, 2) + "\n"
}

function createTsConfig() {
  return `{
  "extends": "@configs/typescript/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
`
}

function createSrcIndex(name) {
  return `/**
 * @workspace/${name}
 */

export function hello() {
  return "Hello from @workspace/${name}"
}
`
}

function createEslintConfig() {
  return `import { config } from "@configs/eslint/react-internal"

/** @type {import("eslint").Linter.Config} */
export default config
`
}

// ====================== Main ======================

function showHelp() {
  console.log(`
${colors.bold("Packages Scaffold Helper")}

${colors.cyan("Usage:")}
  pnpm packages:add <name> [options]

${colors.cyan("Examples:")}
  pnpm packages:add db
  pnpm packages:add auth --description "Authentication utilities"
  pnpm packages:add utils
  pnpm packages:add config --dry-run

${colors.cyan("Options:")}
  --description, -d   Deskripsi package
  --dry-run           Simulasi tanpa membuat file
  --help, -h          Tampilkan bantuan

${colors.cyan("Yang dibuat:")}
  packages/<name>/
  ├── src/
  │   └── index.ts
  ├── package.json
  ├── tsconfig.json
  └── eslint.config.js   (opsional, jika diperlukan)

${colors.dim("Package akan memakai scope @workspace/<name>")}
`)
}

function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      description: { type: "string", short: "d" },
      "dry-run": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: true,
    strict: true,
  })

  if (values.help || positionals.length === 0) {
    showHelp()
    process.exit(values.help ? 0 : 1)
  }

  const name = positionals[0].toLowerCase().replace(/[^a-z0-9-]/g, "")

  if (!name) {
    error("Nama package tidak valid. Gunakan huruf, angka, dan tanda hubung saja.")
  }

  if (name === "ui" || name === "eslint" || name === "typescript") {
    warn(`Nama "${name}" sudah dipakai oleh package internal. Lanjutkan dengan hati-hati.`)
  }

  const packageDir = join(PACKAGES_DIR, name)
  const srcDir = join(packageDir, "src")
  const dryRun = values["dry-run"]
  const description = values.description || ""

  if (existsSync(packageDir)) {
    error(`Folder packages/${name} sudah ada.`)
  }

  log(`Membuat package ${colors.bold(`@workspace/${name}`)}...`)

  if (dryRun) {
    log(`[dry-run] mkdir packages/${name}/src`)
    log(`[dry-run] create packages/${name}/package.json`)
    log(`[dry-run] create packages/${name}/tsconfig.json`)
    log(`[dry-run] create packages/${name}/src/index.ts`)
    log(`[dry-run] pnpm install`)
    success(`[dry-run] Selesai (tidak ada file yang dibuat)`)
    return
  }

  // 1. Buat folder
  mkdirSync(srcDir, { recursive: true })
  success(`Created packages/${name}/src/`)

  // 2. package.json
  write(
    join(packageDir, "package.json"),
    createPackageJson({ name, description })
  )

  // 3. tsconfig.json
  write(join(packageDir, "tsconfig.json"), createTsConfig())

  // 4. src/index.ts
  write(join(packageDir, "src/index.ts"), createSrcIndex(name))

  // 5. pnpm install agar workspace mengenali package baru
  log("Menjalankan pnpm install...")
  run("pnpm install")

  success(`Package ${colors.bold(`@workspace/${name}`)} berhasil dibuat!`)
  console.log(`
${colors.dim("Struktur:")}
  packages/${name}/
  ├── src/
  │   └── index.ts
  ├── package.json
  └── tsconfig.json

${colors.dim("Cara pakai di app lain:")}
  // package.json
  "@workspace/${name}": "workspace:*"

  // kode
  import { hello } from "@workspace/${name}"

${colors.dim("Jalankan typecheck:")}
  pnpm --filter @workspace/${name} typecheck
`)
}

main()
