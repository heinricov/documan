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
│   ├── auth/               # JWT (jose), Argon2, guard helpers (belum aktif)
│   ├── client/             # Typed API client (untuk web; belum terhubung)
│   ├── testing/            # Factories, seed, clean database, token test
│   ├── ui/                 # Komponen UI (shadcn/ui pattern) untuk web
│   └── configs/
│       ├── environment/    # loadEnv + validateEnv (fail-fast)
│       ├── typescript/     # Base tsconfig monorepo
│       └── eslint/         # Konfigurasi ESLint bersama
├── scripts/                # Helper pnpm workspace (add app/package/dll)
└── pnpm-workspace.yaml
```

**Prinsip:** paket-paket di `@packages/*` adalah **Source of Truth**; `apps/api` dan `apps/web` hanya memakai, tidak mendefinisikan ulang. Contoh: schema & validasi request ada di `@packages/validator` — dipakai Nest via `@ZodQuery({ zod })` dan nanti dipakai Next web + API client.

---

## Teknologi

| Area                  | Pilihan                                                     |
| --------------------- | ------------------------------------------------------------ |
| Runtime               | Node 24 ESM, TypeScript (ESM + `nodenext`)                    |
| Package manager       | pnpm 10 (workspace) + Turborepo                              |
| API                   | NestJS 12 (NestFactory via `@packages/db`), Express          |
| Web                   | Next.js 16 (App Router, Turbopack)                           |
| Database              | PostgreSQL + Prisma 7 (driver adapter `pg`)                  |
| Validasi              | Zod 4 (SSOT — request, response, tipe)                       |
| Dokumentasi API       | Swagger/OpenAPI via `@packages/documentation`                |
| Logging               | Pino (via `@packages/logger`) — dipakai logger NestJS + request log |
| Lint / fmt            | oxlint, Prettier (via ad-hoc configs monorepo)               |

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

## API — Ringkasan

REST API NestJS modular di `apps/api`. Setiap fitur = module mandiri (`src/modules/<fitur>/`) dengan controller, service, validator, & swagger sendiri.

### Roles (fitur teladan — CRUD lengkap)

| Method | Route                | Keterangan                              |
| ------ | -------------------- | --------------------------------------- |
| GET    | `/roles`             | List role (paginasi + filter)           |
| POST   | `/roles`             | Buat role (title unik, case-insensitive) |
| GET    | `/roles/:id`         | Detail role                              |
| PATCH  | `/roles/:id`         | Update role                             |
| DELETE | `/roles/:id`         | Hapus role                              |

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

| Package             | Deskripsi                                                                     |
| ------------------- | ----------------------------------------------------------------------------- |
| `@packages/core`    | `AppError` + subclasses, `errorResponse`, `paginatedResponse`, pagination helpers |
| `@packages/logger`  | `createLogger` (pino), `serializeError/Response`, `withLogContext`, `DEFAULT_REDACT` |
| `@packages/validator`| Zod schemas & tipe (SSOT) — role, query, id params, common       |
| `@packages/documentation` | Swagger bootstrap + `zodToOpenApi` + helper pagination OpenAPI          |
| `@packages/db`      | Prisma client (driver adapter), migrasi + seed                                  |
| `@packages/auth`    | JWT sign/verify (jose), Argon2 hash, guard helpers SSOT (belum dipakai)        |
| `@packages/client`  | Typed API client (untuk web; belum terhubung ke apps/web)                       |
| `@packages/testing` | `createRoleFixture`, `cleanDatabase`, `seedRole`, `createTestToken`             |
| `@packages/ui`      | Komponen UI (field, input, button, dll) untuk apps/web                          |
| `@configs/environment` | `loadEnv` root `.env` + `validateEnv` (fail-fast, aman env)                 |
| `@configs/typescript`  | `tsconfig.base.json` — konfigurasi TS monorepo                             |
| `@configs/eslint`   | Shared eslint config                                                            |

---

## Kekurangan Saat Ini (jujur)

1. **Belum ada autentikasi** — seluruh route API publik; butuh `JWT_SECRET` di `.env` + model `User` + guard. `@packages/auth` sudah siap.
2. **Tidak ada test** (unit/e2e) — infra `@packages/testing` sudah ada; dimajukan ke roadmap.
3. **`apps/web` masih starter** — belum terhubung ke `apps/api` (via `@packages/client`).
4. **Prisma migrate hanya untuk dev** — produksi butuh `prisma migrate deploy` (séparate) & build distribusi (lihat catatan NestJS di `apps/api/README` `#Produksi`).
5. **Rate limiting in-memory** — cukup untuk 1 instance; multi-instance butuh store bersama (Redis).
6. **Swagger hanya aktif di development** (aman untuk produksi).

---

## Roadmap

- **[ ]** Auth: model `User` + login/register + `JwtAuthGuard`/`RolesGuard` + proteksi route CRUD roles admin-only
- **[ ]** CRUD `users` (admin)
- **[ ]** Feature inti **documents** (markdown + versi + riwayat); validasi & tipe di `@packages/validator`
- **[ ]** Integrasi web: `@packages/client` + login page + daftar/pilih dokumen + editor
- **[ ]** Test unit + e2e (supertest) + CI (lint/typecheck/test)
- **[ ]** Produksi: build `packages/*` → `dist` + `node dist/main` (hilangkan ketergantungan `tsx`)

---

## Kontribusi

- Petunjuk developer & aturan → [AGENTS.md](AGENTS.md).
- Menambahkan app/package baru → `pnpm apps:add` / `pnpm packages:add` (lihat `scripts/README.md`).
