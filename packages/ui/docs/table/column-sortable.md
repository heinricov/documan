# ColumnSortDataTable

Pembuat kolom **sortable** untuk `DataTable`. Sekali panggil, kolom yang dihasilkan sudah lengkap: header dengan tombol sorting (dilengkapi ikon), cell dengan style otomatis, dan `filterFn` untuk pencarian.

Lokasi: `@packages/ui/table/column-sortable`

Mengembalikan `DataTableColumn<TData>`, jadi tinggal dimasukkan ke array `columns` milik `DataTable`.

---

## Import

```tsx
import {
  ColumnSortDataTable,
  SortIcon,
} from "@packages/ui/table/column-sortable"
```

---

## Props

`ColumnSortDataTable` menerima `ColumnSortDataTableOptions<TData>` (`ColumnBaseOptions` + `sortFn`):

| Prop           | Tipe                                        | Default                     | Keterangan                                                                  |
| -------------- | ------------------------------------------- | --------------------------- | --------------------------------------------------------------------------- |
| `accessorKey`  | `keyof TData & string \| (string & {})`     | **wajib**                   | Field sumber nilai utama kolom (juga dipakai untuk sorting)                 |
| `label`        | `string`                                    | **wajib**                   | Teks header kolom                                                           |
| `id`           | `string`                                    | `accessorKey`               | Id kolom (untuk `columnLabels`/`searchColumnId`/visibility)                 |
| `align`        | `"start" \| "end"`                          | `"start"`                   | `"end"` meratakan header & cell ke kanan                                    |
| `format`       | `"text" \| "number" \| "date"`              | `"text"`                    | Menentukan style cell otomatis                                              |
| `subtitleKey`  | `keyof TData & string`                      | -                           | Field kedua yang tampil sebagai baris kecil muted di bawah nilai utama      |
| `searchKeys`   | `(keyof TData & string)[]`                  | `[accessorKey, subtitleKey]`| Field yang dicocokkan oleh search                                           |
| `sortFn`       | `"datetime"`                                | -                           | Fungsi sorting khusus untuk tanggal (string ISO)                            |
| `enableHiding` | `boolean`                                   | `true`                      | Apakah kolom bisa disembunyikan dari menu View                              |
| `cell`         | `(props: CellContext<DataTableFeatures, TData>) => ReactNode` | -          | Override render cell (menggantikan style otomatis)                          |

---

## Style Cell Otomatis

Sama seperti [`ColumnBasic`](./column-basic.md), cell dirender otomatis sesuai `format` (tanpa `className`):

| `format`   | Tampilan                                                                 |
| ---------- | ------------------------------------------------------------------------ |
| `"text"`   | `truncate text-sm text-foreground`                                       |
| `"number"` | `text-sm text-muted-foreground tabular-nums`                             |
| `"date"`   | `formatDate(value)` → `text-xs text-muted-foreground tabular-nums`       |

Bila `subtitleKey` diisi (berlaku untuk `format: "text"`), cell menjadi dua baris:

- Baris utama: `truncate text-sm leading-tight font-medium text-foreground`
- Baris kedua: `truncate text-xs text-muted-foreground`

Jika `align: "end"`, nilai `number`/`date`/`text` diberi `block text-right`.

---

## Header Sortable

Header dirender sebagai tombol (bukan teks statis) yang memanggil `column.toggleSorting`, dilengkapi indikator arah:

- Unsortable: ikon `ChevronsUpDown` (muted)
- `asc`: ikon `ArrowUp`
- `desc`: ikon `ArrowDown`

Tombol memakai `text-xs font-medium tracking-wide text-muted-foreground uppercase`, dan dibungkus `flex w-full justify-end` saat `align: "end"`.

`SortIcon` diekspor bila ingin dipakai ulang:

```tsx
<SortIcon sorted="asc" />
```

---

## Fitur

- **Sorting**: klik header untuk asc/desc; `sortFn: "datetime"` menangani tanggal.
- **Cell auto-style**: cukup pilih `format`, tidak perlu tulis `className` atau `formatDate` manual.
- **Dua data satu kolom**: pakai `subtitleKey` (bukan array/manual JSX).
- **Filter pencarian otomatis**: `filterFn` mencocokkan `accessorKey` (+ `subtitleKey`) secara case-insensitive.
- **Override cell**: tetap bisa kirim `cell` untuk kasus khusus.

---

## Contoh Penggunaan

### 1. Teks dasar (sortable)

```tsx
const columns: DataTableColumn<User>[] = [
  ColumnSortDataTable<User>({ accessorKey: "name", label: "Name" }),
]
```

### 2. Dua data dalam satu kolom (`subtitleKey`)

```tsx
ColumnSortDataTable<Role>({
  accessorKey: "name",
  label: "Role",
  subtitleKey: "description", // baris kedua otomatis, muted
})
```

Pencarian otomatis mencocokkan `name` **dan** `description`.

### 3. Tanggal + sorting datetime

```tsx
ColumnSortDataTable<Role>({
  accessorKey: "createdAt",
  label: "Created",
  align: "end",
  format: "date",
  sortFn: "datetime",
})
```

### 4. Angka

```tsx
ColumnSortDataTable<Order>({
  accessorKey: "total",
  label: "Total",
  format: "number",
  align: "end",
})
```

### 5. Sorting awal via `DataTable`

```tsx
<DataTable<Role>
  data={data}
  columns={columns}
  getRowId={(role) => role.id}
  title="Roles"
  initialSorting={[{ id: "createdAt", desc: true }]}
/>
```

`id` pada `initialSorting` mengacu ke `id` kolom (default = `accessorKey`).

### 6. `searchKeys` kustom

```tsx
ColumnSortDataTable<User>({
  accessorKey: "name",
  label: "Name",
  subtitleKey: "email",
  searchKeys: ["name", "email", "phone"],
})
```

### 7. `id` kustom

```tsx
ColumnSortDataTable<Role>({
  id: "roleName",
  accessorKey: "name",
  label: "Role",
})
```

Berguna agar label menu View (`columnLabels.roleName`) dan `searchColumnId="roleName"` konsisten walaupun `accessorKey` berbeda.

### 8. Override cell

```tsx
import { Badge } from "@packages/ui/components/badge"

ColumnSortDataTable<Role>({
  accessorKey: "name",
  label: "Role",
  cell: ({ row }) => <Badge>{row.original.name}</Badge>,
})
```

### 9. Contoh lengkap

```tsx
const columns: DataTableColumn<Role>[] = [
  ColumnSortDataTable<Role>({
    accessorKey: "name",
    label: "Role",
    subtitleKey: "description",
  }),
  ColumnSortDataTable<Role>({
    accessorKey: "createdAt",
    label: "Created",
    align: "end",
    format: "date",
    sortFn: "datetime",
  }),
]

<DataTable<Role>
  data={data}
  columns={columns}
  getRowId={(role) => role.id}
  getRowLabel={(role) => role.name}
  entityName="role"
  title="Roles"
  searchColumnId="name"
  searchPlaceholder="Search roles..."
  columnLabels={{ name: "Role", createdAt: "Created" }}
  initialSorting={[{ id: "createdAt", desc: true }]}
/>
```

---

## Catatan

- Kolom ini selalu sortable (`enableSorting: true`).
- Tanpa `sortFn`, sorting memakai pembanding default; gunakan `sortFn: "datetime"` untuk kolom tanggal berformat string ISO agar urutannya benar.
- `filterFn` hanya aktif kalau kolom ini ditunjuk oleh `searchColumnId` pada `DataTable`.
- Jangan menambahkan `id` yang sama dengan kolom bawaan `select`/`actions`.
- Untuk kolom yang tidak perlu sorting, gunakan [`ColumnBasic`](./column-basic.md).
