#!/usr/bin/env node

/**
 * Git Push Helper
 *
 * Location: scripts/git-push.mjs
 *
 * Usage:
 *   pnpm git:push "pesan commit"
 *   pnpm git:push "pesan commit" --no-push
 *   pnpm git:push "pesan commit" --dry-run
 */

import { execSync } from "node:child_process"
import { resolve } from "node:path"
import { parseArgs } from "node:util"

const ROOT = resolve(import.meta.dirname, "..")

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

function run(cmd, { inherit = true } = {}) {
  log(`Running: ${colors.dim(cmd)}`)
  try {
    return execSync(cmd, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: inherit ? "inherit" : "pipe",
    })
  } catch (err) {
    error(`Command failed: ${cmd}`)
  }
}

function runQuiet(cmd) {
  try {
    return execSync(cmd, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: "pipe",
    }).trim()
  } catch {
    return ""
  }
}

function showHelp() {
  console.log(`
${colors.bold("Git Push Helper")}

${colors.cyan("Usage:")}
  pnpm git:push "pesan commit"
  pnpm git:push "pesan commit" --no-push
  pnpm git:push "pesan commit" --dry-run

${colors.cyan("Options:")}
  --no-push     Hanya git add + commit, tanpa push
  --dry-run     Simulasi tanpa menjalankan perintah git
  --help, -h    Tampilkan bantuan

${colors.cyan("Contoh:")}
  pnpm git:push "feat: add catalog scripts"
  pnpm git:push "fix: update button styles" --no-push
`)
}

function main() {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      "no-push": { type: "boolean", default: false },
      "dry-run": { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    allowPositionals: true,
    strict: true,
  })

  if (values.help) {
    showHelp()
    process.exit(0)
  }

  const message = positionals.join(" ").trim()

  if (!message) {
    error(
      `Pesan commit wajib diisi.\n` +
        `Contoh: pnpm git:push "feat: add new feature"`
    )
  }

  // Cek apakah di dalam git repo
  const isGitRepo = runQuiet("git rev-parse --is-inside-work-tree")
  if (isGitRepo !== "true") {
    error("Direktori ini bukan git repository.")
  }

  // Cek status
  const status = runQuiet("git status --porcelain")
  if (!status) {
    warn("Tidak ada perubahan untuk di-commit.")
    process.exit(0)
  }

  console.log()
  log("Perubahan yang akan di-commit:")
  console.log(colors.dim(status.split("\n").map((l) => `  ${l}`).join("\n")))
  console.log()

  const dryRun = values["dry-run"]
  const noPush = values["no-push"]

  // 1. git add .
  if (dryRun) {
    log(`[dry-run] git add .`)
  } else {
    run("git add .")
    success("git add .")
  }

  // 2. git commit
  // Escape pesan agar aman dari tanda kutip
  const safeMessage = message.replace(/"/g, '\\"')
  const commitCmd = `git commit -m "${safeMessage}"`

  if (dryRun) {
    log(`[dry-run] ${commitCmd}`)
  } else {
    run(commitCmd)
    success(`git commit -m "${message}"`)
  }

  // 3. git push
  if (noPush) {
    warn("Skip push (--no-push)")
  } else if (dryRun) {
    log(`[dry-run] git push`)
  } else {
    run("git push")
    success("git push")
  }

  console.log()
  success(
    dryRun
      ? "Dry run selesai (tidak ada perubahan yang dilakukan)"
      : noPush
        ? "Commit berhasil (tanpa push)"
        : "Berhasil di-commit dan di-push!"
  )
  console.log()
}

main()
