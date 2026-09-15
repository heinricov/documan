# Scripts

Kumpulan helper script untuk monorepo ini.

## Prerequisites

Pastikan script sudah terdaftar di root `package.json`:

```json
{
  "scripts": {
    "catalog:add": "node scripts/catalog-add.mjs",
    "catalog:remove": "node scripts/catalog-remove.mjs",
    "apps:add": "node scripts/apps-add.mjs",
    "packages:add": "node scripts/packages-add.mjs",
    "scripts:list": "node scripts/scripts-list.mjs",
    "git:push": "node scripts/git-push.mjs"
  }
}
```

---

## Commands

### `pnpm catalog:add`

Menambahkan satu atau lebih package ke **pnpm catalog**, menginstall ke root, dan (opsional) mendaftarkannya di `package.json` workspace yang dituju.

**Yang dilakukan script:**

1. `pnpm add <package...> -w` (install ke root)
2. Update `pnpm-workspace.yaml` → section `catalog`
3. Update `package.json` di workspace yang ditentukan (`--use`) menjadi `"package": "catalog:"`
4. Menjalankan `pnpm install`

#### Contoh

```bash
# Satu package
pnpm catalog:add react-icons --use apps/web packages/ui

# Multiple package sekaligus
pnpm catalog:add react-icons zod date-fns --use apps/web packages/ui

# Versi spesifik
pnpm catalog:add react-icons@5.5.0 --use apps/web

# Sebagai devDependency
pnpm catalog:add @types/node --use apps/web --dev

# Hanya tambah ke catalog + root (tanpa update workspace)
pnpm catalog:add lodash

# Lihat isi catalog
pnpm catalog:add --list

# Simulasi tanpa mengubah file
pnpm catalog:add react-icons --use apps/web --dry-run
```

#### Options

| Flag | Short | Keterangan |
|------|-------|----------|
| `--use <ws...>` | `-u` | Workspace yang akan memakai package via `"catalog:"` |
| `--dev` | `-D` | Install sebagai `devDependency` |
| `--list` | `-l` | Tampilkan isi catalog saat ini |
| `--dry-run` | | Simulasi tanpa mengubah file |
| `--help` | `-h` | Tampilkan bantuan |

---

### `pnpm catalog:remove`

Menghapus satu atau lebih package dari **pnpm catalog** dan membersihkan deklarasinya dari `package.json` yang dituju.

**Yang dilakukan script:**

1. Hapus entry dari `catalog` di `pnpm-workspace.yaml`
2. Hapus deklarasi package dari root `package.json`
3. Hapus deklarasi package dari `package.json` di workspace yang ditentukan (`--dir`)
4. Menjalankan `pnpm install`

#### Contoh

```bash
# Hapus dari catalog + package.json di folder tertentu
pnpm catalog:remove react-icons --dir apps/web packages/ui

# Hapus multiple package
pnpm catalog:remove react-icons zod --dir apps/web packages/ui

# Hapus hanya dari catalog + root (tanpa --dir)
pnpm catalog:remove react-icons

# Lihat isi catalog
pnpm catalog:remove --list

# Simulasi tanpa mengubah file
pnpm catalog:remove react-icons --dir apps/web --dry-run
```

#### Options

| Flag | Short | Keterangan |
|------|-------|----------|
| `--dir <ws...>` | `-d` | Workspace yang `package.json`-nya akan dibersihkan |
| `--list` | `-l` | Tampilkan isi catalog saat ini |
| `--dry-run` | | Simulasi tanpa mengubah file |
| `--help` | `-h` | Tampilkan bantuan |

---

### `pnpm apps:add`

Membuat aplikasi baru di dalam folder `apps/` menggunakan generator resmi masing-masing framework.  
Prompt interaktif dari CLI akan muncul seperti biasa.

**Framework yang didukung:**

| Framework | Generator | Contoh |
|-----------|-----------|--------|
| `nest` | `@nestjs/cli` | `pnpm apps:add nest new my-api` |
| `next` | `create-next-app` | `pnpm apps:add next my-web` |
| `expo` | `create-expo-app` | `pnpm apps:add expo my-mobile` |
| `remix` | `create-remix` | `pnpm apps:add remix` |
| `vite` | `create-vite` | `pnpm apps:add vite my-app` |
| `custom` | Perintah bebas | `pnpm apps:add custom npx some-generator my-app` |

#### Contoh

```bash
# NestJS
pnpm apps:add nest new my-api
pnpm apps:add nest new my-api --strict --skip-git

# Next.js
pnpm apps:add next my-web
pnpm apps:add next my-web --ts --tailwind --app --src-dir --eslint

# Expo (React Native)
pnpm apps:add expo my-mobile

# Vite
pnpm apps:add vite my-app

# Custom command di dalam apps/
pnpm apps:add custom npx create-something my-app
```

#### Options

| Flag | Short | Keterangan |
|------|-------|----------|
| `--help` | `-h` | Tampilkan bantuan |

> Semua argumen setelah nama framework akan diteruskan langsung ke CLI generator.

#### Catatan

- App baru dibuat di dalam folder `apps/`.
- Karena `pnpm-workspace.yaml` sudah berisi `apps/*`, app baru **otomatis** menjadi workspace package.
- Setelah generate, jalankan:
  ```bash
  pnpm --filter <nama-app> dev
  ```

---

### `pnpm packages:add`

Membuat **shared package** baru di dalam folder `packages/` dengan setup dasar yang siap dipakai.

**Yang dibuat:**

```
packages/<name>/
├── src/
│   └── index.ts
├── package.json          # name: @workspace/<name>
└── tsconfig.json         # extends @configs/typescript
```

#### Contoh

```bash
# Buat package baru
pnpm packages:add db
pnpm packages:add auth
pnpm packages:add utils --description "Shared utility functions"

# Dry run
pnpm packages:add config --dry-run
```

#### Options

| Flag | Short | Keterangan |
|------|-------|----------|
| `--description <text>` | `-d` | Deskripsi package |
| `--dry-run` | | Simulasi tanpa membuat file |
| `--help` | `-h` | Tampilkan bantuan |

#### Setelah dibuat

```bash
# Install dependency ke package tersebut
pnpm add drizzle-orm --filter @workspace/db

# Atau pakai catalog
pnpm catalog:add drizzle-orm --use packages/db

# Pakai di app lain
# package.json → "@workspace/db": "workspace:*"
# kode       → import { ... } from "@workspace/db"
```

---

### `pnpm scripts:list`

Menampilkan daftar semua perintah helper monorepo beserta contoh penggunaannya.

#### Contoh

```bash
pnpm scripts:list
```

Script ini juga menandai mana saja perintah yang sudah terdaftar di root `package.json` (●) dan mana yang belum (○).

---

### `pnpm git:push`

Menjalankan `git add .` → `git commit` → `git push` dalam satu perintah.

#### Contoh

```bash
# Commit + push
pnpm git:push "feat: add catalog scripts"

# Hanya commit, tanpa push
pnpm git:push "chore: update deps" --no-push

# Simulasi
pnpm git:push "test commit" --dry-run
```

#### Options

| Flag | Keterangan |
|------|----------|
| `--no-push` | Hanya `git add` + `git commit`, tanpa `git push` |
| `--dry-run` | Simulasi tanpa menjalankan perintah git |
| `--help`, `-h` | Tampilkan bantuan |

#### Catatan

- Pesan commit **wajib** diisi.
- Jika tidak ada perubahan, script akan berhenti dengan pesan yang jelas.
- Harus dijalankan di dalam git repository.

---

## Alur Kerja yang Disarankan

### 1. Membuat shared package

```bash
pnpm packages:add db
pnpm catalog:add drizzle-orm --use packages/db
```

### 2. Membuat app baru

```bash
pnpm apps:add nest new api
pnpm apps:add next web
```

### 3. Menambah dependency bersama

```bash
pnpm catalog:add zod date-fns --use apps/web packages/ui packages/db
```

### 4. Menghapus dependency dari catalog

```bash
pnpm catalog:remove react-icons --dir apps/web packages/ui
```

---

## Catatan Umum

- Semua script dijalankan dari **root** monorepo.
- Script catalog mengandalkan fitur resmi **pnpm catalog**.
- Script `apps:add` menggunakan `pnpm dlx` (tidak perlu install CLI global).
- Package baru memakai scope `@workspace/<name>` agar konsisten dengan `@packages/ui`.
