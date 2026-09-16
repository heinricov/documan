# @packages/logger

Structured logging (pino) untuk semua layer (api, web, packages). Otomatis membawa request context (requestId, userId, method, path) via AsyncLocalStorage.

## Table of Contents

- [Setup](#setup)
- [Quick Start](#quick-start)
- [Request Context](#request-context)
  - [Dengan AsyncLocalStorage](#dengan-asynclocalstorage)
  - [Konfigurasi Context](#konfigurasi-context)
- [Serializers](#serializers)
- [Integrated dengan NestJS](#integrated-dengan-nestjs)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

---

## Setup

Package sudah terinstall di workspace monorepo.

```bash
pnpm install
```

Dependencies:
- `pino` — logger engine
- `pino-pretty` (dev) — pretty output untuk development

---

## Quick Start

```typescript
import { logger, createLogger } from "@packages/logger"

// 1. Default instance (service: "documan")
logger.info("Server started")
logger.debug({ userId }, "User lookup")

// 2. Custom instance
const log = createLogger({ service: "api", level: "debug" })
log.info("NestJS API loaded")
```

**Output (development — pretty):**
```
[14:32:05.123] INFO: Server started
[14:32:06.098] DEBUG: User lookup
```

**Output (production — JSON):**
```json
{"level":30,"time":1736833925123,"msg":"Server started","service":"documan"}
```

---

## Request Context

Setiap log otomatis membawa context dari request yang sedang berjalan. Aman untuk concurrent requests karena menggunakan `AsyncLocalStorage`.

### Dengan AsyncLocalStorage

```typescript
import { withLogContext } from "@packages/logger"

// Wrap seluruh handler request/middleware
await withLogContext(
  { requestId: "abc-123", userId: "user-1", method: "GET", path: "/roles" },
  async () => {
    logger.info("Fetching roles")
    // → { requestId: "abc-123", userId: "user-1", method: "GET", path: "/roles" }
  }
)
```

**Output:**
```json
{"level":30,"msg":"Fetching roles","requestId":"abc-123","userId":"user-1","method":"GET","path":"/roles"}
```

### Konfigurasi Context

```typescript
import { withLogContext, setLogContext, getLogContext } from "@packages/logger"

await withLogContext({ requestId: "abc" }, async () => {
  // Get context aktif
  const ctx = getLogContext() // → { requestId: "abc" }

  // Tambahkan/update field
  setLogContext({ userId: "user-1" })
  // Context sekarang: { requestId: "abc", userId: "user-1" }

  logger.info("Authenticated")
  // → { requestId: "abc", userId: "user-1" }
})
```

### Bangun Context dari HTTP Request

```typescript
import { withLogContext, buildHttpContext } from "@packages/logger"

// Di middleware/guard
const context = buildHttpContext(req)
// → { requestId: (header x-request-id) ?? uuid, method: "GET", path: "/roles" }

await withLogContext(context, async () => {
  // ... handle request
})
```

**`buildHttpContext` membaca:**
- `x-request-id` header → `requestId` (fallback: UUID baru)
- `req.method` → `method`
- `req.url` → `path`

---

## Serializers

### `serializeError`

```typescript
import { serializeError } from "@packages/logger"

logger.error(
  { err: serializeError(error) },
  "Request failed"
)

// → { err: { type: "NotFoundError", message: "Role not found", code: "NOT_FOUND", status: 404 } }
```

Object hasil serialize:
| Field | Keterangan |
|-------|------------|
| `type` | Nama error (NotFoundError, TypeError, dll) |
| `message` | Pesan error |
| `code` | Error code (jika ada) |
| `status` | HTTP status (jika ada) |
| `details` | Additional details (jika ada) |
| `stack` | Stack trace (production: dihapus) |

### `serializeResponse`

```typescript
import { serializeResponse } from "@packages/logger"

logger.info(serializeResponse(200, 45), "Request handled")
// → { statusCode: 200, durationMs: 45 }
```

### `createTimer`

```typescript
import { createTimer, serializeResponse } from "@packages/logger"

const stop = createTimer()
// ... proses request
logger.info(serializeResponse(200, stop()), "Request complete")
```

---

## Integrasi dengan NestJS

### Global Middleware

```typescript
// main.ts
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module.js"
import { withLogContext, buildHttpContext, logger } from "@packages/logger"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Logger middleware — wrap semua request
  app.use((req, res, next) => {
    const context = buildHttpContext(req)
    withLogContext(context, () => next())
  })

  app.useLogger(logger as never) // option 1: ganti logger NestJS

  await app.listen(3001)
  logger.info("API listening on :3001")
}
```

### Custom Interceptor (durasi request)

```typescript
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common"
import { serializeError, serializeResponse, createTimer } from "@packages/logger"
import { Observable, tap } from "rxjs"

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const stop = createTimer()
    return next.handle().pipe(
      tap({
        next: (data) => {
          const status = context.switchToHttp().getResponse().statusCode
          logger.info(serializeResponse(status, stop()), "Request handled")
        },
        error: (err) => {
          logger.error({ err: serializeError(err) }, "Request failed")
        },
      })
    )
  }
}
```

---

## API Reference

### `createLogger(options)`

| Option | Type | Default | Deskripsi |
|--------|------|---------|-----------|
| `service` | `string` | - | Nama service ditambahkan ke semua log |
| `level` | `string` | `env.LOG_LEVEL ?? "info"` | Level minimum (trace/debug/info/warn/error/fatal) |
| `pretty` | `boolean` | `NODE_ENV !== "production"` | Pretty output untuk development |
| `baseContext` | `Record<string, unknown>` | `{}` | Context yang selalu disertakan |
| `redact` | `string[]` | Default list sensitif | Properti yang disensor sebelum dicetak |

**Redaction bawaan** (disensor otomatis):

| Path | Contoh disensor |
|------|----------------|
| `*.password` | `create.data.password` |
| `*.secret`, `*.token` | `confirm.payload.token` |
| `authorization`, `x-api-key` | header auth |
| `cookie`, `set-cookie` | cookie response |
| `apiKey`, `JWT_SECRET`, `DATABASE_URL` | konfigurasi |

### `logger`

Default instance (service: "documan").

### Serializers

| Function | Parameter | Return |
|----------|-----------|--------|
| `serializeError(error, { stack? })` | Error | Object readable |
| `serializeResponse(statusCode, durationMs)` | number, number | `{ statusCode, durationMs }` |
| `createTimer()` | - | `() => number` (stop function) |

### Context Helpers

| Function | Return |
|----------|--------|
| `withLogContext(context, fn)` | Result dari fn |
| `getLogContext()` | Context aktif |
| `setLogContext(partial)` | void |
| `buildHttpContext(req)` | Request context |
| `generateRequestId()` | UUID string |

---

## Troubleshooting

### Log tidak keluar sama sekali

Periksa level:
```typescript
logger.level // default "info" atau dari LOG_LEVEL
```

Jika `LOG_LEVEL` diset `error`, log `info` tidak akan muncul.

### Pretty output di production

Pretty hanya aktif di development. Force pretty:
```typescript
createLogger({ pretty: true })
```

### pino-pretty tidak ditemukan

`pino-pretty` adalah devDependency. Pastikan sudah install:

```bash
pnpm install
```

Untuk production tanpa devDependencies, gunakan `createLogger({ pretty: false })` (JSON output).