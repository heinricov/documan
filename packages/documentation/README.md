# @packages/documentation

OpenAPI / Swagger integration untuk NestJS API. Setup dokumentasi, DocumentBuilder, dan konversi zod schema → JSON Schema OpenAPI.

## Table of Contents

- [Setup](#setup)
- [Quick Start](#quick-start)
- [Zod → OpenAPI](#zod--openapi)
- [Konfigurasi](#konfigurasi)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

---

## Setup

Package sudah terinstall di workspace monorepo.

```bash
pnpm install
```

Dependencies:
- `@nestjs/swagger@^12` — SwaggerModule & DocumentBuilder
- `zod@^4.4` — untuk konversi schema → JSON Schema

---

## Quick Start

```typescript
// apps/api/src/main.ts
import { NestFactory } from "@nestjs/core"
import { setupSwagger } from "@packages/documentation"
import { AppModule } from "./app.module.js"

const app = await NestFactory.create(AppModule)

if (process.env.NODE_ENV !== "production") {
  setupSwagger(app, {
    title: "Documan API",
    description: "REST API untuk aplikasi Documan",
    version: "1.0",
  })
  // Swagger UI tersedia di http://localhost:3001/docs
}
```

**UI**: `http://localhost:3001/docs`

---

## Zod → OpenAPI

`zodToOpenApi(schema)` mengkonversi zod schema menjadi JSON Schema standar OpenAPI untuk dipakai di decorator Swagger (`@ApiBody`, `@ApiOkResponse`, `@ApiProperty` via custom, dll).

```typescript
import { ApiBody, ApiOkResponse } from "@nestjs/swagger"
import { zodToOpenApi } from "@packages/documentation"
import { CreateRoleSchema, RoleSchema } from "@packages/validator"

@ApiBody({ schema: zodToOpenApi(CreateRoleSchema) })
@ApiOkResponse({ schema: zodToOpenApi(RoleSchema) })
async create(@Body() body: CreateRole) { ... }
```

Untuk respons list terpaginasi, pakai `paginatedOpenApiResponse(itemSchema)` — membungkus `{ success, data: [item], meta }`:

```typescript
import { paginatedOpenApiResponse, zodToOpenApi } from "@packages/documentation"
import { ApiOkResponse } from "@nestjs/swagger"

@ApiOkResponse({ schema: paginatedOpenApiResponse(zodToOpenApi(RoleSchema)) })
async findAll(@Query() query: unknown) { ... }
```

**Tipe yang didukung:**

| zod | OpenAPI JSON Schema |
|-----|---------------------|
| `z.string()` | `{ type: "string" }` |
| `z.number()` | `{ type: "number" }` |
| `z.boolean()` | `{ type: "boolean" }` |
| `z.null()` | `{ type: "null" }` |
| `z.literal(val)` | `{ const: val }` |
| `z.enum([...])` | `{ type: "string", enum: [...] }` |
| `z.array(...)` | `{ type: "array", items: ... }` |
| `z.object({...})` | `{ type: "object", properties, required }` |
| `z.record(...)` | `{ type: "object", additionalProperties: ... }` |
| `z.optional(...)` | (terbungkus, mempengaruhi `required` di object) |
| `z.nullable(...)` | `{ anyOf: [..., { type: "null" }] }` |
| `z.union([...])` | `{ anyOf: [...] }` |
| `z.default(...)` | + `default` value |
| `z.date()` | `{ type: "string", format: "date-time" }` |

**Format string yang dideteksi:**
`uuid`, `email`, `uri`, `date`, `date-time`, `time`, `ipv4`, `ipv6`, `cuid`, `ulid`

---

## Konfigurasi

### `buildSwaggerConfig(options)`

Mengembalikan OpenAPI config dari DocumentBuilder — siap dilempar ke `SwaggerModule.createDocument()`.

```typescript
import { buildSwaggerConfig } from "@packages/documentation"

const config = buildSwaggerConfig({
  title: "My API",
  description: "Description",
  version: "2.0",
  bearerAuth: true,
})
```

### `setupSwagger(app, options?)`

Wrapper `setupSwagger` yang melakukan semuanya: build config → create document → serve UI.

| Option | Default | Deskripsi |
|--------|---------|-----------|
| `title` | `"Documan API"` | Judul di UI |
| `description` | — | Deskripsi singkat |
| `version` | `"1.0"` | Versi API |
| `bearerAuth` | `true` | Security scheme JWT Bearer |
| `path` | `"docs"` | URL path untuk UI |

---

## API Reference

| Function | Parameter | Return |
|----------|-----------|--------|
| `setupSwagger(app, options?)` | `INestApplication`, `SwaggerConfigOptions` | `void` |
| `buildSwaggerConfig(options?)` | `SwaggerConfigOptions` | `Omit<OpenAPIObject, "paths">` |
| `zodToOpenApi(schema)` | `z.ZodType` | `OpenApiSchema` (JSON Schema object) |
| `paginatedOpenApiResponse(itemSchema)` | `OpenApiSchema` | `OpenApiSchema` (JSON Schema object) |

---

## Troubleshooting

### Swagger UI tidak tampil

1. Pastikan `NODE_ENV` bukan `"production"` — Swagger hanya aktif di non-production.
2. Pastikan path akses benar: `http://localhost:3001/docs`
3. Cek console: tidak ada error dari SwaggerModule.

### zodToOpenApi menghasilkan schema kosong (`{}`)

Tipe zod yang tidak dikenal (mis. `z.custom()`) akan mengembalikan `{}` (any). Untuk tipe custom, gunakan `z.describe("description")` atau tentukan schema manual di decorator.

### OpenAPI tidak menampilkan field/required

Pastikan pakai `zod.object({ ... })` — zodToOpenApi membaca `def.shape` hanya untuk object schema. Field `required` dihitung dari field yang bukan `z.optional()`/`z.nullable()`/`z.default()`.

### npm run build mengalami error terkait @nestjs/common

`@nestjs/common` harus tersedia di workspace. Cek `pnpm install` sudah berjalan. Jika error terus, pastikan tidak ada versi conflict antara `@nestjs/common@^12` di berbagai package.