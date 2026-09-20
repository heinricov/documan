# documan

Aplikasi **manajemen dokumen organisasi** — dokumen markdown ber-versioning, role-based access, multi-device.

Dibangun sebagai **monorepo** (pnpm workspace + Turborepo): satu sumber aturan (SSOT) di `@packages/*`, dipakai bersama oleh API (NestJS) dan web (Next.js).

> Bahasa dokumentasi konsisten **Bahasa Indonesia**.

---

## Arsitektur

```
documa/
├── apps/
│   ├── api/                # NestJS 12 REST API (health, CRUD roles — teladan)
│   └── web/                # Next.js 16 (App Router + Turbopack)
├── packages/
│   ├── core/               # AppError, format respons & pagination helpers
│   ├── logger/             # Pino logger, serializer, redaction (SSOT logging)
│   ├── validator/          # Zod schemas & tipe (SSOT request/response API)
│   ├── documentation/      # Setup Swagger + konversi zod → OpenAPI
│   ├── db/                 # Prisma client singleton, migrasi, seed
│   ├── auth/               # JWT (jose), Argon2 hash, guard helpers (dipakai api)
│   ├── client/             # Typed API client (dipakai web — SSOT komunikasi web↔api)
│   ├── testing/            # Factories, seed, clean database, token test
│   ├── ui/                 # Komponen UI (shadcn/ui pattern) untuk web
│   └── configs/
│       ├── environment/    # loadEnv + validateEnv (fail-fast)
│       ├── typescript/     # Base tsconfig monorepo
│       └── eslint/         # Konfigurasi ESLint bersama
├── scripts/                # Helper pnpm workspace (add app/package/dll)
└── pnpm-workspace.yaml
```

**Prinsip:** paket-paket di `@packages/*` adalah **Source of Truth**; `apps/api` dan `apps/web` hanya memakai, tidak mendefinisikan ulang. Contoh: schema & validasi request ada di `@packages/validator` — dipakai Nest via `@ZodQuery({ zod })` dan dipakai web via `@packages/client` (response divalidasi dengan schema yang sama).

---

## Teknologi

| Area            | Pilihan                                                             |
| --------------- | ------------------------------------------------------------------- |
| Runtime         | Node 24 ESM, TypeScript (ESM + `nodenext`)                          |
| Package manager | pnpm 10 (workspace) + Turborepo                                     |
| API             | NestJS 12 (NestFactory via `@packages/db`), Express                 |
| Web             | Next.js 16 (App Router, Turbopack)                                  |
| Database        | PostgreSQL + Prisma 7 (driver adapter `pg`)                         |
| Validasi        | Zod 4 (SSOT — request, response, tipe)                              |
| Dokumentasi API | Swagger/OpenAPI via `@packages/documentation`                       |
| Logging         | Pino (via `@packages/logger`) — dipakai logger NestJS + request log |
| Lint / fmt      | oxlint, Prettier (via ad-hoc configs monorepo)                      |

---

## Quick Start

**Prasyarat:** Node ≥ 22, pnpm ≥ 10, PostgreSQL (jalankan lokal via Docker atau pakai instance remote), dan `DATABASE_URL` + `JWT_SECRET` (lihat `.env.example`).

```bash
# 1) install dependencies seluruh workspace
pnpm install

# 2) siapkan environment (lihat .env.example — wajib DATABASE_URL; JWT_SECRET minimal 32 char)
cp .env.example .env
# lalu isi DATABASE_URL (Postgres) sebelum lanjut

# 3) migrate + generate Prisma client
pnpm --filter @packages/db prisma:migrate
pnpm --filter @packages/db prisma:generate

# 4) jalankan seluruh workspace dev (api + web)
pnpm dev
```

Buka:

- API (NestJS): http://localhost:4000 — health `GET /health`, Swagger `GET /docs` (aktif di development), CRUD roles `GET /roles`
- Web (Next.js): http://localhost:3000

> Port API di `.env.example` default **3001**; `apps/api` README & `.env` lokal dokumen ini memakai **4000** (sesuaikan dengan env Anda — pastikan `API_PORT` konsisten).

---

## Perintah Umum (via turbo)

```bash
pnpm dev            # jalankan seluruh workspace (watch)
pnpm build          # build semua packages & apps
pnpm lint           # lint seluruh workspace
pnpm typecheck      # typecheck seluruh workspace
pnpm format         # format via Prettier
```

Perintah per-workspace memakai filter turbo:

```bash
pnpm --filter api lint
pnpm --filter web typecheck
pnpm --filter @packages/db prisma:migrate
```

---

## Database Management

Semua script bersumber dari `@packages/db`:

```text
packages/db/scripts/
├── seed/          # Seed data (per entity)
│   ├── index.ts       # Seed SEMUA
│   ├── roles.ts       # Seed roles
│   ├── users.ts       # Seed users
│   ├── doc-types.ts   # Seed doc types
│   ├── partners.ts    # Seed partners
│   └── boxes.ts       # Seed boxes
├── clean/         # Hapus data (per table)
│   ├── index.ts       # Clean SEMUA
│   ├── roles.ts       # Clean roles
│   ├── users.ts       # Clean users
│   ├── subsidiaries.ts# Clean subsidiaries
│   ├── doc-types.ts   # Clean doc types
│   ├── partners.ts    # Clean partners
│   └── boxes.ts       # Clean boxes
└── lib/           # Helper bersama
    ├── clean-table.ts # cleanTable / cleanAllTables
    └── run-main.ts    # isMain / runScript
```

### Seed (data awal)

Seed **semua sekaligus**:

```bash
pnpm --filter @packages/db db:seed
```

Seed **per entity**:

```bash
pnpm --filter @packages/db db:seed:roles     # roles saja
pnpm --filter @packages/db db:seed:users     # users saja
pnpm --filter @packages/db db:seed:doc-types # doc types saja
pnpm --filter @packages/db db:seed:partners  # partners saja
pnpm --filter @packages/db db:seed:boxes     # boxes saja
```

> Catatan: `db:seed:users` butuh role admin & user — pastikan `db:seed:roles` sudah dijalankan dulu (atau pakai `db:seed`).

Data yang dibuat (idempotent — aman dijalankan berulang):

| Role  | Username | Email            | Password  |
| ----- | -------- | ---------------- | --------- |
| admin | admin    | admin@documan.id | admin1234 |
| user  | user     | user@documan.id  | user1234  |

| DocType | Description     |
| ------- | --------------- |
| do      | Delivery Order  |
| pv      | Payment Voucher |

| Partner | Description | Type |
| ------- | ----------- | ---- |
| PT Sumber Jaya | Supplier utama bahan baku | supplier |
| CV Logistik Nusantara | Jasa pengiriman barang | logistics |
| Bank BCA | Layanan pembayaran & transfer | bank |

| No Box  | Title                | Description                        |
| ------- | -------------------- | ---------------------------------- |
| BOX-001 | Arsip Dokumen 2026   | Box untuk arsip dokumen tahun 2026 |
| BOX-002 | Dokumen Keuangan     | Box khusus dokumen keuangan        |
| BOX-003 | Dokumen Legal        | Box untuk dokumen legal & perizinan |

### Clean (hapus data)

Hapus **semua tabel** sekaligus:

```bash
pnpm --filter @packages/db db:clean
```

Hapus **per table**:

```bash
pnpm --filter @packages/db db:clean:partners    # partners
pnpm --filter @packages/db db:clean:roles        # roles (CASCADE ke users)
pnpm --filter @packages/db db:clean:users        # users saja
pnpm --filter @packages/db db:clean:subsidiaries # subsidiaries saja
pnpm --filter @packages/db db:clean:doc-types    # doc types saja
pnpm --filter @packages/db db:clean:boxes        # boxes saja
```

> Perhatian `CASCADE`: `roles` direferensikan oleh `users`. Hapus `roles`
> akan ikut menghapus `users` yang memakai role tersebut.

### Truncate + Re-seed (reset total)

Untuk menghapus semua data lalu membuat ulang dari awal:

```bash
# 1) Hapus semua data
pnpm --filter @packages/db db:clean

# 2) Seed ulang semua
pnpm --filter @packages/db db:seed
```

Atau satu baris:

```bash
pnpm --filter @packages/db db:clean && pnpm --filter @packages/db db:seed
```

**Catatan:**

- `TRUNCATE ... RESTART IDENTITY CASCADE` mereset auto-increment & menghapus
  semua baris (termasuk tabel lain yang punya FK ke tabel tersebut)
- Tabel `doc_types`, `users`, `subsidiaries`, `roles` akan kosong setelah `db:clean`
- Jalankan `db:seed` setelah `db:clean` untuk membuat data awal kembali
- Semua script idempotent — bisa dijalankan berulang kali tanpa duplikat data

### Akses Developert Test

username: "admin",
email: "admin@documan.id",
password: "admin1234",

username: "user",
email: "user@documan.id",
password: "user1234",

---

## API — Ringkasan

REST API NestJS modular di `apps/api`. Setiap fitur = module mandiri (`src/modules/<fitur>/`) dengan controller, service, validator, & swagger sendiri.

### Roles (fitur teladan — CRUD lengkap)

| Method | Route        | Keterangan                               |
| ------ | ------------ | ---------------------------------------- |
| GET    | `/roles`     | List role (paginasi + filter)            |
| POST   | `/roles`     | Buat role (title unik, case-insensitive) |
| GET    | `/roles/:id` | Detail role                              |
| PATCH  | `/roles/:id` | Update role                              |
| DELETE | `/roles/:id` | Hapus role                               |

Semua endpoint memakai format respons standar dari `@packages/core`:

```jsonc
// sukses (list)
{ "success": true, "data": [ ... ], "meta": { "page": 1, "limit": 10, "total": 3, "totalPages": 1, "hasNext": false, "hasPrevious": false } }

// error (mis. konflik title)
{ "success": false, "error": { "code": "CONFLICT", "message": "Role \"admin\" sudah ada" } }
```

Dokumentasi lengkap API, pola endpoint baru, dan catatan NestJS 12 → `apps/api/README.md`.

---

## Packages & Configs

| Package                   | Deskripsi                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------ |
| `@packages/core`          | `AppError` + subclasses, `errorResponse`, `paginatedResponse`, pagination helpers    |
| `@packages/logger`        | `createLogger` (pino), `serializeError/Response`, `withLogContext`, `DEFAULT_REDACT` |
| `@packages/validator`     | Zod schemas & tipe (SSOT) — role, query, id params, common                           |
| `@packages/documentation` | Swagger bootstrap + `zodToOpenApi` + helper pagination OpenAPI                       |
| `@packages/db`            | Prisma client (driver adapter), migrasi + seed                                       |
| `@packages/auth`          | JWT sign/verify (jose), Argon2 hash, guard helpers SSOT                              |
| `@packages/client`        | Typed API client (dipakai web) — auto-inject Bearer token + interceptor 401          |
| `@packages/testing`       | `createRoleFixture`, `cleanDatabase`, `seedRole`, `createTestToken`                  |
| `@packages/ui`            | Komponen UI (field, input, button, dll) untuk apps/web                               |
| `@configs/environment`    | `loadEnv` root `.env` + `validateEnv` (fail-fast, aman env)                          |
| `@configs/typescript`     | `tsconfig.base.json` — konfigurasi TS monorepo                                       |
| `@configs/eslint`         | Shared eslint config                                                                 |

---

## Kekurangan Saat Ini (jujur)

1. **Rate limiting in-memory** — `InMemoryRateLimitStore` sudah di-refactor ke pluggable interface (DI). Untuk multi-instance, implementasikan `RateLimitStore` baru (mis. Redis) dan daftarkan via DI di `AppModule`.
2. **Produksi belum tested end-to-end** — prisma migrate deploy sudah ada (`db:deploy`), tapi build distribusi & deployment pipeline belum diverifikasi.
3. **Swagger hanya aktif di development** (sudah aman by design — tidak perlu diubah).

---

## Roadmap

- **[x]** Auth: model `User` + login/me + `AuthGuard`/`RolesGuard` global + proteksi route CRUD + admin-only user creation via `POST /users`
- **[x]** CRUD `users` (admin) & `subsidiaries`
- **[x]** Integrasi web: `@packages/client` terhubung ke `apps/api` + login page + `AuthGuard` layout + token interceptor 401
- **[x]** Otorisasi per-role: `@Roles("admin")` diterapkan ke endpoint CRUD sensitif (roles write, users all, subsidiaries write)
- **[x]** Unit tests (35 tests) + E2E tests (12 tests) — vitest + supertest, menjalankan di `pnpm --filter api test` / `test:e2e`
- **[ ]** Feature inti **documents** (markdown + versi + riwayat); validasi & tipe di `@packages/validator`
- **[ ]** Produksi: build `packages/*` → `dist` + `node dist/main` (hilangkan ketergantungan `tsx`)

---

## Kontribusi

- Petunjuk developer & aturan → [AGENTS.md](AGENTS.md).
- Menambahkan app/package baru → `pnpm apps:add` / `pnpm packages:add` (lihat `scripts/README.md`).

---
## Menambah Entity Baru

Panduan lengkap langkah-demi-langkah untuk menambah entity baru di monorepo documan.

👉 **[Baca panduan lengkap di docs/new-entity.md](docs/new-entity.md)**
