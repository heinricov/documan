# Documan

Aplikasi manajemen dokumen berbasis **monorepo** (pnpm + Turborepo) dengan API REST (NestJS) dan web (Next.js). Skema validasi, tipe, dan kontrak API dipusatkan di `@packages/validator` sebagai **single source of truth** antara backend `apps/api` dan frontend `apps/web`.

Status: **fondasi tahap awal** — API + module CRUD teladan (`roles`) sudah berfungsi; auth & fitur dokumen menyusul (lihat [Kekurangan](#kekurangan-saat-ini) dan [Roadmap](#roadmap)).

---

## Arsitektur

```
documan/
├── apps/
│   ├── api/            # NestJS 12 REST API (modular, per-feature)
│   └── web/            # Next.js 16 + Turbopack (masih starter)
├── packages/
│   ├── core/           # Error (AppError), format respons, pagination helpers
│   ├── logger/         # Pino logger + serializer + redaction
│   ├── validator/      # Zod schemas & types (SSOT api ↔ web)
│   ├── db/             # Prisma 7 (driver adapter), client, seed, migrasi
│   ├── auth/           # JWT (jose), argon2 password, result-object guards
│   ├── client/         # Typed API client (zod-based) untuk web
│   ├── documentation/  # Setup Swagger + konversi zod → OpenAPI
│   ├── testing/        # Factories, cleanDatabase, token test dll.
│   └── ui/             # Komponen shadcn/ui
├── configs/
│   ├── environment/    # loadEnv + validateEnv (fail-fast)
│   ├── typescript/     # Base tsconfig
│   └── eslint/         # Shared eslint config
├── scripts/            # Helper manajemen workspace (catalog, add apps/packages)
├── turbo.json          # Pipeline build/lint/typecheck/dll.
└── pnpm-workspace.yaml
```

**Prinsip:** setiap schema tabel & kontrak request/response ditulis **satu kali** di `@packages/validator`, lalu dipakai oleh `apps/api` (validasi + Swagger) dan nantinya `@packages/client`/`apps/web`.

---

## Teknologi

| Area        | Pilihan                                                     |
| ----------- | ----------------------------------------------------------- |
| Package mgr | pnpm 10 (workspace) + Turborepo 2.10                        |
| API         | NestJS 12, Express                                          |
| Web         | Next.js 16 (Turbopack), Tailwind, shadcn/ui                 |
| DB          | PostgreSQL, Prisma 7 (driver adapter `@prisma/adapter-pg`)  |
| Validation  | Zod 4 (+ `z.coerce` untuk query)                            |
| Swagger     | `@nestjs/swagger` + converter `zod → OpenAPI`               |
| Logging     | Pino (pretty di dev, JSON di produksi) + redaction otomatis |
| Lint/Type   | oxlint (type-aware), Prettier, tsc                          |

---

## Memulai

```bash
# 1. Install
pnpm install

# 2. Konfigurasi env — salin .env.example ke .env (root)
cp .env.example .env

# 3. Persiapkan database (PostgreSQL)
pnpm --filter @packages/db db:migrate   # migrate dev (buat shadow DB) — atau
pnpm --filter @packages/db exec prisma migrate deploy  # pakai migrasi yang ada
pnpm --filter @packages/db db:seed      # seed role admin/editor/viewer

# 4. Jalankan semua (dev watch)
pnpm dev
```

| Layanan    | URL                                                                            |
| ---------- | ------------------------------------------------------------------------------ |
| Web        | `http://localhost:3000`                                                        |
| API        | `http://localhost:3001` (default, ikuti `API_PORT` di `.env`, saat ini `4000`) |
| API health | `GET /health`, `GET /health/ready`                                             |
| Swagger    | `GET /docs` (hanya `NODE_ENV != production`)                                   |

### Skrip umum (via turbo)

```bash
pnpm dev          # semua workspace watch
pnpm lint         # lint seluruh workspace
pnpm typecheck    # typecheck seluruh workspace
pnpm build        # build seluruh workspace
pnpm format       # prettier
```

---

## API — ringkasan

Berjalan per-feature module di `apps/api/src/modules/`:

- `health` — liveness/readiness probe.
- `roles` — CRUD lengkap (referensi/teladan):
  - `GET /roles` (paginasi `?page&limit&search&status`)
  - `POST /roles`, `GET/PATCH/DELETE /roles/:id`
  - Uniqueness `title` case-insensitive, timestamp `createdAt`/`updatedAt`.

Semua respons memakai format standar `@packages/core` → `{ success, data, meta | error: { code, message, details } }`.

Detail lengkap, konvensi endpoint baru, dan catatan NestJS 12 → **[apps/api/README.md](apps/api/README.md)**.

---

## Packages & Configs

| Package/Config            | Deskripsi                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
| `@packages/core`          | `AppError` + subclasses, `errorResponse`, `paginatedResponse`, pagination helpers                 |
| `@packages/logger`        | `createLogger` (pino), `serializeError/Response`, `withLogContext`, `DEFAULT_REDACT`              |
| `@packages/validator`     | Zod schemas & types; `IdParamsSchema`, `paginatedResponseSchema` generik                          |
| `@packages/db`            | Prisma client singleton, migrasi, `db:seed`, `cleanDatabase`-ready                                |
| `@packages/auth`          | `signToken/verifyToken`, Argon2 `hash/verify`, `requireAuth/requireRole` (belum dipakai endpoint) |
| `@packages/documentation` | `setupSwagger`, `buildSwaggerConfig`, `zodToOpenApi`, `paginatedOpenApiResponse`                  |
| `@packages/client`        | Typed API client berbasis zod (untuk web; belum terhubung)                                        |
| `@packages/ui`            | Komponen shadcn/ui (`@packages/ui/components/*`)                                                  |
| `@packages/testing`       | `createRoleFixture`, `cleanDatabase`, `seedRole(s)`, `createTestToken`, `authHeader`              |
| `@configs/environment`    | `loadEnv` (root `.env`) + `validateEnv` (fail-fast offline buatan)                                |
| `@configs/typescript`     | Base `tsconfig.json` bersama                                                                      |
| `@configs/eslint`         | Shared eslint config                                                                              |

---

## Kekurangan Saat Ini

Keadaan jujur sebelum "produksi siap pakai":

1. **Belum ada autentikasi** — seluruh route API publik; `JWT_SECRET` belum diset di `.env` (dev hanya warning, tapi auth akan gagal). Perlu `JwtAuthGuard`/`RolesGuard` + model `User`.
2. **Uniqueness `roles.title` case-insensitive hanya proteksi app-level** — dua permintaan `POST` bersamaan bisa lolos (belum ada unique index `lower(title)` di DB).
3. **Rate limit in-memory** (per-instance) — cukup untuk 1 proses; multi-instance produksi butuh shared store (Redis).
4. **Produksi via `tsx`** (`start:prod = tsx src/main.ts`) — workspace TS dieksekusi langsung, bukan bundel `dist`. Nest CLI 12: `esbuild` tidak didukung, `webpack` tidak mendukung ESM, `rspack` gagal membundel Prisma/pg. Rencana: build `@packages/*` → `dist` + `node dist`.
5. **Belum ada test** — unit & e2e (supertest) belum ditulis; infrastruktur `@packages/testing` sudah siap.
6. **`apps/web` masih starter** — belum terhubung ke API (`@packages/client` belum dipakai).
7. **Swagger hanya aktif di development** — sengaja, demi keamanan di produksi.

---

## Roadmap

- **Fase A — Auth** (email + password): model `User` (Argon2 hash), `POST /auth/login`, `POST /auth/register`, `GET /auth/me`; `JwtAuthGuard`/`RolesGuard` global; mutasi `roles` → admin-only.
- **Fase B — Admin users** CRUD (`/users`).
- **Fase C — Documents** (produk inti): markdown, draft/published, versi-dan-riwayat (`Document`, `DocumentVersion`).
- **Fase D — Integrasi web**: `@packages/client` (login, daftar & editor dokumen).
- **Fase E — Test & CI**: unit + e2e; pipeline CI lint/typecheck/test.
- **Opsional polish**: unique index `lower(title)` di DB; rate-limit Redis; build `@packages/*` → `dist` + `node dist` untuk produksi.

---

## Kontribusi

- Konvensi teknis & aturan agent → **[AGENTS.md](AGENTS.md)**.
- Panduan menambah workspace: `pnpm apps:add`, `pnpm packages:add`, `pnpm catalog:add` (lihat `scripts/`).
