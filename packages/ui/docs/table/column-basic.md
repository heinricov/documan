# ColumnBasic

Pembuat kolom **non-sortable** untuk `DataTable`. Sekali panggil, kolom yang dihasilkan sudah lengkap: header sederhana, cell dengan style otomatis, dan `filterFn` untuk pencarian.

Lokasi: `@packages/ui/table/column-basic`

Mengembalikan `DataTableColumn<TData>`, jadi tinggal dimasukkan ke array `columns` milik `DataTable`.

---

## Import

```tsx
import { ColumnBasic } from "@packages/ui/table/column-basic"
```

---

## Props

`ColumnBasic` menerima `ColumnBasicOptions<TData>` (sama dengan `ColumnBaseOptions`):

| Prop           | Tipe                                        | Default                     | Keterangan                                                                  |
| -------------- | ------------------------------------------- | --------------------------- | --------------------------------------------------------------------------- |
| `accessorKey`  | `keyof TData & string \| (string & {})`     | **wajib**                   | Field sumber nilai utama kolom                                              |
| `label`        | `string`                                    | **wajib**                   | Teks header kolom                                                           |
| `id`           | `string`                                    | `accessorKey`               | Id kolom (untuk `columnLabels`/`searchColumnId`/visibility)                 |
| `align`        | `"start" \| "end"`                          | `"start"`                   | `"end"` meratakan header & cell ke kanan                                    |
| `format`       | `"text" \| "number" \| "date"`              | `"text"`                    | Menentukan style cell otomatis                                              |
| `subtitleKey`  | `keyof TData & string`                      | -                           | Field kedua yang tampil sebagai baris kecil muted di bawah nilai utama      |
| `searchKeys`   | `(keyof TData & string)[]`                  | `[accessorKey, subtitleKey]`| Field yang dicocokkan oleh search                                           |
| `enableHiding` | `boolean`                                   | `true`                      | Apakah kolom bisa disembunyikan dari menu View                              |
| `cell`         | `(props: CellContext<DataTableFeatures, TData>) => ReactNode` | -          | Override render cell (menggantikan style otomatis)                          |

---

## Style Cell Otomatis

Cell dirender otomatis sesuai `format` (tanpa perlu menulis `className`):

| `format`   | Tampilan                                                                 |
| ---------- | ------------------------------------------------------------------------ |
| `"text"`   | `truncate text-sm text-foreground`                                       |
| `"number"` | `text-sm text-muted-foreground tabular-nums`                             |
| `"date"`   | `formatDate(value)` → `text-xs text-muted-foreground tabular-nums`       |

Bila `subtitleKey` diisi (berlaku untuk `format: "text"`), cell menjadi dua baris:

- Baris utama: `truncate text-sm leading-tight font-medium text-foreground`
- Baris kedua: `truncate text-xs text-muted-foreground`

Jika `align: "end"`, nilai `number`/`date`/`text` diberi `block text-right`.

Header non-sortable dirender sebagai:

```
text-xs font-medium tracking-wide text-muted-foreground uppercase
```

dan dibungkus `flex w-full justify-end` saat `align: "end"`.

---

## Fitur

- **Cell auto-style**: cukup pilih `format`, tidak perlu tulis `className` atau `formatDate` manual.
- **Dua data satu kolom**: pakai `subtitleKey` (bukan array/manual JSX).
- **Filter pencarian otomatis**: `filterFn` mencocokkan `accessorKey` (+ `subtitleKey`) secara case-insensitive.
- **Non-sortable**: `enableSorting` dipaksa `false`.
- **Override cell**: tetap bisa kirim `cell` untuk kasus khusus.

---

## Contoh Penggunaan

### 1. Teks dasar

```tsx
const columns: DataTableColumn<User>[] = [
  ColumnBasic<User>({ accessorKey: "email", label: "Email" }),
]
```

### 2. Angka

```tsx
ColumnBasic<Role>({
  accessorKey: "members",
  label: "Members",
  format: "number",
})
```

### 3. Tanggal

```tsx
ColumnBasic<Role>({
  accessorKey: "createdAt",
  label: "Created",
  format: "date",
  align: "end",
})
```

### 4. Dua data dalam satu kolom (`subtitleKey`)

```tsx
ColumnBasic<Product>({
  accessorKey: "name",
  label: "Product",
  subtitleKey: "sku", // baris kedua otomatis, muted
})
```

Pencarian otomatis mencocokkan `name` **dan** `sku`.

### 5. Rata kanan

```tsx
ColumnBasic<Invoice>({
  accessorKey: "total",
  label: "Total",
  format: "number",
  align: "end",
})
```

### 6. `searchKeys` kustom

```tsx
ColumnBasic<User>({
  accessorKey: "name",
  label: "Name",
  subtitleKey: "email",
  searchKeys: ["name", "email", "phone"], // kolom tambahan ikut dicari
})
```

### 7. Override cell

```tsx
import { Badge } from "@packages/ui/components/badge"

ColumnBasic<Role>({
  accessorKey: "name",
  label: "Role",
  cell: ({ row }) => <Badge>{row.original.name}</Badge>,
})
```

### 8. Dipakai bersama `DataTable`

```tsx
<DataTable<Role>
  data={data}
  columns={[
    ColumnBasic<Role>({ accessorKey: "members", label: "Members", format: "number" }),
  ]}
  getRowId={(role) => role.id}
  title="Roles"
  searchColumnId="members"
/>
```

---

## Catatan

- Kolom ini **tidak bisa di-sort**; gunakan [`ColumnSortDataTable`](./column-sortable.md) bila butuh sorting.
- `filterFn` hanya aktif kalau kolom ini ditunjuk oleh `searchColumnId` pada `DataTable`.
- Jangan menambahkan `id` yang sama dengan kolom bawaan `select`/`actions`.
- Nilai utama diambil dari `row.original[accessorKey]`; `format` hanya memengaruhi tampilan, bukan tipe data.
