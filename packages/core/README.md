# @packages/core

Shared types, response format, dan utilities untuk semua layer (**api ↔ web**). Single source of truth untuk kontrak aplikasi.

## Table of Contents

- [Setup](#setup)
- [Error Classes](#error-classes)
- [Response Format](#response-format)
  - [Success Response](#success-response)
  - [Paginated Response](#paginated-response)
  - [Error Response](#error-response)
- [Pagination](#pagination)
  - [Offset-based](#offset-based)
  - [Cursor-based](#cursor-based)
  - [Prisma Helpers](#prisma-helpers)
- [Cara Pakai](#cara-pakai)
  - [Di apps/api (NestJS)](#di-appsapi-nestjs)
  - [Di apps/web (Next.js)](#di-appsweb-nextjs)
- [Troubleshooting](#troubleshooting)

---

## Setup

Package ini **zero-dependency** — bisa dipakai di mana saja tanpa install tambahan.

```bash
pnpm install
```

---

## Error Classes

Semua error extend `AppError` dengan properti `code`, `status`, dan `message`.

| Error Class | HTTP Status | Kapan digunakan |
|-------------|-------------|-----------------|
| `ValidationError` | 400 | Request body/query tidak valid |
| `UnauthorizedError` | 401 | Belum login / token expired |
| `ForbiddenError` | 403 | Sudah login tapi tidak punya akses |
| `NotFoundError` | 404 | Resource tidak ditemukan |
| `ConflictError` | 409 | Data sudah ada (double submit, unique constraint) |
| `RateLimitError` | 429 | Terlalu banyak request |
| `InternalError` | 500 | Server error |

**Contoh:**

```typescript
import { NotFoundError, ValidationError } from "@packages/core"

// Error dengan resource name + id
throw new NotFoundError("Role", "550e8400-e29b-41d4-a716-446655440000")
// → "Role with id '550e8400...' not found"

// Error dengan field errors
throw new ValidationError("Validation failed", {
  title: ["Title is required"],
  email: ["Invalid email format"],
})
```

---

## Response Format

### Success Response

```typescript
import { successResponse } from "@packages/core"

successResponse({ id: "1", title: "Admin" })
// → { success: true, data: { id: "1", title: "Admin" } }
```

**Type definition:**

```typescript
interface SuccessResponse<T> {
  success: true
  data: T
}
```

### Paginated Response

```typescript
import { paginatedResponse } from "@packages/core"

const roles = [{ id: "1", title: "Admin" }]
const meta = paginatedResponse(roles, {
  page: 1,
  limit: 10,
  total: 55,
})
// → {
//   success: true,
//   data: [{ id: "1", title: "Admin" }],
//   meta: {
//     page: 1,
//     limit: 10,
//     total: 55,
//     totalPages: 6,
//     hasNext: true,
//     hasPrevious: false
//   }
// }
```

**Type definition:**

```typescript
interface PaginatedResponse<T> {
  success: true
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}
```

### Error Response

```typescript
import { errorResponse, ErrorCode } from "@packages/core"

errorResponse(ErrorCode.NOT_FOUND, "Role not found")
// → { success: false, error: { code: "NOT_FOUND", message: "Role not found" } }
```

**Type definition:**

```typescript
interface ErrorResponse {
  success: false
  error: {
    code: ErrorCode
    message: string
    details?: unknown
  }
}
```

**Union type untuk semua response:**

```typescript
type ApiResponse<T> = SuccessResponse<T> | ErrorResponse
type ApiPaginatedResponse<T> = PaginatedResponse<T> | ErrorResponse
```

---

## Pagination

### Offset-based

Untuk query sederhana (page/limit):

```typescript
import {
  parseOffsetPagination,
  calculatePaginationMeta,
  toPrismaArgs,
} from "@packages/core"

// 1. Parse params dari request
const pagination = parseOffsetPagination({ page: 2, limit: 20 })
// → { page: 2, limit: 20, offset: 20 }

// 2. Convert ke Prisma query args
const prismaArgs = toPrismaArgs(pagination)
// → { skip: 20, take: 20 }

// 3. Query database
const [roles, total] = await Promise.all([
  prisma.role.findMany({ ...prismaArgs }),
  prisma.role.count(),
])

// 4. Hitung metadata
const meta = calculatePaginationMeta({ page: 2, limit: 20, total })
// → { page: 2, limit: 20, total: 55, totalPages: 3, hasNext: true, hasPrevious: true }
```

**Default values:**
- `page`: 1
- `limit`: 10
- `max limit`: 100

### Cursor-based

Untuk infinite scroll / large datasets:

```typescript
import {
  parseCursorPagination,
  encodeCursor,
  decodeCursor,
} from "@packages/core"

// 1. Parse cursor dari request
const { cursor, limit } = parseCursorPagination({
  cursor: "eyJpZCI6IjEifQ==",
  limit: 20,
})
// → { cursor: '{"id":"1"}', limit: 20 }

// 2. Query database dengan cursor
const roles = await prisma.role.findMany({
  take: limit + 1, // ambil 1 ekstra untuk detect hasMore
  ...(cursor && {
    skip: 1,
    cursor: { id: decodeCursor(cursor).id as string },
  }),
})

// 3. Encode cursor untuk response
const nextCursor =
  roles.length > limit
    ? encodeCursor({ id: roles[roles.length - 1].id })
    : null
```

### Prisma Helpers

```typescript
import { parseOffsetPagination, toPrismaArgs } from "@packages/core"

const pagination = parseOffsetPagination({ page: 1, limit: 10 })
const args = toPrismaArgs(pagination)
// → { skip: 0, take: 10 }

// Langsung pakai di Prisma
const roles = await prisma.role.findMany(args)
```

---

## Cara Pakai

### Di apps/api (NestJS)

```typescript
// roles.controller.ts
import { Controller, Get, Post, Param, Body, Query } from "@nestjs/common"
import {
  successResponse,
  paginatedResponse,
  NotFoundError,
  parseOffsetPagination,
  calculatePaginationMeta,
  toPrismaArgs,
} from "@packages/core"

@Controller("roles")
export class RolesController {
  @Get()
  async findAll(@Query() query: unknown) {
    const pagination = parseOffsetPagination(query as Record<string, unknown>)

    const [roles, total] = await Promise.all([
      this.prisma.role.findMany(toPrismaArgs(pagination)),
      this.prisma.role.count(),
    ])

    const meta = calculatePaginationMeta({ ...pagination, total })
    return paginatedResponse(roles, meta)
    // → { success: true, data: [...], meta: { page: 1, ... } }
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const role = await this.prisma.role.findUnique({ where: { id } })

    if (!role) {
      throw new NotFoundError("Role", id)
      // → 404 { success: false, error: { code: "NOT_FOUND", ... } }
    }

    return successResponse(role)
    // → { success: true, data: { id: "...", title: "Admin" } }
  }
}
```

### Di apps/web (Next.js)

```typescript
// Contoh menggunakan response types
import type { ApiResponse, PaginatedResponse, Role } from "@packages/core"
import { createClient } from "@packages/client"

const api = createClient()

// Fetch roles — return type otomatis dari client
const roles = await api.resources.roles.list()

// Handle error response
import type { ErrorResponse } from "@packages/core"

const response = await fetch("/api/roles")
const data: ApiResponse<Role[]> = await response.json()

if (!data.success) {
  // data bertipe ErrorResponse
  console.error(data.error.code, data.error.message)
} else {
  // data bertipe SuccessResponse<Role[]>
  console.log(data.data)
}
```

---

## Troubleshooting

### Error: "Cannot find module '@packages/core'"

Pastikan sudah install dependencies:

```bash
pnpm install
```

Dan pastikan `@packages/core` ada di dependencies package yang memakai:

```json
{
  "dependencies": {
    "@packages/core": "workspace:*"
  }
}
```

### Error: "Type 'X' is not assignable to type 'Y'"

Pastikan menggunakan `type` import untuk types:

```typescript
import { successResponse } from "@packages/core"
import type { ApiResponse, Role } from "@packages/core"
```
