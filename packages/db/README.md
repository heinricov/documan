# @packages/db

Shared database package menggunakan **Prisma ORM 7** dengan **PostgreSQL**.

## Table of Contents

- [Setup](#setup)
- [Commands](#commands)
- [Schema Management](#schema-management)
  - [Membuat Table Baru](#membuat-table-baru)
  - [Menghapus Table](#menghapus-table)
  - [Mengganti Nama Table](#mengganti-nama-table)
  - [Menambah Kolom](#menambah-kolom)
  - [Menghapus Kolom](#menghapus-kolom)
  - [Mengganti Tipe Data](#mengganti-tipe-data)
- [Data Management](#data-management)
  - [Mengosongkan Table](#mengosongkan-table)
  - [Menghapus Semua Data](#menghapus-semua-data)
- [Relations](#relations)
  - [One-to-One](#one-to-one)
  - [One-to-Many](#one-to-many)
  - [Many-to-Many](#many-to-many)
- [Advanced](#advanced)
  - [Raw Queries](#raw-queries)
  - [Transactions](#transactions)
  - [Migrations](#migrations)

---

## Setup

### 1. Konfigurasi Database

Pastikan `DATABASE_URL` ada di file `.env` di root repo:

```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?schema=public"
```

### 2. Generate Prisma Client

```bash
pnpm --filter @packages/db db:generate
```

### 3. Push Schema ke Database

```bash
pnpm --filter @packages/db db:push
```

---

## Commands

| Command       | Deskripsi                                          |
| ------------- | -------------------------------------------------- |
| `db:generate` | Generate Prisma Client dari schema                 |
| `db:push`     | Push schema langsung ke database (tanpa migration) |
| `db:migrate`  | Buat dan jalankan migration baru                   |
| `db:studio`   | Buka Prisma Studio (GUI untuk lihat data)          |

### Contoh Penggunaan

```bash
# Generate client setelah ubah schema
pnpm --filter @packages/db db:generate

# Push schema ke database (untuk development)
pnpm --filter @packages/db db:push

# Buat migration baru (untuk production)
pnpm --filter @packages/db db:migrate

# Buka Prisma Studio
pnpm --filter @packages/db db:studio
```

---

## Schema Management

### Membuat Table Baru

Tambahkan model baru di `prisma/schema.prisma`:

```prisma
model User {
  id        String   @id @default(uuid()) @db.Uuid
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

Lalu jalankan:

```bash
pnpm --filter @packages/db db:generate
pnpm --filter @packages/db db:push
```

### Menghapus Table

Hapus model dari schema, lalu push:

```prisma
// Hapus model User dari schema
```

```bash
pnpm --filter @packages/db db:push
```

Atau gunakan raw query untuk hapus table:

```typescript
import { prisma } from "@packages/db"

await prisma.$executeRawUnsafe`DROP TABLE IF EXISTS users CASCADE`
```

### Mengganti Nama Table

Gunakan `@@map` untuk rename table tanpa mengubah nama model:

```prisma
model User {
  id    String @id @default(uuid()) @db.Uuid
  email String @unique

  @@map("customers")  // Table名: customers, model名: User
}
```

Atau gunakan raw query:

```typescript
await prisma.$executeRawUnsafe`ALTER TABLE users RENAME TO customers`
```

### Menambah Kolom

Tambahkan field baru di model:

```prisma
model User {
  id       String  @id @default(uuid()) @db.Uuid
  email    String  @unique
  phone    String?  // Kolom baru
  age      Int?     // Kolom baru

  @@map("users")
}
```

```bash
pnpm --filter @packages/db db:push
```

Atau raw query:

```typescript
await prisma.$executeRawUnsafe`ALTER TABLE users ADD COLUMN phone VARCHAR`
await prisma.$executeRawUnsafe`ALTER TABLE users ADD COLUMN age INTEGER`
```

### Menghapus Kolom

Hapus field dari model:

```prisma
model User {
  id    String @id @default(uuid()) @db.Uuid
  email String @unique
  // phone dan age sudah dihapus

  @@map("users")
}
```

```bash
pnpm --filter @packages/db db:push
```

Atau raw query:

```typescript
await prisma.$executeRawUnsafe`ALTER TABLE users DROP COLUMN phone`
await prisma.$executeRawUnsafe`ALTER TABLE users DROP COLUMN age`
```

### Mengganti Tipe Data

```prisma
model User {
  id    String @id @default(uuid()) @db.Uuid
  email String @unique
  age   BigInt @default(0)  // Dari Int ke BigInt

  @@map("users")
}
```

Atau raw query:

```typescript
await prisma.$executeRawUnsafe`ALTER TABLE users ALTER COLUMN age TYPE BIGINT USING age::BIGINT`
```

---

## Data Management

### Mengosongkan Table

Hapus semua data tapi tetap pertahankan struktur table:

```typescript
import { prisma } from "@packages/db"

// Cara 1: Using deleteMany
await prisma.role.deleteMany()

// Cara 2: Using raw query (lebih cepat untuk table besar)
await prisma.$executeRawUnsafe`TRUNCATE TABLE roles`
```

### Menghapus Semua Data

Hapus semua data dari semua table:

```typescript
import { prisma } from "@packages/db"

// Hapus semua data dari semua table
await prisma.$executeRawUnsafe`TRUNCATE TABLE roles, users, posts CASCADE`
```

Atau gunakan script untuk reset database:

```bash
# Hapus semua data dan jalankan migration ulang
pnpm --filter @packages/db db:push --force-reset
```

---

## Relations

### One-to-One

```prisma
model User {
  id      String @id @default(uuid()) @db.Uuid
  email   String @unique
  profile Profile?

  @@map("users")
}

model Profile {
  id     String @id @default(uuid()) @db.Uuid
  bio    String?
  userId String @unique @db.Uuid
  user   User   @relation(fields: [userId], references: [id])

  @@map("profiles")
}
```

### One-to-Many

```prisma
model User {
  id    String  @id @default(uuid()) @db.Uuid
  email String  @unique
  posts Post[]

  @@map("users")
}

model Post {
  id        String @id @default(uuid()) @db.Uuid
  title     String
  content   String?
  authorId  String @db.Uuid
  author    User   @relation(fields: [authorId], references: [id])

  @@map("posts")
}
```

**Query dengan relation:**

```typescript
// Fetch user dengan posts
const userWithPosts = await prisma.user.findUnique({
  where: { id: userId },
  include: { posts: true },
})

// Fetch post dengan author
const postWithAuthor = await prisma.post.findUnique({
  where: { id: postId },
  include: { author: true },
})
```

### Many-to-Many

```prisma
model Post {
  id         String       @id @default(uuid()) @db.Uuid
  title      String
  categories Category[]   @relation("PostCategories")

  @@map("posts")
}

model Category {
  id    String @id @default(uuid()) @db.Uuid
  name  String @unique
  posts Post[] @relation("PostCategories")

  @@map("categories")
}

// Junction table (implicit)
// Prisma akan membuat table _PostCategories otomatis
```

**Query dengan many-to-many:**

```typescript
// Create post dengan categories
const post = await prisma.post.create({
  data: {
    title: "Hello World",
    categories: {
      connect: [{ id: cat1Id }, { id: cat2Id }],
    },
  },
})

// Fetch post dengan categories
const postWithCategories = await prisma.post.findUnique({
  where: { id: postId },
  include: { categories: true },
})
```

### Self-Relation

```prisma
model Employee {
  id        String      @id @default(uuid()) @db.Uuid
  name      String
  managerId String?     @db.Uuid
  manager   Employee?   @relation("ManagerReports", fields: [managerId], references: [id])
  reports   Employee[]  @relation("ManagerReports")

  @@map("employees")
}
```

---

## Advanced

### Raw Queries

```typescript
import { prisma } from "@packages/db"

// Query dengan parameter
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${email}
`

// Execute (untuk INSERT, UPDATE, DELETE)
await prisma.$executeRaw`
  UPDATE users SET name = ${name} WHERE id = ${id}
`
```

### Transactions

```typescript
import { prisma } from "@packages/db"

// Basic transaction
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { email: "test@example.com" },
  })

  const profile = await tx.profile.create({
    data: { userId: user.id, bio: "Hello!" },
  })

  return { user, profile }
})

// Interactive transaction
const result = await prisma.$transaction(async (tx) => {
  // Bisa logika JavaScript di sini
  const user = await tx.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error("User not found")

  return tx.user.update({
    where: { id: userId },
    data: { name: "Updated" },
  })
})
```

### Migrations

Untuk production, gunakan migrations:

```bash
# Buat migration baru
pnpm --filter @packages/db db:migrate

# Jalankan pending migrations
pnpm --filter @packages/db db:migrate deploy

# Lihat status migrations
pnpm --filter @packages/db db:migrate status
```

---

## Best Practices

1. **Gunakan `@@map`** untuk nama table yang konsisten
2. **Selalu pakai UUID** untuk primary key
3. **Gunakan `@default(now())`** untuk timestamps
4. ** pakai `@updatedAt`** untuk auto-update timestamps
5. **Gunakan relations** untuk data integrity
6. **Test migrations** di development sebelum production

---

## Troubleshooting

### Error: Database URL not found

Pastikan `DATABASE_URL` ada di `.env` dan `loadEnv()` dipanggil sebelum PrismaClient diinisialisasi.

### Error: Relation not found

Pastikan schema sudah di-generate dan di-push ke database:

```bash
pnpm --filter @packages/db db:generate
pnpm --filter @packages/db db:push
```

### Error: Table already exists

Gunakan `--force-reset` untuk reset database:

```bash
pnpm --filter @packages/db db:push --force-reset
```
