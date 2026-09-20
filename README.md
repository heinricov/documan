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

Panduan langkah-demi-langkah untuk menambah entity baru. Pola yang sama berlaku untuk semua entity (Role, User, DocType, Partner, Box, Subsidiary).

### Overview

```
packages/db          → Model database (Prisma)
packages/validator   → Zod schemas & types (SSOT)
packages/client      → Typed API client
packages/testing     → Factory & seed helper
apps/api             → NestJS module (controller + service)
apps/web             → Config object + route pages (menggunakan generic components)
```

**Total: ~15 file baru + beberapa file modifikasi** (jauh lebih sedikit berkat generic components)

---

### Langkah 1: Database (`packages/db`)

#### 1.1 Tambah model di Prisma schema

```prisma
// packages/db/prisma/schema.prisma

model Box {
  id          String   @id @default(uuid()) @db.Uuid
  noBox       String   @unique @map("no_box")
  title       String?
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("boxes")
}
```

**Konvensi:**
- ID selalu UUID (`@default(uuid()) @db.Uuid`)
- Field `createdAt` dan `updatedAt` wajib ada
- Gunakan `@@map("table_name")` untuk nama tabel explicit
- Field sensitif (password) tidak perlu ada di schema Zod response

#### 1.2 Jalankan migration

```bash
pnpm --filter @packages/db prisma:migrate --name add_<entity>_model
pnpm --filter @packages/db prisma:generate
```

---

### Langkah 2: Validation Schemas (`packages/validator`)

#### 2.1 Buat file schema

```typescript
// packages/validator/src/schemas/box.ts

import { z } from "zod"

export const BoxSchema = z.object({
  id: z.string().uuid(),
  noBox: z.string().min(1).max(100),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const CreateBoxSchema = z.object({
  noBox: z.string().min(1, "Nomor box wajib diisi").max(100),
  title: z.string().max(200).nullable().optional(),
  description: z.string().nullable().optional(),
})

export const UpdateBoxSchema = z.object({
  noBox: z.string().min(1).max(100).optional(),
  title: z.string().max(200).nullable().optional(),
  description: z.string().nullable().optional(),
})

export const BoxQuerySchema = z.object({
  id: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
})

export type Box = z.infer<typeof BoxSchema>
export type CreateBox = z.infer<typeof CreateBoxSchema>
export type UpdateBox = z.infer<typeof UpdateBoxSchema>
export type BoxQuery = z.infer<typeof BoxQuerySchema>
```

**Konvensi:**
- 4 schema: `EntitySchema`, `CreateEntitySchema`, `UpdateEntitySchema`, `EntityQuerySchema`
- Types di-infer dari schemas (`z.infer<typeof ...>`)
- Query schema pakai `z.coerce.number()` untuk HTTP query params

#### 2.2 Export di `packages/validator/src/index.ts`

```typescript
// ====================== Box Schemas ======================
export { BoxSchema, CreateBoxSchema, UpdateBoxSchema, BoxQuerySchema } from "@packages/validator/schemas/box"

// ====================== Box Types ======================
export type { Box, CreateBox, UpdateBox, BoxQuery } from "@packages/validator/schemas/box"
```

---

### Langkah 3: API Client (`packages/client`)

#### 3.1 Buat resource file

```typescript
// packages/client/src/resources/boxes.ts

import { z } from "zod"
import type { Http } from "../http"
import {
  BoxSchema, CreateBoxSchema, UpdateBoxSchema, BoxQuerySchema,
  type Box, type CreateBox, type UpdateBox,
} from "@packages/validator"

export interface BoxesResource {
  list(query?: z.input<typeof BoxQuerySchema>): Promise<Box[]>
  get(id: string): Promise<Box>
  create(data: CreateBox): Promise<Box>
  update(id: string, data: UpdateBox): Promise<Box>
  remove(id: string): Promise<Box>
}

export function createBoxesResource(http: Http): BoxesResource {
  const path = "/boxes"
  return {
    list(query) {
      const parsed = BoxQuerySchema.parse(query ?? {})
      return http.request(z.array(BoxSchema), path, { method: "GET", query: parsed as Record<string, unknown> })
    },
    get(id) { return http.request(BoxSchema, `${path}/${id}`, { method: "GET" }) },
    create(data) {
      const parsed = CreateBoxSchema.parse(data)
      return http.request(BoxSchema, path, { method: "POST", body: parsed })
    },
    update(id, data) {
      const parsed = UpdateBoxSchema.parse(data)
      return http.request(BoxSchema, `${path}/${id}`, { method: "PATCH", body: parsed })
    },
    remove(id) { return http.request(BoxSchema, `${path}/${id}`, { method: "DELETE" }) },
  }
}
```

#### 3.2 Tambah ke `packages/client/src/resources/index.ts`

```typescript
import { createBoxesResource, type BoxesResource } from "./boxes"

// Tambahkan ke interface Resources dan createResources()
boxes: BoxesResource
```

#### 3.3 Export type di `packages/client/src/index.ts`

```typescript
export type { BoxesResource } from "./resources/index"
```

---

### Langkah 4: API Backend (`apps/api`)

Buat folder `apps/api/src/modules/boxes/` dengan 4 file:

#### 4.1 `box.module.ts`

```typescript
import { Module } from "@nestjs/common"
import { BoxController } from "./box.controller.js"
import { BoxService } from "./box.service.js"

@Module({
  controllers: [BoxController],
  providers: [BoxService],
  exports: [BoxService],
})
export class BoxesModule {}
```

#### 4.2 `box.service.ts`

```typescript
import { Injectable } from "@nestjs/common"
import { prisma, type Box as BoxRecord } from "@packages/db"
import { ConflictError, NotFoundError, paginatedResponse, parseOffsetPagination, toPrismaArgs, type PaginatedResponse } from "@packages/core"
import type { CreateBox, Box, BoxQuery, UpdateBox } from "@packages/validator"

@Injectable()
export class BoxService {
  async findAll(query: BoxQuery): Promise<PaginatedResponse<Box>> {
    const { page, limit, offset } = parseOffsetPagination(query)
    const { skip, take } = toPrismaArgs({ page, limit, offset })
    const keyword = query.search

    const where = keyword
      ? { noBox: { contains: keyword, mode: "insensitive" as const } }
      : {}

    const [items, total] = await Promise.all([
      prisma.box.findMany({ where, skip, take, orderBy: { noBox: "asc" } }),
      prisma.box.count({ where }),
    ])

    return paginatedResponse(items.map(serializeBox), { page, limit, total })
  }

  async findById(id: string): Promise<Box> {
    const box = await prisma.box.findUnique({ where: { id } })
    if (!box) throw new NotFoundError("Box")
    return serializeBox(box)
  }

  async create(data: CreateBox): Promise<Box> {
    const noBox = data.noBox.trim()
    const existing = await prisma.box.findFirst({ where: { noBox: { equals: noBox, mode: "insensitive" } } })
    if (existing) throw new ConflictError(`Nomor box "${noBox}" sudah ada`)
    return serializeBox(await prisma.box.create({ data: { noBox, title: data.title, description: data.description } }))
  }

  async update(id: string, data: UpdateBox): Promise<Box> {
    const existing = await prisma.box.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError("Box")
    const noBox = data.noBox?.trim()
    if (noBox && noBox !== existing.noBox) {
      const clash = await prisma.box.findFirst({ where: { noBox: { equals: noBox, mode: "insensitive" }, id: { not: id } } })
      if (clash) throw new ConflictError(`Nomor box "${noBox}" sudah ada`)
    }
    return serializeBox(await prisma.box.update({ where: { id }, data: { ...(noBox ? { noBox } : {}), ...(data.title !== undefined ? { title: data.title } : {}), ...(data.description !== undefined ? { description: data.description } : {}) } }))
  }

  async remove(id: string): Promise<Box> {
    const existing = await prisma.box.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError("Box")
    return serializeBox(await prisma.box.delete({ where: { id } }))
  }
}

function serializeBox(box: BoxRecord): Box {
  return { id: box.id, noBox: box.noBox, title: box.title, description: box.description, createdAt: box.createdAt.toISOString(), updatedAt: box.updatedAt.toISOString() }
}
```

#### 4.3 `box.controller.ts`

Pola sama dengan controller lain — pakai `@ZodQuery`, `@ZodBody`, `@ZodParams` + Swagger decorators. Lihat file controller lain sebagai referensi.

#### 4.4 `box.swagger.ts`

```typescript
import { zodToOpenApi, paginatedOpenApiResponse } from "@packages/documentation"
import { BoxSchema, CreateBoxSchema, UpdateBoxSchema } from "@packages/validator"

export const boxSchema = zodToOpenApi(BoxSchema)
export const createBoxSchema = zodToOpenApi(CreateBoxSchema)
export const updateBoxSchema = zodToOpenApi(UpdateBoxSchema)
export const paginatedBoxSchema = paginatedOpenApiResponse(boxSchema)
```

#### 4.5 Daftarkan module di `apps/api/src/app.module.ts`

```typescript
import { BoxesModule } from "./modules/boxes/box.module.js"

@Module({
  imports: [/* ...existing */, BoxesModule],
})
```

---

### Langkah 5: Testing (`packages/testing`)

#### 5.1 Tambah factory di `packages/testing/src/factories.ts`

```typescript
import type { CreateBox } from "@packages/validator"

let boxCounter = 0

export interface BoxOverrides {
  noBox?: string
  title?: CreateBox["title"]
  description?: CreateBox["description"]
}

export function createBoxFixture(overrides: BoxOverrides = {}): CreateBox {
  boxCounter++
  return {
    noBox: overrides.noBox ?? `BOX-${boxCounter}-${crypto.randomUUID().slice(0, 8)}`,
    title: overrides.title,
    description: overrides.description,
  }
}

export function resetBoxCounter(): void { boxCounter = 0 }
```

#### 5.2 Tambah seed helper di `packages/testing/src/db.ts`

```typescript
export async function seedBox(overrides: BoxOverrides = {}, db: Db = defaultPrisma): Promise<Box> {
  const data = createBoxFixture(overrides)
  return serializeBox(await db.box.create({ data: { noBox: data.noBox, title: data.title ?? undefined, description: data.description ?? undefined } }))
}
```

#### 5.3 Export di `packages/testing/src/index.ts`

```typescript
export { createBoxFixture, resetBoxCounter } from "./factories.js"
export type { BoxOverrides } from "./factories.js"
export { seedBox, seedBoxes } from "./db.js"
```

---

### Langkah 6: Web Frontend (`apps/web`)

Web menggunakan **generic components** — tidak perlu copy-paste. Cukup definisikan config objects.

#### 6.1 Tambah route constant

```typescript
// apps/web/lib/constants.ts
export const ROUTES = {
  // ...existing
  box: "/dashboard/box",
} as const
```

#### 6.2 Buat feature hooks

```
apps/web/features/box/hooks/
├── use-box.ts       ← useBox(id) — wrapper thin dari useEntityItem
├── use-boxes.ts     ← useBoxes() — wrapper thin dari useEntityList
└── index.ts
```

Contoh `use-box.ts`:

```typescript
"use client"
import { useCallback } from "react"
import type { Box } from "@packages/validator"
import { api } from "@/lib/api"
import { useEntityItem } from "@/lib/hooks"

export function useBox(id: string | undefined) {
  const getter = useCallback((boxId: string) => api.resources.boxes.get(boxId), [])
  const { item, ...rest } = useEntityItem(id, getter, "box")
  return { box: item, ...rest }
}
```

#### 6.3 Buat feature components (config objects)

```
apps/web/features/box/components/
├── form-box.tsx      ← Config + <EntityForm>
├── table-box.tsx     ← Config + <EntityTable>
└── index.ts
```

Contoh `form-box.tsx` — cukup config, tidak ada copy-paste:

```typescript
"use client"
import { CreateBoxSchema, UpdateBoxSchema, type Box } from "@packages/validator"
import { api } from "@/lib/api"
import { ROUTES } from "@/lib/constants"
import { EntityForm, type EntityFormConfig } from "@/components/entity"

const config: EntityFormConfig = {
  entityName: "Box",
  entityNamePlural: "Boxes",
  baseUrl: ROUTES.box,
  createSchema: CreateBoxSchema,
  updateSchema: UpdateBoxSchema,
  createFn: (data) => api.resources.boxes.create(data as { noBox: string; title?: string | null; description?: string | null }),
  updateFn: (id, data) => api.resources.boxes.update(id, data as { noBox?: string; title?: string | null; description?: string | null }),
  fields: [
    { name: "noBox", label: "No Box", description: "Nomor box (unik)", placeholder: "cth. BOX-001", required: true },
    { name: "title", label: "Title", description: "Judul box (opsional)", placeholder: "cth. Arsip Dokumen 2026" },
    { name: "description", label: "Deskripsi", description: "Penjelasan singkat box ini", render: "textarea", maxLength: 200 },
  ],
}

export function FormBox({ mode, boxId, initialData }: {
  mode?: "create" | "edit"
  boxId?: string
  initialData?: Pick<Box, "noBox" | "title" | "description">
}) {
  return <EntityForm config={config} mode={mode} entityId={boxId} initialData={initialData} />
}
```

Contoh `table-box.tsx`:

```typescript
"use client"
import { useMemo } from "react"
import { DataTableColumn } from "@packages/ui/table/table-data"
import { ColumnSortDataTable } from "@packages/ui/table/column-sortable"
import type { Box } from "@packages/validator"
import { Archive } from "lucide-react"
import { useRouter } from "next/navigation"
import { ROUTES } from "@/lib/constants"
import { useBoxes } from "../hooks/use-boxes"
import { EntityTable, type EntityTableConfig } from "@/components/entity"

const columns: DataTableColumn<Box>[] = [
  ColumnSortDataTable<Box>({ accessorKey: "noBox", label: "No Box" }),
  ColumnSortDataTable<Box>({ accessorKey: "title", label: "Title" }),
  ColumnSortDataTable<Box>({ accessorKey: "description", label: "Deskripsi" }),
  ColumnSortDataTable<Box>({ accessorKey: "createdAt", label: "Created", align: "end", format: "date", sortFn: "datetime" }),
  ColumnSortDataTable<Box>({ accessorKey: "updatedAt", label: "Updated", align: "end", format: "date", sortFn: "datetime" }),
]

export function TableDataBox() {
  const router = useRouter()
  const { boxes, isLoading, error, deleteBox } = useBoxes()

  const config: EntityTableConfig<Box> = useMemo(() => ({
    items: boxes, isLoading, error, removeItem: deleteBox, columns,
    getRowId: (b) => b.id, getRowLabel: (b) => b.noBox,
    entityName: "Box", entityNamePlural: "boxes", title: "Boxes",
    icon: <Archive className="size-4 text-muted-foreground" />,
    description: `${boxes.length} box(es) in your workspace`,
    searchColumnId: ["noBox", "title", "description"],
    searchPlaceholder: "Search boxes...",
    columnLabels: { noBox: "No Box", title: "Title", description: "Deskripsi", createdAt: "Created", updatedAt: "Updated" },
    noResultsMessage: isLoading ? "Memuat..." : (error ?? "No results."),
    primaryAction: { title: "New Box", onClick: () => router.push(`${ROUTES.box}/add`) },
    rowActions: (box) => [
      { label: "Edit", onClick: () => router.push(`${ROUTES.box}/${box.id}/edit`) },
      { label: "View", onClick: () => router.push(`${ROUTES.box}/${box.id}/view`) },
    ],
  }), [boxes, isLoading, error, deleteBox, router])

  return <EntityTable config={config} />
}
```

#### 6.4 Buat route pages

```
apps/web/app/dashboard/box/
├── page.tsx                 ← <TableDataBox />
├── add/page.tsx             ← <FormBox />
└── [id]/
    ├── edit/page.tsx        ← <EntityEditPage> + <FormBox mode="edit" />
    └── view/page.tsx        ← <EntityForm mode="view" />
```

Contoh view page — menggunakan `EntityForm mode="view"`:

```typescript
"use client"
import { useParams } from "next/navigation"
import { useBox } from "@/features/box/hooks"
import { ROUTES } from "@/lib/constants"
import { EntityForm, type EntityFormConfig } from "@/components/entity"

const config: EntityFormConfig = {
  entityName: "Box", entityNamePlural: "Boxes", baseUrl: ROUTES.box,
  createSchema: { safeParse: () => ({ success: true }) },
  updateSchema: { safeParse: () => ({ success: true }) },
  createFn: async () => {}, updateFn: async () => {},
  fields: [
    { name: "noBox", label: "No Box" },
    { name: "title", label: "Title" },
    { name: "description", label: "Deskripsi" },
  ],
}

export default function ViewBoxPage() {
  const params = useParams<{ id: string }>()
  const { box, isLoading, error } = useBox(params?.id)

  if (isLoading) return <section className="flex min-h-svh items-center justify-center"><p>Memuat...</p></section>
  if (error || !box) return <section className="flex min-h-svh items-center justify-center"><p className="text-destructive">{error ?? "Tidak ditemukan."}</p></section>

  return <EntityForm config={config} mode="view" entityId={box.id} initialData={box} />
}
```

#### 6.5 Tambah menu di dashboard layout

```typescript
// apps/web/app/dashboard/layout.tsx
items: [
  // ...existing
  { title: "Box", url: "/dashboard/box" },
]
```

---

### Checklist Lengkap

| # | File | Aksi |
|---|------|------|
| 1 | `packages/db/prisma/schema.prisma` | Tambah model |
| 2 | `packages/validator/src/schemas/<entity>.ts` | **Buat baru** |
| 3 | `packages/validator/src/index.ts` | Tambah export |
| 4 | `packages/client/src/resources/<entities>.ts` | **Buat baru** |
| 5 | `packages/client/src/resources/index.ts` | Tambah ke Resources |
| 6 | `packages/client/src/index.ts` | Tambah export type |
| 7 | `apps/api/src/modules/<entities>/<entity>.module.ts` | **Buat baru** |
| 8 | `apps/api/src/modules/<entities>/<entity>.service.ts` | **Buat baru** |
| 9 | `apps/api/src/modules/<entities>/<entity>.controller.ts` | **Buat baru** |
| 10 | `apps/api/src/modules/<entities>/<entity>.swagger.ts` | **Buat baru** |
| 11 | `apps/api/src/app.module.ts` | Tambah import module |
| 12 | `packages/testing/src/factories.ts` | Tambah factory |
| 13 | `packages/testing/src/db.ts` | Tambah seed + serialize |
| 14 | `packages/testing/src/index.ts` | Tambah export |
| 15 | `apps/web/lib/constants.ts` | Tambah ke ROUTES |
| 16 | `apps/web/features/<entity>/hooks/` | **Buat baru** (useEntityItem wrapper) |
| 17 | `apps/web/features/<entity>/components/` | **Buat baru** (config objects) |
| 18 | `apps/web/app/dashboard/<entity>/` | **Buat baru** (route pages) |
| 19 | `apps/web/app/dashboard/layout.tsx` | Tambah menu |
| 20 | `packages/db/scripts/seed/<entity>.ts` | **Buat baru** |
| 21 | `packages/db/scripts/clean/<entity>.ts` | **Buat baru** |
| 22 | `packages/db/scripts/seed/index.ts` | Tambah ke SEEDERS |
| 23 | `packages/db/scripts/lib/clean-table.ts` | Tambah ke TABLES |
| 24 | `packages/db/package.json` | Tambah script |

**Tips:** Web frontend sekarang pakai generic components (`EntityForm`, `EntityTable`, `EntityEditPage`). Cukup definisikan config objects — tidak perlu copy-paste form/table/view boilerplate.
