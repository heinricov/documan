#!/usr/bin/env node

/**
 * pnpm Catalog Helper — Add
 *
 * Location: scripts/catalog-add.mjs
 *
 * Usage:
 *   pnpm catalog:add <pkg> [pkg2] [pkg3] [--use <ws1> <ws2> ...] [options]
 *
 * Examples:
 *   pnpm catalog:add react-icons --use apps/web packages/ui
 *   pnpm catalog:add react-icons zod date-fns --use apps/web packages/ui
 *   pnpm catalog:add react-icons@5.5.0 zod --use packages/ui --dev
 *   pnpm catalog:add --list
 *
 * Options:
 *   --use, -u       Workspace(s) yang akan memakai package via "catalog:"
 *   --dev, -D       Install sebagai devDependency
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

function sortKeys(obj) {
  return Object.fromEntries(
    Object.entries(obj).sort(([a], [b]) => a.localeCompare(b))
  )
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
${colors.bold("pnpm Catalog Helper")} — Add

${colors.cyan("Usage:")}
  pnpm catalog:add <package> [package2] [package3] [options]

${colors.cyan("Examples:")}
  pnpm catalog:add react-icons --use apps/web packages/ui
  pnpm catalog:add react-icons zod date-fns --use apps/web packages/ui
  pnpm catalog:add react-icons@5.5.0 zod --use packages/ui --dev
  pnpm catalog:add --list

${colors.cyan("Options:")}
  --use, -u <ws...>     Workspace yang akan memakai package via "catalog:"
  --dev, -D             Install sebagai devDependency
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

function parsePackageArg(arg) {
  // Support: react-icons | react-icons@5.5.0 | @scope/pkg@1.2.3
  const match = arg.match(/^(@?[^@]+)(?:@(.+))?$/)
  if (!match) error(`Format package tidak valid: ${arg}`)
  return {
    name: match[1],
    version: match[2] || null,
  }
}

function addPackages({ packages, workspaces, isDev, dryRun }) {
  const depType = isDev ? "devDependencies" : "dependencies"

  // ---- 1. Install semua package ke root sekaligus ----
  const installArgs = packages
    .map((p) => (p.version ? `${p.name}@${p.version}` : p.name))
    .join(" ")

  const installCmd = `pnpm add ${installArgs} -w${isDev ? " -D" : ""}`

  if (dryRun) {
    log(`[dry-run] ${installCmd}`)
  } else {
    log(
      `Menambahkan ${colors.bold(packages.map((p) => p.name).join(", "))} ke root (${isDev ? "devDependency" : "dependency"})...`
    )
    run(installCmd)
  }

  // ---- 2. Ambil versi yang terinstall & update catalog ----
  let yaml = readWorkspaceYaml()
  const catalog = getCatalog(yaml)
  let catalogChanged = false

  const rootPkg = dryRun
    ? { dependencies: {}, devDependencies: {} }
    : readJson(ROOT_PKG)

  for (const pkg of packages) {
    const installedVersion =
      rootPkg.dependencies?.[pkg.name] ||
      rootPkg.devDependencies?.[pkg.name] ||
      pkg.version ||
      "latest"

    if (catalog[pkg.name] === installedVersion) {
      log(`"${pkg.name}" sudah ada di catalog dengan versi yang sama`)
    } else {
      catalog[pkg.name] = installedVersion
      catalogChanged = true
      if (dryRun) {
        log(`[dry-run] Catalog → ${pkg.name}: ${installedVersion}`)
      } else {
        success(`Catalog updated → ${colors.bold(pkg.name)}: ${installedVersion}`)
      }
    }
  }

  if (catalogChanged && !dryRun) {
    writeFileSync(WORKSPACE_YAML, updateCatalogInYaml(yaml, catalog))
  }

  // ---- 3. Update package.json di setiap workspace ----
  if (workspaces.length === 0) {
    warn(
      "Tidak ada --use. Package hanya ditambahkan ke catalog & root.\n" +
        "  Gunakan --use apps/web packages/ui agar otomatis ditambahkan ke package.json target."
    )
  } else {
    for (const ws of workspaces) {
      const pkgPath = join(ROOT, ws, "package.json")
      if (!existsSync(pkgPath)) {
        error(`package.json tidak ditemukan di: ${ws}`)
      }

      const pkgJson = readJson(pkgPath)
      if (!pkgJson[depType]) pkgJson[depType] = {}

      const otherType = isDev ? "dependencies" : "devDependencies"
      let changed = false

      for (const { name } of packages) {
        // Hapus dari sisi yang berlawanan
        if (pkgJson[otherType]?.[name]) {
          delete pkgJson[otherType][name]
          if (Object.keys(pkgJson[otherType]).length === 0) {
            delete pkgJson[otherType]
          }
          changed = true
        }

        if (pkgJson[depType][name] === "catalog:") {
          log(`${ws} sudah menggunakan "catalog:" untuk ${name}`)
          continue
        }

        pkgJson[depType][name] = "catalog:"
        changed = true
      }

      if (changed) {
        pkgJson[depType] = sortKeys(pkgJson[depType])

        if (dryRun) {
          log(
            `[dry-run] Update ${ws}/package.json → ${packages.map((p) => p.name).join(", ")} = "catalog:"`
          )
        } else {
          writeJson(pkgPath, pkgJson)
          success(
            `Update ${colors.bold(ws)}/package.json → ${packages.map((p) => p.name).join(", ")}`
          )
        }
      }
    }
  }

  // ---- 4. pnpm install ----
  if (dryRun) {
    log(`[dry-run] pnpm install`)
  } else {
    log("Menjalankan pnpm install...")
    run("pnpm install")
  }

  const names = packages.map((p) => p.name).join(", ")
  success(
    `Selesai! ${colors.bold(names)} sekarang tersedia via catalog${workspaces.length ? ` di: ${workspaces.join(", ")}` : " (hanya root)"}`
  )
  console.log(
    `\n${colors.dim("Contoh import:")}\n${packages.map((p) => `  import { ... } from "${p.name}"`).join("\n")}\n`
  )
}

// ====================== CLI Entry ======================

// Manual parsing karena parseArgs tidak bisa handle
// "pnpm catalog:add react-icons --use apps/web packages/ui"
// di mana "packages/ui" adalah workspace, bukan package

const rawArgs = process.argv.slice(2)
const packages = []
const workspaces = []
let isDev = false
let dryRun = false
let showListFlag = false
let showHelpFlag = false

let mode = null // null = parsing packages, "use" = parsing workspaces

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i]

  if (arg === "--use" || arg === "-u") {
    mode = "use"
    continue
  }
  if (arg === "--dev" || arg === "-D") {
    isDev = true
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

  if (mode === "use") {
    workspaces.push(arg)
  } else {
    packages.push(parsePackageArg(arg))
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

if (packages.length === 0) {
  showHelp()
  process.exit(1)
}

addPackages({ packages, workspaces, isDev, dryRun })
