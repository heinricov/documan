#!/usr/bin/env node

/**
 * Scripts List Helper
 *
 * Location: scripts/scripts-list.mjs
 *
 * Usage:
 *   pnpm scripts:list
 *   pnpm scripts:list --help
 */

import { readFileSync, existsSync } from "node:fs"
import { resolve, join } from "node:path"

const ROOT = resolve(import.meta.dirname, "..")
const ROOT_PKG = join(ROOT, "package.json")

const colors = {
  cyan: (t) => `\x1b[36m${t}\x1b[0m`,
  green: (t) => `\x1b[32m${t}\x1b[0m`,
  yellow: (t) => `\x1b[33m${t}\x1b[0m`,
  dim: (t) => `\x1b[2m${t}\x1b[0m`,
  bold: (t) => `\x1b[1m${t}\x1b[0m`,
  magenta: (t) => `\x1b[35m${t}\x1b[0m`,
}

const COMMANDS = [
  {
    group: "Catalog",
    items: [
      {
        cmd: "pnpm catalog:add <pkg...> [--use <ws...>] [options]",
        desc: "Tambah package ke pnpm catalog + update package.json target",
        examples: [
          "pnpm catalog:add react-icons --use apps/web packages/ui",
          "pnpm catalog:add zod date-fns --use packages/ui --dev",
          "pnpm catalog:add --list",
        ],
      },
      {
        cmd: "pnpm catalog:remove <pkg...> [--dir <ws...>] [options]",
        desc: "Hapus package dari catalog + bersihkan package.json target",
        examples: [
          "pnpm catalog:remove react-icons --dir apps/web packages/ui",
          "pnpm catalog:remove zod --dir packages/ui",
        ],
      },
    ],
  },
  {
    group: "Apps",
    items: [
      {
        cmd: "pnpm apps:add <framework> [args...]",
        desc: "Scaffold aplikasi baru di folder apps/ (nest, next, expo, vite, ...)",
        examples: [
          "pnpm apps:add nest new my-api",
          "pnpm apps:add next my-web --ts --tailwind",
          "pnpm apps:add expo my-mobile",
        ],
      },
    ],
  },
  {
    group: "Packages",
    items: [
      {
        cmd: "pnpm packages:add <name> [options]",
        desc: "Buat shared package baru di packages/ (@packages/<name>)",
        examples: [
          "pnpm packages:add db",
          "pnpm packages:add auth --description \"Auth utilities\"",
        ],
      },
    ],
  },
  {
    group: "Scripts",
    items: [
      {
        cmd: "pnpm scripts:list",
        desc: "Tampilkan daftar semua perintah helper monorepo",
        examples: [],
      },
    ],
  },
  {
    group: "Git",
    items: [
      {
        cmd: 'pnpm git:push "pesan commit" [options]',
        desc: "git add . → git commit → git push dalam satu perintah",
        examples: [
          'pnpm git:push "feat: add catalog scripts"',
          'pnpm git:push "chore: update deps" --no-push',
        ],
      },
    ],
  },
]

function showList() {
  console.log(`
${colors.bold("Documan Monorepo Scripts")}
${colors.dim("Helper commands untuk mengelola catalog, apps, dan packages")}
`)

  // Cek apakah script sudah terdaftar di package.json
  let registered = {}
  if (existsSync(ROOT_PKG)) {
    try {
      const pkg = JSON.parse(readFileSync(ROOT_PKG, "utf8"))
      registered = pkg.scripts || {}
    } catch {
      // ignore
    }
  }

  for (const section of COMMANDS) {
    console.log(colors.magenta(`▸ ${section.group}`))
    console.log()

    for (const item of section.items) {
      // Ambil nama script (catalog:add, apps:add, dll)
      const scriptName = item.cmd.split(" ")[1] // "catalog:add"
      const isRegistered = scriptName in registered

      const status = isRegistered
        ? colors.green("●")
        : colors.yellow("○")

      console.log(`  ${status} ${colors.bold(item.cmd)}`)
      console.log(`    ${colors.dim(item.desc)}`)

      if (item.examples.length > 0) {
        for (const ex of item.examples) {
          console.log(`    ${colors.cyan("$")} ${colors.dim(ex)}`)
        }
      }
      console.log()
    }
  }

  console.log(colors.dim("● = sudah terdaftar di package.json"))
  console.log(colors.dim("○ = belum terdaftar (tambahkan ke scripts di package.json)"))
  console.log()
  console.log(
    colors.dim("Dokumentasi lengkap: ") + colors.cyan("scripts/README.md")
  )
  console.log()
}

// Entry
const args = process.argv.slice(2)
if (args.includes("--help") || args.includes("-h")) {
  console.log(`
${colors.bold("pnpm scripts:list")}

Menampilkan daftar semua perintah helper yang tersedia di folder scripts/.

${colors.cyan("Usage:")}
  pnpm scripts:list
`)
  process.exit(0)
}

showList()
