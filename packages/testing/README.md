# @packages/testing

Test utilities & data factories untuk aplikasi (api & web). Framework-agnostic — murni TypeScript, tidak terikat vitest/jest/spesifik, sehingga bisa dipakai di semua layer.

## Table of Contents

- [Setup](#setup)
- [Quick Start](#quick-start)
- [Factories](#factories)
- [DB Helpers](#db-helpers)
- [Auth Helpers](#auth-helpers)
- [Integrasi dengan vitest (apps/api e2e)](#integrasi-dengan-vitest-appsapi-e2e)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

---

## Setup

Package sudah terinstall di workspace monorepo.

```bash
pnpm install
```

Dependencies (semua workspace):
- `@packages/validator` — untuk memproduksi data yang valid
- `@packages/db` — Prisma client (untuk seed/clean database)
- `@packages/auth` — untuk generate JWT test

---

## Quick Start

```typescript
import {
  createRoleFixture,
  cleanDatabase,
  seedRole,
  createTestToken,
  authHeader,
} from "@packages/testing"

// 1. Buat fixture data (tanpa menyentuh DB)
const roleData = createRoleFixture({ title: "admin" })
// { title: "admin", description: undefined }

// 2. Bersihkan database sebelum test
await cleanDatabase()

// 3. Seed role ke DB — dapat id asli
const role = await seedRole({ title: "admin" })
// { id: "0c5f...", title: "admin", description: null }

// 4. Buat token JWT test
const token = await createTestToken({ userId: "user-1", role: "admin" })

// 5. Suntik header Authorization
await request(app).get("/roles").set("Authorization", authHeader(token)).expect(200)
```

---

## Factories

### `createRoleFixture(overrides?)`

Membuat objek `CreateRole` yang **dijamin valid** terhadap `CreateRoleSchema` dari `@packages/validator`. Output bisa langsung dipakai sebagai body request atau input seeder.

```typescript
import { createRoleFixture } from "@packages/testing"

// Title otomatis unik (crypto.randomUUID)
const role = createRoleFixture()
// { title: "role-1-5f7a9c12", description: undefined }

// Custom
const admin = createRoleFixture({
  title: "admin",
  description: "Full access",
})
// { title: "admin", description: "Full access" }
```

### `resetRoleCounter()`

Reset counter judul. `title` yang di-generate otomatis berbentuk `role-<n>-<random>`. Panggil di `beforeAll`/`beforeEach` agar predictable.

```typescript
beforeEach(() => resetRoleCounter())
const a = createRoleFixture().title // "role-1-..."
const b = createRoleFixture().title // "role-2-..."
```

---

## DB Helpers

### `cleanDatabase(tables?, db?)`

TRUNCATE tabel yang disebutkan (`RESTART IDENTITY CASCADE`). Default membersihkan semua tabel yang dikenal (saat ini `["roles"]`).

```typescript
import { cleanDatabase } from "@packages/testing"

// Bersihkan semua
await cleanDatabase()

// Hanya tabel tertentu
await cleanDatabase(["roles", "users"])
```

> **Catatan:** `cascade` menghapus data dari tabel dengan FK ke tabel tersebut — aman untuk suite e2e.

### `seedRole(overrides?, db?)`

Insert fixture Role dan kembalikan record tersimpan (lengkap dengan `id`).

```typescript
const role = await seedRole({ title: "admin" })
// { id: "0c5f...", title: "admin", description: null }

// Tidak perlu import createRoleFixture dulu — seed menerima overrides langsung
```

### `seedRoles(items?, db?)`

Insert banyak role sekaligus dalam satu transaction.

```typescript
const [admin, editor] = await seedRoles([
  { title: "admin" },
  { title: "editor" },
])

// Tanpa argumen → insert 1 role default (judul unik)
const [defaultRole] = await seedRoles()
```

---

## Auth Helpers

### `createTestToken(payload?)`

Membuat JWT valid via `signToken` dari `@packages/auth`. Default: `{ userId: "test-user", role: "admin" }`.

```typescript
const token = await createTestToken()
const editorToken = await createTestToken({ userId: "u-2", role: "editor" })
```

### `authHeader(token)`

Membentuk string `Bearer <token>` untuk header `Authorization`.

```typescript
await request(app).get("/roles").set("Authorization", authHeader(token))
```

---

## Integrasi dengan vitest (apps/api e2e)

Contoh lengkap e2e dengan vitest + supertest:

```typescript
// test/roles.e2e-spec.ts
import { beforeAll, afterAll, describe, it, expect } from "vitest"
import request from "supertest"
import { prisma } from "@packages/db"
import {
  cleanDatabase,
  seedRole,
  createTestToken,
  authHeader,
} from "@packages/testing"

// setup minimal — sesuaikan dengan app NestJS kamu
const appUrl = "http://localhost:3001"

beforeAll(async () => {
  await cleanDatabase()
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe("GET /roles", () => {
  it("mengembalikan daftar roles untuk admin", async () => {
    await seedRole({ title: "admin" })

    const token = await createTestToken({ role: "admin" })
    const res = await request(appUrl)
      .get("/roles")
      .set("Authorization", authHeader(token))

    expect(res.status).toBe(200)
  })

  it("menolak akses tanpa token", async () => {
    const res = await request(appUrl).get("/roles")
    expect(res.status).toBe(401)
  })
})
```

---

## API Reference

| Function | Parameter | Return |
|----------|-----------|--------|
| `createRoleFixture(overrides?)` | `RoleOverrides` | `CreateRole` |
| `resetRoleCounter()` | - | `void` |
| `cleanDatabase(tables?, db?)` | `string[]`, PrismaClientLike | `Promise<void>` |
| `seedRole(overrides?, db?)` | `RoleOverrides`, PrismaClientLike | `Promise<Role>` |
| `seedRoles(items?, db?)` | `RoleOverrides[]`, PrismaClientLike | `Promise<Role[]>` |
| `createTestToken(payload?)` | `Partial<AuthTokenPayload>` | `Promise<string>` |
| `authHeader(token)` | `string` | `string` |

**`RoleOverrides`** → `{ title?: string, description?: string | null }`

**PrismaClientLike** → type PrismaClient dari `@packages/db` (parameter `db` opsional, default instance global).

---

## Troubleshooting

### `createTestToken` melempar `JWT_SECRET_NOT_SET`

Package ini memakai `signToken` dari `@packages/auth` yang membaca env `JWT_SECRET`. Pastikan tersedia saat test berjalan:

```bash
# .env (root)
JWT_SECRET="some-long-random-value"
```

Untuk test tanpa env, panggil langsung `signToken` dengan `secret` override:

```typescript
import { signToken } from "@packages/auth"
const token = await signToken({ userId: "x", role: "admin" }, { secret: "test-secret" })
```

### `seedRole` gagal `Unique constraint` (title sudah ada)

`title` Role `@unique`. Jika test memakai title tetap dan sudah di-seed test sebelumnya, jalankan `cleanDatabase()` di `beforeAll`. Untuk judul bebas konflik, jangan supply `title` (otomatis unik).

### Butuh tabel selain `roles`

`cleanDatabase()` default hanya tabel yang dikenal. Tambahkan nama tabel:
```typescript
await cleanDatabase(["users", "roles", "tokens"])
```