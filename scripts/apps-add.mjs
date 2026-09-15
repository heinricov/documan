#!/usr/bin/env node

/**
 * Apps Scaffold Helper
 *
 * Location: scripts/apps-add.mjs
 *
 * Usage:
 *   pnpm apps:add <framework> [args...]
 *
 * Examples:
 *   pnpm apps:add nest new my-api
 *   pnpm apps:add nest new my-api --strict --skip-git
 *   pnpm apps:add next my-web
 *   pnpm apps:add next my-web --ts --tailwind --app
 *   pnpm apps:add expo my-mobile
 *
 * Supported frameworks:
 *   nest    → @nestjs/cli  (nest new ...)
 *   next    → create-next-app
 *   expo    → create-expo-app
 *   remix   → create-remix
 *   vite    → create-vite
 *   custom  → jalankan perintah apapun di dalam apps/
 */

import { existsSync, mkdirSync } from "node:fs"
import { resolve, join } from "node:path"
import { execSync, spawn } from "node:child_process"
import { parseArgs } from "node:util"

const ROOT = resolve(import.meta.dirname, "..")
const APPS_DIR = join(ROOT, "apps")

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

/**
 * Jalankan perintah secara interaktif (stdio inherit)
 * agar prompt CLI muncul seperti biasa.
 */
function runInteractive(command, args, cwd) {
  return new Promise((resolve, reject) => {
    log(`Running: ${colors.dim(`${command} ${args.join(" ")}`)}`)
    log(`Cwd    : ${colors.dim(cwd)}\n`)

    const child = spawn(command, args, {
      cwd,
      stdio: "inherit", // penting: biar prompt interaktif muncul
      shell: true,
      env: { ...process.env },
    })

    child.on("close", (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Command exited with code ${code}`))
      }
    })

    child.on("error", (err) => {
      reject(err)
    })
  })
}

function ensureAppsDir() {
  if (!existsSync(APPS_DIR)) {
    mkdirSync(APPS_DIR, { recursive: true })
    log(`Folder apps/ dibuat`)
  }
}

// ====================== Framework Presets ======================

/**
 * Setiap framework punya:
 * - command: binary yang dijalankan (via pnpm dlx / npx)
 * - buildArgs: fungsi yang menerima sisa argumen user
 * - description
 */
const FRAMEWORKS = {
  nest: {
    description: "NestJS application (nest new)",
    // nest new <name> [options]
    command: "pnpm",
    buildArgs: (args) => {
      // args contoh: ["new", "my-api", "--strict"]
      // kita pakai dlx supaya tidak perlu install global
      return ["dlx", "@nestjs/cli", ...args]
    },
    // Nest secara default membuat folder di cwd
    // jadi kita jalankan di dalam apps/
    cwd: APPS_DIR,
  },

  next: {
    description: "Next.js application (create-next-app)",
    command: "pnpm",
    buildArgs: (args) => {
      // args contoh: ["my-web", "--ts", "--tailwind"]
      return ["dlx", "create-next-app@latest", ...args]
    },
    cwd: APPS_DIR,
  },

  expo: {
    description: "Expo (React Native) application",
    command: "pnpm",
    buildArgs: (args) => {
      return ["dlx", "create-expo-app@latest", ...args]
    },
    cwd: APPS_DIR,
  },

  remix: {
    description: "Remix application",
    command: "pnpm",
    buildArgs: (args) => {
      return ["dlx", "create-remix@latest", ...args]
    },
    cwd: APPS_DIR,
  },

  vite: {
    description: "Vite application",
    command: "pnpm",
    buildArgs: (args) => {
      return ["dlx", "create-vite@latest", ...args]
    },
    cwd: APPS_DIR,
  },

  /**
   * Custom: jalankan perintah apapun di dalam apps/
   * Contoh: pnpm apps:add custom npx some-generator my-app
   */
  custom: {
    description: "Jalankan perintah custom di dalam apps/",
    command: null, // akan diambil dari args[0]
    buildArgs: (args) => args.slice(1),
    cwd: APPS_DIR,
    isCustom: true,
  },
}

// ====================== Main ======================

function showHelp() {
  console.log(`
${colors.bold("Apps Scaffold Helper")}

${colors.cyan("Usage:")}
  pnpm apps:add <framework> [args...]

${colors.cyan("Supported frameworks:")}
${Object.entries(FRAMEWORKS)
  .map(([key, fw]) => `  ${colors.bold(key.padEnd(10))} ${fw.description}`)
  .join("\n")}

${colors.cyan("Examples:")}
  ${colors.dim("# NestJS")}
  pnpm apps:add nest new my-api
  pnpm apps:add nest new my-api --strict --skip-git

  ${colors.dim("# Next.js")}
  pnpm apps:add next my-web
  pnpm apps:add next my-web --ts --tailwind --app --src-dir

  ${colors.dim("# Expo")}
  pnpm apps:add expo my-mobile

  ${colors.dim("# Vite")}
  pnpm apps:add vite my-app

  ${colors.dim("# Custom command di dalam apps/")}
  pnpm apps:add custom npx some-generator my-app

${colors.cyan("Notes:")}
  - Semua app baru akan dibuat di dalam folder ${colors.bold("apps/")}
  - Karena pnpm-workspace.yaml sudah berisi "apps/*", app baru otomatis menjadi workspace
  - Prompt interaktif dari CLI (Nest, create-next-app, dll) akan muncul seperti biasa
`)
}

async function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: true,
    strict: false, // biar argumen framework ( --strict, --ts, dll) tidak error
  })

  if (values.help || positionals.length === 0) {
    showHelp()
    process.exit(values.help ? 0 : 1)
  }

  const frameworkKey = positionals[0].toLowerCase()
  const frameworkArgs = positionals.slice(1)

  const framework = FRAMEWORKS[frameworkKey]

  if (!framework) {
    error(
      `Framework "${frameworkKey}" tidak dikenali.\n` +
        `Framework yang didukung: ${Object.keys(FRAMEWORKS).join(", ")}\n` +
        `Jalankan "pnpm apps:add --help" untuk melihat bantuan.`
    )
  }

  ensureAppsDir()

  let command = framework.command
  let args = framework.buildArgs(frameworkArgs)

  // Handle custom
  if (framework.isCustom) {
    if (frameworkArgs.length === 0) {
      error(`Untuk "custom", berikan perintah yang ingin dijalankan.\nContoh: pnpm apps:add custom npx create-something my-app`)
    }
    command = frameworkArgs[0]
    args = frameworkArgs.slice(1)
  }

  try {
    await runInteractive(command, args, framework.cwd)
    success(`Selesai membuat app dengan ${colors.bold(frameworkKey)}`)
    console.log(`
${colors.dim("Langkah berikutnya:")}
  1. Cek folder apps/ untuk melihat hasil generate
  2. Sesuaikan name di package.json app baru (opsional)
  3. Jalankan ${colors.bold("pnpm install")} jika diperlukan
  4. Jalankan app dengan ${colors.bold("pnpm --filter <nama-app> dev")}
`)
  } catch (err) {
    error(`Gagal menjalankan generator: ${err.message}`)
  }
}

main()
