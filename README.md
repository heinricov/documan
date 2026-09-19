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

Panduan langkah-demi-langkah untuk menambah entity baru (contoh: `User`). Setiap entity mengikuti pola yang sama dengan `Role`.

### Overview

```
packages/db          → Model database (Prisma)
packages/validator   → Zod schemas & types (SSOT)
packages/client      → Typed API client
apps/api             → NestJS module (controller + service)
apps/web             → Feature folder + route pages
```

**Total: ~20 file baru + 6 file modifikasi**

---

### Langkah 1: Database (`packages/db`)

#### 1.1 Tambah model di Prisma schema

```prisma
// packages/db/prisma/schema.prisma

model User {
  id        String   @id @default(uuid()) @db.Uuid
  email     String   @unique
  name      String?
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

**Konvensi:**

- ID selalu UUID (`@default(uuid()) @db.Uuid`)
- Field `createdAt` dan `updatedAt` wajib ada
- Gunakan `@@map("table_name")` untuk nama tabel explicit
- Field sensitif (password) tidak perlu ada di schema Zod response

#### 1.2 Jalankan migration

```bash
pnpm --filter @packages/db prisma:migrate
pnpm --filter @packages/db prisma:generate
```

---

### Langkah 2: Validation Schemas (`packages/validator`)

#### 2.1 Buat file schema

```typescript
// packages/validator/src/schemas/user.ts

import { z } from "zod"

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const CreateUserSchema = z.object({
  email: z.string().email("Email tidak valid"),
  name: z.string().min(1).max(100).nullable().optional(),
  password: z.string().min(8, "Password minimal 8 karakter"),
})

export const UpdateUserSchema = z.object({
  email: z.string().email("Email tidak valid").optional(),
  name: z.string().min(1).max(100).nullable().optional(),
  password: z.string().min(8).optional(),
})

export const UserQuerySchema = z.object({
  id: z.string().uuid().optional(),
  email: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
})

export type User = z.infer<typeof UserSchema>
export type CreateUser = z.infer<typeof CreateUserSchema>
export type UpdateUser = z.infer<typeof UpdateUserSchema>
export type UserQuery = z.infer<typeof UserQuerySchema>
```

**Konvensi:**

- 4 schema: `EntitySchema`, `CreateEntitySchema`, `UpdateEntitySchema`, `EntityQuerySchema`
- Types di-infer dari schemas (`z.infer<typeof ...>`)
- Query schema pakai `z.coerce.number()` karena HTTP query params selalu string

#### 2.2 Tambah exports di `packages/validator/src/index.ts`

```typescript
// ====================== Schemas ======================
export { UserSchema, CreateUserSchema, UpdateUserSchema, UserQuerySchema } from "@packages/validator/schemas/user"

// ====================== Types ======================
export type { User, CreateUser, UpdateUser, UserQuery } from "@packages/validator/schemas/user"
```

---

### Langkah 3: API Client (`packages/client`)

#### 3.1 Buat resource file

```typescript
// packages/client/src/resources/users.ts

import { z } from "zod"
import type { Http } from "../http"
import { CreateUserSchema, UserSchema, UserQuerySchema, UpdateUserSchema, type CreateUser, type User, type UpdateUser } from "@packages/validator"

export interface UsersResource {
  list(query?: z.input<typeof UserQuerySchema>): Promise<User[]>
  get(id: string): Promise<User>
  create(data: CreateUser): Promise<User>
  update(id: string, data: UpdateUser): Promise<User>
  remove(id: string): Promise<User>
}

export function createUsersResource(http: Http): UsersResource {
  const path = "/users"

  return {
    list(query) {
      const parsed = UserQuerySchema.parse(query ?? {})
      return http.request(z.array(UserSchema), path, { method: "GET", query: parsed as Record<string, unknown> })
    },
    get(id) {
      return http.request(UserSchema, `${path}/${id}`, { method: "GET" })
    },
    create(data) {
      const parsed = CreateUserSchema.parse(data)
      return http.request(UserSchema, path, { method: "POST", body: parsed })
    },
    update(id, data) {
      const parsed = UpdateUserSchema.parse(data)
      return http.request(UserSchema, `${path}/${id}`, { method: "PATCH", body: parsed })
    },
    remove(id) {
      return http.request(UserSchema, `${path}/${id}`, { method: "DELETE" })
    },
  }
}
```

#### 3.2 Tambah ke `packages/client/src/resources/index.ts`

```typescript
import { createUsersResource, type UsersResource } from "./users"

export interface Resources {
  users: UsersResource
  // ... existing resources
}

export function createResources(http: Http): Resources {
  return {
    users: createUsersResource(http),
    // ... existing resources
  }
}
```

#### 3.3 Tambah export di `packages/client/src/index.ts`

```typescript
export type { UsersResource } from "./resources/index"
```

---

### Langkah 4: API Backend (`apps/api`)

#### 4.1 Buat NestJS module

```typescript
// apps/api/src/modules/users/user.module.ts

import { Module } from "@nestjs/common"
import { UserController } from "./user.controller.js"
import { UserService } from "./user.service.js"

@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
```

#### 4.2 Buat service

```typescript
// apps/api/src/modules/users/user.service.ts

import { Injectable } from "@nestjs/common"
import { prisma } from "@packages/db"
import { NotFoundError, ConflictError } from "@packages/core"
import { parseOffsetPagination, toPrismaArgs, calculatePaginationMeta } from "@packages/core"
import type { CreateUser, UpdateUser, UserQuery } from "@packages/validator"

@Injectable()
export class UserService {
  async findAll(query: UserQuery) {
    const { page, limit, offset } = parseOffsetPagination(query)
    const where = query.search
      ? { OR: [{ email: { contains: query.search, mode: "insensitive" as const } }, { name: { contains: query.search, mode: "insensitive" as const } }] }
      : {}

    const [items, total] = await Promise.all([
      prisma.user.findMany({ where, ...toPrismaArgs({ page, limit, offset }), orderBy: { createdAt: "desc" } }),
      prisma.user.count({ where }),
    ])

    return { items: items.map(this.serialize), meta: calculatePaginationMeta({ page, limit, total }) }
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundError("User", id)
    return this.serialize(user)
  }

  async create(data: CreateUser) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) throw new ConflictError(`Email "${data.email}" sudah terdaftar`)
    const user = await prisma.user.create({ data })
    return this.serialize(user)
  }

  async update(id: string, data: UpdateUser) {
    await this.findById(id)
    if (data.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } })
      if (existing && existing.id !== id) throw new ConflictError(`Email "${data.email}" sudah terdaftar`)
    }
    const user = await prisma.user.update({ where: { id }, data })
    return this.serialize(user)
  }

  async remove(id: string) {
    await this.findById(id)
    const user = await prisma.user.delete({ where: { id } })
    return this.serialize(user)
  }

  private serialize(user: { id: string; email: string; name: string | null; createdAt: Date; updatedAt: Date }) {
    return { ...user, createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString() }
  }
}
```

**Catatan penting:** Method `serialize` mengubah `Date` objects dari Prisma menjadi ISO string agar sesuai dengan Zod schema.

#### 4.3 Buat controller

```typescript
// apps/api/src/modules/users/user.controller.ts

import { Controller, Get, Post, Patch, Delete, Param, Body, Query } from "@nestjs/common"
import { ApiTags, ApiOperation, ApiOkResponse, ApiBody, ApiParam, ApiResponse } from "@nestjs/swagger"
import { ZodBody, ZodQuery, ZodParams } from "../../common/zod.decorators.js"
import { IdParamsSchema, UserQuerySchema, CreateUserSchema, UpdateUserSchema } from "@packages/validator"
import { UserService } from "./user.service.js"
import { userSchema, createUserSchema, updateUserSchema, paginatedUserSchema } from "./user.swagger.js"

@ApiTags("Users")
@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: "List users" })
  @ApiOkResponse({ schema: paginatedUserSchema })
  findAll(@ZodQuery({ zod: UserQuerySchema }) query: any) {
    return this.userService.findAll(query)
  }

  @Post()
  @ApiOperation({ summary: "Create user" })
  @ApiBody({ schema: createUserSchema })
  @ApiOkResponse({ schema: userSchema })
  create(@ZodBody({ zod: CreateUserSchema }) data: any) {
    return this.userService.create(data)
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by ID" })
  @ApiParam({ name: "id", format: "uuid" })
  @ApiOkResponse({ schema: userSchema })
  findOne(@ZodParams({ zod: IdParamsSchema }) params: any) {
    return this.userService.findById(params.id)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update user" })
  @ApiParam({ name: "id", format: "uuid" })
  @ApiBody({ schema: updateUserSchema })
  @ApiOkResponse({ schema: userSchema })
  update(@ZodParams({ zod: IdParamsSchema }) params: any, @ZodBody({ zod: UpdateUserSchema }) data: any) {
    return this.userService.update(params.id, data)
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete user" })
  @ApiParam({ name: "id", format: "uuid" })
  @ApiOkResponse({ schema: userSchema })
  remove(@ZodParams({ zod: IdParamsSchema }) params: any) {
    return this.userService.remove(params.id)
  }
}
```

#### 4.4 Buat swagger schema

```typescript
// apps/api/src/modules/users/user.swagger.ts

import { zodToOpenApi } from "@packages/documentation"
import { paginatedOpenApiResponse } from "@packages/documentation"
import { UserSchema, CreateUserSchema, UpdateUserSchema } from "@packages/validator"

export const userSchema = zodToOpenApi(UserSchema)
export const createUserSchema = zodToOpenApi(CreateUserSchema)
export const updateUserSchema = zodToOpenApi(UpdateUserSchema)
export const paginatedUserSchema = paginatedOpenApiResponse(UserSchema)
```

#### 4.5 Tambah module ke `apps/api/src/app.module.ts`

```typescript
import { UsersModule } from "./modules/users/user.module.js"

@Module({
  imports: [
    // ... existing modules
    UsersModule,
  ],
})
export class AppModule {}
```

---

### Langkah 5: Testing (`packages/testing`)

#### 5.1 Tambah factory di `packages/testing/src/factories.ts`

```typescript
import type { CreateUser } from "@packages/validator"

let userCounter = 0

export function createUserFixture(overrides: Partial<CreateUser> = {}): CreateUser {
  userCounter++
  const randomId = crypto.randomUUID().slice(0, 8)
  return {
    email: `user-${userCounter}-${randomId}@example.com`,
    name: `User ${userCounter}`,
    password: "password123",
    ...overrides,
  }
}

export function resetUserCounter() {
  userCounter = 0
}
```

#### 5.2 Tambah seed di `packages/testing/src/db.ts`

```typescript
import type { User as UserRecord } from "@packages/db"

export async function seedUser(data: Partial<UserRecord> = {}): Promise<Record<string, unknown>> {
  const user = await prisma.user.create({
    data: {
      email: data.email ?? `test-${Date.now()}@example.com`,
      name: data.name ?? "Test User",
      password: data.password ?? "hashed-password",
      ...data,
    },
  })
  return serializeUser(user)
}

function serializeUser(user: UserRecord) {
  return { ...user, createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString() }
}
```

#### 5.3 Update `cleanDatabase` default tables

```typescript
const DEFAULT_TABLES = ["roles", "users"] // tambahkan "users"
```

---

### Langkah 6: Web Frontend (`apps/web`)

#### 6.1 Tambah route constant di `apps/web/lib/constants.ts`

```typescript
export const ROUTES = {
  role: "/role",
  user: "/user",
} as const
```

#### 6.2 Buat feature folder

```
apps/web/features/user/
├── components/
│   ├── form-user.tsx        ← Form create/edit (copy dari form-role, sesuaikan fields)
│   ├── table-user.tsx       ← Data table (copy dari table-role, sesuaikan columns)
│   └── index.ts             ← Barrel export
├── hooks/
│   ├── use-user.ts          ← useUser(id) hook
│   ├── use-users.ts         ← useUsers() hook
│   └── index.ts             ← Barrel export
└── index.ts                 ← Root barrel export
```

#### 6.3 Buat route pages

```
apps/web/app/user/
├── page.tsx                 ← List page: <TableDataUser />
├── add/page.tsx             ← Add page: <FormUser />
└── [id]/
    ├── edit/page.tsx        ← Edit page: load user → <FormUser mode="edit" />
    └── view/page.tsx        ← View page: load user → detail card
```

---

### Checklist Lengkap

| #   | File                                                     | Aksi                               |
| --- | -------------------------------------------------------- | ---------------------------------- |
| 1   | `packages/db/prisma/schema.prisma`                       | Tambah model                       |
| 2   | `packages/validator/src/schemas/<entity>.ts`             | **Buat baru**                      |
| 3   | `packages/validator/src/index.ts`                        | Tambah export                      |
| 4   | `packages/client/src/resources/<entities>.ts`            | **Buat baru**                      |
| 5   | `packages/client/src/resources/index.ts`                 | Tambah ke Resources                |
| 6   | `packages/client/src/index.ts`                           | Tambah export type                 |
| 7   | `apps/api/src/modules/<entities>/<entity>.module.ts`     | **Buat baru**                      |
| 8   | `apps/api/src/modules/<entities>/<entity>.service.ts`    | **Buat baru**                      |
| 9   | `apps/api/src/modules/<entities>/<entity>.controller.ts` | **Buat baru**                      |
| 10  | `apps/api/src/modules/<entities>/<entity>.swagger.ts`    | **Buat baru**                      |
| 11  | `apps/api/src/app.module.ts`                             | Tambah import module               |
| 12  | `packages/testing/src/factories.ts`                      | Tambah factory                     |
| 13  | `packages/testing/src/db.ts`                             | Tambah seed + serialize            |
| 14  | `packages/testing/src/index.ts`                          | Tambah export                      |
| 15  | `apps/web/lib/constants.ts`                              | Tambah ke ROUTES                   |
| 16  | `apps/web/features/<entity>/`                            | **Buat baru** (components + hooks) |
| 17  | `apps/web/app/<entity>/`                                 | **Buat baru** (route pages)        |
