# @packages/auth

Authentication & authorization utilities untuk api & web. JWT signing/verification (jose), password hashing Argon2id (@node-rs/argon2), dan guards berbasis role.

## Table of Contents

- [Setup](#setup)
- [Quick Start](#quick-start)
- [JWT](#jwt)
  - [Sign Token](#sign-token)
  - [Verify Token](#verify-token)
  - [Environment Variables](#environment-variables)
  - [Error Handling](#error-handling)
- [Password](#password)
- [Guards](#guards)
- [Integrasi dengan NestJS](#integrasi-dengan-nestjs)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

---

## Setup

Package sudah terinstall di workspace monorepo.

```bash
pnpm install
```

Dependencies:
- `jose` — JWT (HS256, zero-dependency)
- `@node-rs/argon2` — Argon2id hashing (prebuilt binary, tanpa compile native)

---

## Quick Start

```typescript
import { signToken, verifyToken, hashPassword, verifyPassword } from "@packages/auth"

// 1. Hash password (register)
const hash = await hashPassword("my-secret")
// "$argon2id$v=19$m=19456,t=2,p=1$..."

// 2. Verifikasi password (login)
const result = await verifyPassword(hash, "my-secret")
if (result.ok) {
  console.log("Login sukses")
}

// 3. Buat JWT (setelah login)
const token = await signToken({ userId: "abc-123", role: "admin" })
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

// 4. Verify JWT (di protected route)
const payload = await verifyToken(token)
// payload.sub = "abc-123", payload.role = "admin"
```

---

## JWT

### Sign Token

```typescript
import { signToken } from "@packages/auth"

// Default: expires 15m, issuer "documan"
const token = await signToken({ userId: "abc-123", role: "admin" })

// Custom expiry
const token = await signToken({ userId: "abc-123" }, { expiresIn: "1d" })

// Custom secret (override env)
const token = await signToken({ userId: "abc-123" }, { secret: "s3cret" })
```

`userId` disimpan sebagai **subject (sub)**, `role` sebagai claim terpisah.

### Verify Token

```typescript
import { verifyToken, getUserId } from "@packages/auth"

const payload = await verifyToken(token)
// payload.sub → userId
// payload.role → "admin"
// payload.iat, payload.exp, payload.iss → metadata

// Ambil userId langsung
const userId = await getUserId(token)
// "abc-123"
```

### Environment Variables

| Variable | Default | Deskripsi |
|----------|---------|-----------|
| `JWT_SECRET` | - | **Wajib** di production. Random string ≥ 32 char |
| `JWT_EXPIRES_IN` | `15m` | Expiry token (15m, 1h, 7d, dll) |
| `JWT_ISSUER` | `documan` | Issuer — di-set saat sign & diverifikasi saat verify |

Tanpa `JWT_SECRET`, `signToken`/`verifyToken` melempar `AuthError(code: "JWT_SECRET_NOT_SET")`.

### Error Handling

`verifyToken` melempar `AuthError`:

| Code | Kapan |
|------|-------|
| `JWT_SECRET_NOT_SET` | `JWT_SECRET` tidak di-set |
| `TOKEN_EXPIRED` | Token sudah kedaluwarsa |
| `INVALID_TOKEN` | Token malformed / signature salah |

```typescript
import { AuthError } from "@packages/auth"

try {
  await verifyToken(token)
} catch (error) {
  if (error instanceof AuthError) {
    if (error.code === "TOKEN_EXPIRED") {
      // → 401: silakan login ulang
    }
  }
}
```

---

## Password

Menggunakan **Argon2id** (rekomendasi untuk anti GPU-cracking & side-channel).

```typescript
import { hashPassword, verifyPassword } from "@packages/auth"

// Hash
const hash = await hashPassword("secret")
const custom = await hashPassword("secret", { memoryCost: 65536, timeCost: 3 })

// Verify — tidak pernah melempar error
const result = await verifyPassword(hash, "secret")

if (result.ok) {
  // result.password → password asli
} else if (result.reason === "not-matched") {
  // password salah
} else {
  // hash tidak valid (bukan format argon2)
}
```

Opsi default (cocok untuk sebagian besar kasus):

| Option | Default | Deskripsi |
|--------|---------|-----------|
| `memoryCost` | `19456` | ~19 MiB memori |
| `timeCost` | `2` | 2 iterasi |
| `parallelism` | `1` | 1 thread |

Juga tersedia `hashPasswordSync()` untuk test/setup script.

---

## Guards

Guard mengembalikan **result object** (bukan melempar exception) sehingga mudah digunakan di middleware, guard NestJS, maupun server action Next.js.

### `requireAuth` — verifikasi token

```typescript
import { requireAuth } from "@packages/auth"

const result = await requireAuth(token)

if (!result.ok) {
  // result.reason: "unauthorized" | "forbidden" | "invalid"
  return { status: 401, body: { message: result.message } }
}

const { userId, role } = result.context
```

### `requireRole` — cek role

```typescript
import { requireAuth, requireRole } from "@packages/auth"

const auth = await requireAuth(token)
if (!auth.ok) return 401

const check = requireRole(auth.context, { roles: ["admin", "editor"] })
if (!check.ok) return 403 // "Requires one of roles: admin, editor."

// Lanjut ke handler
```

Role dicek **exact match**. Untuk case-insensitive, set `caseInsensitive: true`.

### `requireAuthAndRole` — gabungan

```typescript
import { requireAuthAndRole } from "@packages/auth"

const result = await requireAuthAndRole(token, { roles: ["admin"] })
if (!result.ok) {
  return result.reason === "forbidden" ? 403 : 401
}
```

### `getBearerToken` — ekstraksi Bearer token

```typescript
import { getBearerToken } from "@packages/auth"

const token = getBearerToken(req.headers.authorization)
// "Bearer eyJhbGci..." → "eyJhbGci..."
// undefined / "Basic dXNlcg==" → null
```

---

## Integrasi dengan NestJS

### Auth Guard

```typescript
// auth.guard.ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from "@nestjs/common"
import { getBearerToken, requireAuth, requireRole, type AuthContext } from "@packages/auth"

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly roles: string[]) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const token = getBearerToken(request.headers.authorization)

    const auth = await requireAuth(token)
    if (!auth.ok) throw new UnauthorizedException(auth.message)

    const roleCheck = requireRole(auth.context, { roles: this.roles })
    if (!roleCheck.ok) throw new ForbiddenException(roleCheck.message)

    request.user = auth.context
    return true
  }
}

// Penggunaan di controller
@Controller("roles")
export class RolesController {
  @Get()
  @UseGuards(new RolesGuard(["admin"]))
  findAll() { ... }
}
```

---

## API Reference

### JWT

| Function | Parameter | Return |
|----------|-----------|--------|
| `signToken(payload, options?)` | `AuthTokenPayload`, `JwtOptions` | `Promise<string>` |
| `verifyToken<T>(token, options?)` | string, `VerifyOptions` | `Promise<VerifyResult<T>>` |
| `getUserId(token, options?)` | string | `Promise<string>` |
| `getJwtSecret()` | - | `string` (dari env) |
| `AuthError` | code: JWT_SECRET_NOT_SET / INVALID_TOKEN / TOKEN_EXPIRED | Error class |

**`JwtOptions`** → `{ secret?, expiresIn?, issuer? }`
**`VerifyOptions`** → `{ secret?, issuer? }`

### Password

| Function | Parameter | Return |
|----------|-----------|--------|
| `hashPassword(password, options?)` | string, `PasswordOptions` | `Promise<string>` |
| `hashPasswordSync(password, options?)` | string, `PasswordOptions` | `string` |
| `verifyPassword(hash, password, options?)` | string, string | `Promise<VerifyPasswordResult>` |

**`VerifyPasswordResult`** → `{ ok: true, password }` \| `{ ok: false, password: false, reason: "not-matched" \| "invalid-hash" }`

### Guards

| Function | Parameter | Return |
|----------|-----------|--------|
| `requireAuth<T>(token)` | `string \| undefined \| null` | `Promise<AuthGuardResult>` |
| `requireRole(context, options)` | `AuthContext`, `RequireRoleOptions` | `{ ok: true } \| { ok: false, reason: "forbidden", message }` |
| `requireAuthAndRole(token, options)` | token, `RequireRoleOptions` | `Promise<AuthGuardResult>` |
| `getBearerToken(header)` | `string \| undefined \| null` | `string \| null` |

**`AuthContext`** → `{ userId, role?, payload?, token }`

---

## Troubleshooting

### `JWT_SECRET_NOT_SET` error

Set `JWT_SECRET` di `.env` root, atau pass `secret` di options:

```typescript
await signToken({ userId: "abc" }, { secret: "my-secret" })
await verifyToken(token, { secret: "my-secret" })
```

### Token tiba-tiba expired

Cek `JWT_EXPIRES_IN`. Acces token ke-reset saat user login ulang.

### Verify gagal tapi token terlihat valid

Pastikan issuer cocok. Jika `JWT_ISSUER` diubah setelah token dibuat, token lama ditolak:

```typescript
await verifyToken(token, { issuer: "issuer-lama" })
```

### `verifyPassword` selalu `invalid-hash`

Hash yang disimpan bukan format Argon2 (mis. dari md5/bcrypt lama). Tidak bisa diverifikasi — user harus reset password.