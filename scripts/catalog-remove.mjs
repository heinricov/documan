#!/usr/bin/env node

/**
 * pnpm Catalog Helper — Remove
 *
 * Location: scripts/catalog-remove.mjs
 *
 * Usage:
 *   pnpm catalog:remove <pkg> [pkg2] [pkg3] [--dir <ws1> <ws2> ...] [options]
 *
 * Examples:
 *   pnpm catalog:remove react-icons --dir apps/web packages/ui
 *   pnpm catalog:remove react-icons zod --dir apps/web
 *   pnpm catalog:remove react-icons          # hapus dari catalog + root saja
 *   pnpm catalog:remove --list
 *
 * Options:
 *   --dir, -d       Workspace yang package.json-nya akan dibersihkan
 *   --list, -l      Tampilkan isi catalog saat ini
 *   --dry-run       Simulasi tanpa mengubah file
 *   --help, -h      Tampilkan bantuan
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { resolve, join } from "node:path"
import { execSync } from "node:child_process"

const ROOT = resolve(import.meta.dirname, "..")
const WORKSPACE_YAML = join(ROOT, "pnpm-workspace.yaml")
const ROOT_PKG = join(ROOT, "package.json")

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

function run(cmd, { silent = false } = {}) {
  if (!silent) log(`Running: ${colors.dim(cmd)}`)
  try {
    execSync(cmd, {
      stdio: silent ? "pipe" : "inherit",
      cwd: ROOT,
      encoding: "utf8",
    })
  } catch {
    error(`Command failed: ${cmd}`)
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"))
}

function writeJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n")
}

// ====================== YAML Helpers ======================

function readWorkspaceYaml() {
  if (!existsSync(WORKSPACE_YAML)) {
    error("pnpm-workspace.yaml tidak ditemukan di root repo")
  }
  return readFileSync(WORKSPACE_YAML, "utf8")
}

function getCatalog(yamlContent) {
  const catalog = {}
  const match = yamlContent.match(/catalog:\s*\n((?:[ \t]+.+\n?)*)/)
  if (!match) return catalog

  for (const line of match[1].split("\n")) {
    const m = line.match(/^\s+([^\s:]+):\s*(.+)$/)
    if (m) catalog[m[1]] = m[2].trim()
  }
  return catalog
}

function updateCatalogInYaml(yamlContent, catalog) {
  const catalogBlock =
    Object.keys(catalog).length === 0
      ? ""
      : "catalog:\n" +
        Object.entries(catalog)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([name, version]) => `  ${name}: ${version}`)
          .join("\n") +
        "\n"

  if (yamlContent.includes("catalog:")) {
    return yamlContent.replace(
      /catalog:\s*\n(?:[ \t]+.+\n?)*/,
      catalogBlock
    )
  }

  return yamlContent.trimEnd() + "\n\n" + catalogBlock
}

// ====================== Main Logic ======================

function showHelp() {
  console.log(`
${colors.bold("pnpm Catalog Helper")} — Remove

${colors.cyan("Usage:")}
  pnpm catalog:remove <package> [package2] [package3] [options]

${colors.cyan("Examples:")}
  pnpm catalog:remove react-icons --dir apps/web packages/ui
  pnpm catalog:remove react-icons zod --dir apps/web
  pnpm catalog:remove react-icons                # hapus dari catalog + root saja
  pnpm catalog:remove --list

${colors.cyan("Options:")}
  --dir, -d <ws...>     Workspace yang package.json-nya akan dibersihkan
  --list, -l            Tampilkan isi catalog saat ini
  --dry-run             Simulasi tanpa mengubah file apapun
  --help, -h            Tampilkan bantuan ini
`)
}

function listCatalog() {
  const yaml = readWorkspaceYaml()
  const catalog = getCatalog(yaml)

  if (Object.keys(catalog).length === 0) {
    console.log(colors.dim("Catalog masih kosong."))
    return
  }

  console.log(colors.bold("\nCurrent Catalog:\n"))
  const maxLen = Math.max(...Object.keys(catalog).map((k) => k.length))

  for (const [name, version] of Object.entries(catalog).sort(([a], [b]) =>
    a.localeCompare(b)
  )) {
    console.log(
      `  ${colors.cyan(name.padEnd(maxLen))}  ${colors.dim(version)}`
    )
  }
  console.log()
}

function removePackages({ names, dirs, dryRun }) {
  // ---- 1. Hapus dari catalog di pnpm-workspace.yaml ----
  let yaml = readWorkspaceYaml()
  const catalog = getCatalog(yaml)
  let catalogChanged = false

  for (const name of names) {
    if (!catalog[name]) {
      warn(`"${name}" tidak ditemukan di catalog`)
    } else {
      delete catalog[name]
      catalogChanged = true
      if (dryRun) {
        log(`[dry-run] Hapus ${name} dari catalog`)
      } else {
        success(`Dihapus dari catalog: ${colors.bold(name)}`)
      }
    }
  }

  if (catalogChanged && !dryRun) {
    writeFileSync(WORKSPACE_YAML, updateCatalogInYaml(yaml, catalog))
  }

  // ---- 2. Hapus dari root + package.json di --dir ----
  const targets = ["", ...dirs] // "" = root

  for (const ws of targets) {
    const pkgPath = ws ? join(ROOT, ws, "package.json") : ROOT_PKG
    if (!existsSync(pkgPath)) {
      if (ws) warn(`package.json tidak ditemukan di: ${ws}`)
      continue
    }

    const pkg = readJson(pkgPath)
    let changed = false

    for (const name of names) {
      for (const type of ["dependencies", "devDependencies"]) {
        if (pkg[type]?.[name]) {
          delete pkg[type][name]
          if (Object.keys(pkg[type]).length === 0) delete pkg[type]
          changed = true
        }
      }
    }

    if (changed) {
      if (dryRun) {
        log(`[dry-run] Hapus ${names.join(", ")} dari ${ws || "root"}/package.json`)
      } else {
        writeJson(pkgPath, pkg)
        success(`Dihapus dari ${colors.bold(ws || "root")}/package.json`)
      }
    }
  }

  // ---- 3. pnpm install ----
  if (dryRun) {
    log(`[dry-run] pnpm install`)
  } else {
    log("Menjalankan pnpm install...")
    run("pnpm install")
  }

  success(`Selesai menghapus: ${colors.bold(names.join(", "))}`)
}

// ====================== CLI Entry ======================

// Manual parsing karena parseArgs tidak bisa handle
// "pnpm catalog:remove react-icons --dir apps/web packages/ui"
// di mana "packages/ui" adalah workspace, bukan package

const rawArgs = process.argv.slice(2)
const names = []
const dirs = []
let dryRun = false
let showListFlag = false
let showHelpFlag = false

let mode = null // null = parsing packages, "dir" = parsing directories

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i]

  if (arg === "--dir" || arg === "-d") {
    mode = "dir"
    continue
  }
  if (arg === "--list" || arg === "-l") {
    showListFlag = true
    continue
  }
  if (arg === "--dry-run") {
    dryRun = true
    continue
  }
  if (arg === "--help" || arg === "-h") {
    showHelpFlag = true
    continue
  }

  // Skip '--' separator
  if (arg === "--") {
    continue
  }

  if (mode === "dir") {
    dirs.push(arg)
  } else {
    names.push(arg)
  }
}

if (showHelpFlag) {
  showHelp()
  process.exit(0)
}

if (showListFlag) {
  listCatalog()
  process.exit(0)
}

if (names.length === 0) {
  showHelp()
  process.exit(1)
}

removePackages({ names, dirs, dryRun })
