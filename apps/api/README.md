# @apps/api — Documan API

REST API dari monorepo **documan**, dibangun dengan **NestJS 12** (+ Express), zod validation (SSOT di `@packages/validator`), Prisma (`@packages/db`), logging pino (`@packages/logger`), dan Swagger (`@packages/documentation`).

Semua logika bisnis dipecah per **feature module** di `src/modules/`. Referensi endpoint teladan: **roles**.

---

## Struktur

```
apps/api/
├── src/
│   ├── main.ts                 # bootstrap: env, logger, CORS, helmet, pipeline, swagger, shutdown
│   ├── app.module.ts           # kumpulan semua feature modules + APP_GUARD global
│   ├── common/                 # infrastruktur GLOBAL (tidak khusus satu feature)
│   │   ├── guards/             #   rate-limit (mirip dengan JWT/roles nanti)
│   │   ├── interceptors/       #   transform (bentuk respons standar)
│   │   ├── filters/            #   http-exception (format error standar)
│   │   ├── pipes/              #   zod-validation
│   │   ├── logger/             #   adaptor Nest → pino
│   │   └── zod.decorators.ts   # ♥ @ZodBody/@ZodQuery/@ZodParams
│   ├── health/                 # liveness & readiness probes
│   └── modules/
│       └── roles/              # ♥ feature template (CRUD lengkap)
│           ├── role.module.ts
│           ├── role.controller.ts
│           ├── role.service.ts
│           └── role.swagger.ts
├── test/                       # e2e (vitest + supertest)
├── nest-cli.json
└── package.json
```

**Aturan penting:** schema & tipe bersama (request/response) TIDAK ditulis di `apps/api` — ditulis sekali di `@packages/validator`, supaya API client (`@packages/client`) tetap sinkron.

---

## Persiapan

```bash
pnpm install
# seed database (membuat role admin/editor/viewer)
pnpm --filter @packages/db db:seed
```

Dibutuhkan `.env` di root repo (lihat `.env.example`):

| Variable          | Wajib | Keterangan                                        | Default         |
| ----------------- | ----- | ------------------------------------------------- | --------------- |
| `DATABASE_URL`    | ✅    | PostgreSQL connection string                      | —               |
| `API_PORT`        | ❌    | Port HTTP                                         | `3001`          |
| `CORS_ORIGIN`     | ❌    | Origin yang diizinkan (`*` di produksi = warning) | —               |
| `RATE_LIMIT_TTL_MS` | ❌  | Jendela rate limit (ms)                           | `60000`         |
| `RATE_LIMIT_MAX`  | ❌    | Maksimum request per jendela per IP               | `100`           |
| `JWT_SECRET`      | ⚠️    | Ada nanti bersama module auth — wajib ≥ 32 char   | —               |

Validasi dilakukan `validateEnv` di bootstrap; fatal (mis. `DATABASE_URL` kosong) → langsung berhenti, warning → log.

---

## Menjalankan

```bash
# development (watch)
pnpm --filter api dev

# produksi (transpiler-on-the-fly, lihat catatan)
pnpm --filter api start:prod

# build & validasi type (tsc)
pnpm --filter api build
pnpm --filter api typecheck
pnpm --filter api lint
```

### Endpoint yang selalu ada

| Route          | Keterangan                          |
| -------------- | ----------------------------------- |
| `GET /health`  | Liveness probe                      |
| `GET /health/ready` | Readiness probe (cek DB `SELECT 1`) |
| `GET /docs`    | Swagger UI (hanya NODE_ENV=development) |

---

## Format Respons

Semua respons melewati pipeline global (interceptor + filter), bentuk **standar `@packages/core`**:

```jsonc
// sukses
{ "success": true, "data": { "id": "...", "title": "admin", "createdAt": "2026-09-16T03:27:52.024Z", "updatedAt": "2026-09-16T03:27:52.048Z" }, "meta": { "page": 1, "limit": 10, "total": 3, "totalPages": 1, "hasNext": false, "hasPrevious": false } }

// error
{ "success": false, "error": { "code": "NOT_FOUND", "message": "Role not found", "details": { "fieldErrors": { "title": ["..."] } } } }
```

Error yang dipakai aplikasi (di `@packages/core`): `ValidationError` (400), `UnauthorizedError` (401), `ForbiddenError` (403), `NotFoundError` (404, otomatis menambah `" not found"` dari nama resource), `ConflictError` (409), `RateLimitError` (429, + header `Retry-After`), `AppError` (lainnya → 500).

---

## Membuat Endpoint Baru (mis. `users`)

### 1. Definisikan schema di `@packages/validator` (SSOT)

`packages/validator/src/schemas/user.ts` → ekspor dari `index.ts`:

```ts
export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
})
export const UserQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1), // query HTTP = string!
  limit: z.coerce.number().int().positive().max(100).default(10),
})
export type CreateUser = z.output<typeof CreateUserSchema>
// + UpdateUserSchema. Untuk param :id pakai shared IdParamsSchema dari validator
//   (bukan definisikan ulang: @ZodParams({ zod: IdParamsSchema })).
```

### 2. Buat folder feature `src/modules/users/`

**`user.module.ts`**

```ts
@Module({
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule {}
```

**`user.service.ts`** — pakai `@packages/db` + error dari `@packages/core`, dan helper pagination core:

```ts
@Injectable()
export class UserService {
  async findAll(query: UserQuery): Promise<PaginatedResponse<User>> {
    const { page, limit, offset } = parseOffsetPagination(query)
    const { skip, take } = toPrismaArgs({ page, limit, offset })
    const [items, total] = await Promise.all([
      prisma.user.findMany({ skip, take }),
      prisma.user.count(),
    ])
    return paginatedResponse(serializeList(items), { page, limit, total })
  }
  async create(data: CreateUser): Promise<User> {
    return serialize(await prisma.user.create({ data })) // duplikat → ConflictError
  }
}
// serialize(): map Record DB (Date) → DTO (ISO string) agar match schema validator.
```

**`user.controller.ts`** — dekorator validasi **WAJIB** bentuk `{ zod: Schema }`; param `:id` pakai `IdParamsSchema`:

```ts
@Controller("users")
@ApiTags("users")
export class UserController {
  constructor(@Inject(UserService) private readonly userService: UserService) {}

  @Get()
  findAll(@ZodQuery({ zod: UserQuerySchema }) query: UserQuery) {
    return this.userService.findAll(query)
  }

  @Post()
  create(@ZodBody({ zod: CreateUserSchema }) body: CreateUser) {
    return this.userService.create(body)
  }

  @Get(":id")
  findOne(@ZodParams({ zod: IdParamsSchema }) params: IdParams) {
    return this.userService.findById(params.id)
  }
  // PATCH/DELETE mengikuti pola yang sama
}
```

### 3. Daftarkan module

`src/app.module.ts` → `imports: [HealthModule, RolesModule, UsersModule]`.

> Swagger otomatis: tambahkan `@ApiOperation`, `@ApiOkResponse` (+ schema via `zodToOpenApi`), dan `@ApiResponse` untuk error. Respons paginasi memakai helper generik `paginatedOpenApiResponse(zodToOpenApi(ItemSchema))` dari `@packages/documentation` — lihat `role.swagger.ts`.

Verifikasi: `pnpm --filter api typecheck && pnpm --filter api lint`, lalu jalankan + curl.

---

## ⚠️ Catatan Penting (NestJS 12)

1. **`@ZodBody(schema)` langsung TIDAK akan bekerja.**
   - ZodObject punya method `.transform()` → dianggap pipe; `{ schema }` terdeteksi sebagai `ParameterDecoratorOptions`. Keduanya membuat `data` menjadi `undefined`.
   - Wajib: `@ZodBody({ zod: Schema })` (key netral `zod`).
2. **DI memakai `@Inject(...)` eksplisit.** Runtime produksi (`tsx`/esbuild) tidak meng-emit `design:paramtypes`, jadi `constructor(private svc: X)` menghasilkan `undefined`. Pola: `constructor(@Inject(X) private readonly x: X)`.
   - Service sendiri cukup `@Injectable()` (tidak perlu `@Inject`).
3. **`z.coerce.number()` untuk query**: nilai HTTP selalu string; tanpa `coerce`, `page=1` akan gagal validasi.
4. **`nest start` tidak kompatibel.** Nest CLI 12: `builder: "esbuild"` tidak didukung, `webpack` tidak mendukung ESM, `rspack` gagal membundle Prisma/pg. Karena workspace packages mengekspor source `.ts`, semua script run (`dev`, `start`, `start:prod`) memakai `tsx {watch} src/main.ts`. Rencana ke depan: build `@packages/*` ke `dist` + `node dist/main`.

---

## Testing

```bash
pnpm --filter api test        # unit (vitest)
pnpm --filter api test:e2e    # e2e (vitest + supertest)
```

Bantuan test tersedia di `@packages/testing` (factories, `cleanDatabase`, `createTestToken`).