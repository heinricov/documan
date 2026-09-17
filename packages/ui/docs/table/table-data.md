# DataTable

Komponen tabel data lengkap (client component) yang membungkus `@tanstack/react-table` v9. Semua fitur umum sudah tersedia langsung: search, sorting, show/hide kolom, seleksi baris (checkbox), bulk actions, pagination, empty state, dan toast.

Lokasi: `@packages/ui/table/table-data`

Kolom **select (checkbox)** dan **actions** sudah menempel di dalam komponen. Kolom data lainnya didefinisikan di tempat pemakaian (call-site), lengkap dengan datanya.

---

## Import

```tsx
import {
  DataTable,
  formatDate,
  type DataTableColumn,
  type DataTableProps,
  type DataTableFeatures,
} from "@packages/ui/table/table-data"
```

Helper kolom untuk definisi kolom yang lebih ringkas:

```tsx
import { ColumnSortDataTable } from "@packages/ui/table/column-sortable"
import { ColumnBasic } from "@packages/ui/table/column-basic"
```

---

## Ekspor

| Ekspor             | Tipe                             | Keterangan                                                       |
| ------------------ | -------------------------------- | ---------------------------------------------------------------- |
| `DataTable`        | komponen                         | Komponen tabel utamanya                                          |
| `DataTableProps`   | `interface`                      | Tipe props `DataTable`                                           |
| `DataTableColumn`  | `ColumnDef<DataTableFeatures, T>`| Tipe kolom yang dipakai `columns`                                |
| `DataTableFeatures`| `typeof DATA_TABLE_FEATURES`     | Kumpulan fitur tanstack (dipakai tipe helper kolom)              |
| `formatDate`       | `(value: string) => string`      | Format tanggal `en-US` (`Jun 12, 2026`); nilai invalid dikembalikan apa adanya |

---

## Fitur Bawaan

- **Search** — input di toolbar, memfilter satu kolom (`searchColumnId`) atau beberapa kolom sekaligus (`searchColumnId={["name", "description"]}`).
- **Sorting** — klik header sortable untuk asc/desc (disediakan helper kolom).
- **Show/hide kolom** — menu "View" untuk toggle visibilitas kolom yang `enableHiding`.
- **Seleksi baris** — kolom checkbox + checkbox "select all" (per halaman).
- **Bulk actions bar** — muncul saat ada baris terpilih; berisi `bulkActions`, tombol Export, dan tombol Remove (jika `onRemove` ada).
- **Pagination** — footer dengan jumlah hasil dan navigasi halaman.
- **Empty state** — pesan `noResultsMessage` saat data kosong.
- **Toast** — notifikasi via `sonner` untuk Export/Remove (Toaster sudah disertakan).

---

## Props

| Prop                | Tipe                                  | Default                   | Keterangan                                                                 |
| ------------------- | ------------------------------------- | ------------------------- | -------------------------------------------------------------------------- |
| `data`              | `TData[]`                             | **wajib**                 | Data baris                                                                 |
| `columns`           | `DataTableColumn<TData>[]`            | **wajib**                 | Definisi kolom data (di luar select & actions)                             |
| `getRowId`          | `(row: TData) => string`              | **wajib**                 | Id unik per baris (untuk seleksi & key)                                    |
| `getRowLabel`       | `(row: TData) => string`              | `getRowId`                | Label baris untuk `aria-label` dan toast                                   |
| `entityName`        | `string`                              | `"item"`                  | Kata benda singular untuk label/toast                                      |
| `entityNamePlural`  | `string`                              | `` `${entityName}s` ``    | Kata benda plural                                                          |
| `title`             | `string`                              | -                         | Judul header tabel                                                         |
| `description`       | `string`                              | -                         | Deskripsi di bawah judul                                                   |
| `icon`              | `React.ReactNode`                     | -                         | Ikon di samping judul                                                      |
| `searchColumnId`    | `string \| string[]`                  | -                         | Kolom/field yang difilter search. **Jika kosong, input search tidak tampil** |
| `searchPlaceholder` | `string`                              | `"Search..."`             | Placeholder input search                                                   |
| `columnLabels`      | `Record<string, string>`              | -                         | Label pada menu "Toggle Columns", key = id kolom                           |
| `noResultsMessage`  | `string`                              | `"No results found."`     | Pesan saat tidak ada baris                                                 |
| `primaryAction`     | `React.ReactNode \| string \| { title, onClick? }` | -              | Aksi utama di toolbar (lihat [Primary Action](#primary-action))             |
| `rowActions`        | `(row: TData) => ReactNode \| { label, icon?, onClick?, variant?, separatorBefore? }[]` | -      | Isi dropdown kolom actions (lihat [Row Actions](#row-actions)). **Jika kosong, kolom actions tidak tampil** |
| `bulkActions`       | `(rows: TData[]) => React.ReactNode`  | -                         | Aksi tambahan di bulk bar (di samping Export)                              |
| `onExport`          | `(rows: TData[]) => void`             | -                         | Callback tombol Export (baris terpilih)                                    |
| `onRemove`          | `(rows: TData[]) => void`             | -                         | Callback tombol Remove. **Jika kosong, tombol Remove & toast-nya nonaktif**|
| `initialSorting`    | `SortingState`                        | `[]`                      | Sorting awal, mis. `[{ id: "createdAt", desc: true }]`                     |
| `initialPageSize`   | `number`                              | `6`                       | Jumlah baris per halaman (awal)                                            |
| `className`         | `string`                              | -                         | Class tambahan pada wrapper (default `w-full max-w-4xl`)                   |

> **Catatan penting:** seluruh blok header (judul, search, tombol View, `primaryAction`) hanya dirender jika salah satu dari `title`, `description`, atau `icon` diisi.

---

## Kolom Bawaan

### `select`

Kolom checkbox, selalu ada:

- Header: checkbox "select all page" dengan state `indeterminate`.
- Cell: checkbox per baris.
- `enableSorting: false`, `enableHiding: false` (tidak bisa disembunyikan).

### `actions`

Kolom dropdown aksi, hanya muncul jika `rowActions` diberikan:

- Header disembunyikan (`sr-only`).
- Cell: tombol `Ellipsis` yang membuka dropdown berisi hasil `rowActions(row)`.
- `enableSorting: false`, `enableHiding: false`.

---

## Primary Action

`primaryAction` mendukung tiga bentuk. Dua bentuk pertama memakai tombol default dari `DataTable`; bentuk `ReactNode` sepenuhnya custom.

```tsx
// 1. String → tombol default, hanya label
primaryAction="New Role"

// 2. Object → tombol default + handler
primaryAction={{
  title: "New Role",
  onClick: () => openCreateDialog(),
}}

// 3. ReactNode → custom penuh (ikon, variant, dsb.)
primaryAction={
  <Button size="sm" onClick={openCreateDialog}>
    <Plus className="mr-1 size-3.5" aria-hidden="true" />
    New Role
  </Button>
}
```

Tipe object `DataTablePrimaryAction`:

| Field     | Tipe         | Keterangan              |
| --------- | ------------ | ----------------------- |
| `title`   | `string`     | Label tombol (wajib)    |
| `onClick` | `() => void` | Handler klik (opsional) |

---

## Row Actions

`rowActions` menerima `(row) => result`, dengan `result` berupa:

- **Array aksi** `{ label, icon?, onClick?, variant?, separatorBefore? }` → dirender sebagai `DropdownMenuItem` default.
- **`ReactNode`** (mis. kumpulan `DropdownMenuItem`) → kontrol penuh.

```tsx
// Array aksi → item default
rowActions={(role) => [
  {
    label: "Edit",
    icon: <Pencil aria-hidden="true" />,
    onClick: () => console.log("edit"),
  },
  {
    label: "View",
    icon: <Eye aria-hidden="true" />,
    onClick: () => console.log("view"),
  },
  {
    label: "Hapus",
    icon: <Trash aria-hidden="true" />,
    variant: "destructive",
    separatorBefore: true,
    onClick: () => handleRemove([role]),
  },
]}
```

Tipe `DataTableRowAction`:

| Field             | Tipe                          | Default     | Keterangan                                        |
| ----------------- | ----------------------------- | ----------- | ------------------------------------------------- |
| `label`           | `string`                      | **wajib**   | Teks item                                         |
| `icon`            | `React.ReactNode`             | -           | Ikon di kiri label                                |
| `onClick`         | `() => void`                  | -           | Handler klik                                      |
| `variant`         | `"default" \| "destructive"`  | `"default"` | `destructive` memberi warna merah                 |
| `separatorBefore` | `boolean`                     | `false`     | Garis pemisah di atas item (diabaikan untuk item pertama) |

Bentuk `ReactNode` tetap didukung untuk kasus yang butuh kontrol penuh:

```tsx
rowActions={(role) => (
  <>
    <DropdownMenuItem>
      <Pencil aria-hidden="true" /> Edit
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive" onClick={() => remove([role])}>
      <Trash aria-hidden="true" /> Remove
    </DropdownMenuItem>
  </>
)}
```

---

## Contoh Penggunaan

### 1. Dasar

```tsx
"use client"

import { DataTable, type DataTableColumn } from "@packages/ui/table/table-data"
import { ColumnSortDataTable } from "@packages/ui/table/column-sortable"
import { ColumnBasic } from "@packages/ui/table/column-basic"

type Role = {
  id: string
  name: string
  description: string
  members: number
  createdAt: string
  updatedAt: string
}

const columns: DataTableColumn<Role>[] = [
  ColumnSortDataTable<Role>({
    accessorKey: "name",
    label: "Role",
    subtitleKey: "description",
  }),
  ColumnBasic<Role>({ accessorKey: "members", label: "Members", format: "number" }),
  ColumnSortDataTable<Role>({
    accessorKey: "createdAt",
    label: "Created",
    align: "end",
    format: "date",
    sortFn: "datetime",
  }),
]

export function RolesTable({ data }: { data: Role[] }) {
  return (
    <DataTable<Role>
      data={data}
      columns={columns}
      getRowId={(role) => role.id}
      getRowLabel={(role) => role.name}
      entityName="role"
    />
  )
}
```

### 2. Header lengkap (judul, ikon, deskripsi, aksi utama)

```tsx
<DataTable<Role>
  data={data}
  columns={columns}
  getRowId={(role) => role.id}
  title="Roles"
  description={`${data.length} roles managing access to your workspace`}
  icon={<Shield className="size-4 text-muted-foreground" aria-hidden="true" />}
  primaryAction="New Role"
/>
```

`primaryAction` punya tiga bentuk (string, object, `ReactNode`) — lihat [Primary Action](#primary-action).

### 3. Search + show/hide kolom

```tsx
<DataTable<Role>
  data={data}
  columns={columns}
  getRowId={(role) => role.id}
  title="Roles"
  searchColumnId="name" // string → filter via filterFn kolom "name"
  searchPlaceholder="Search roles..."
  columnLabels={{
    name: "Role",
    members: "Members",
    createdAt: "Created",
    updatedAt: "Updated",
  }}
/>
```

Search banyak field sekaligus (array) — baris cocok jika **salah satu** field mengandung query:

```tsx
<DataTable<Role>
  data={data}
  columns={columns}
  getRowId={(role) => role.id}
  title="Roles"
  searchColumnId={["name", "description"]}
  searchPlaceholder="Search roles..."
/>
```

Catatan bentuk search:

- **`searchColumnId="name"`** (string) — memakai `filterFn` milik kolom tersebut (helper kolom otomatis mencari `accessorKey` + `subtitleKey`).
- **`searchColumnId={["name", "description"]}`** (array) — memakai global filter yang mencocokkan nilai baris berdasarkan id kolom / accessor key, sehingga boleh menyertakan field non-kolom seperti `description`.

Label pada `columnLabels` dipakai di menu "View". Nama kolom lain yang bisa disembunyikan akan memakai id kolom bila tidak ada di map.

### 4. Kolom actions (dropdown per baris)

```tsx
<DataTable<Role>
  data={data}
  columns={columns}
  getRowId={(role) => role.id}
  getRowLabel={(role) => role.name}
  title="Roles"
  rowActions={(role) => [
    { label: "Edit", icon: <Pencil aria-hidden="true" />, onClick: () => edit(role) },
    { label: "View", icon: <Eye aria-hidden="true" />, onClick: () => view(role) },
    {
      label: "Hapus",
      icon: <Trash aria-hidden="true" />,
      variant: "destructive",
      separatorBefore: true,
      onClick: () => remove([role]),
    },
  ]}
/>
```

Bisa juga mengembalikan `ReactNode` (`DropdownMenuItem`) untuk kontrol penuh — lihat [Row Actions](#row-actions).

### 5. Bulk actions, export, dan remove

```tsx
<DataTable<Role>
  data={data}
  columns={columns}
  getRowId={(role) => role.id}
  entityName="role"
  entityNamePlural="roles"
  title="Roles"
  bulkActions={(rows) => (
    <Button variant="outline" size="sm" onClick={() => archive(rows)}>
      <Archive className="size-3.5" aria-hidden="true" /> Archive ({rows.length})
    </Button>
  )}
  onExport={(rows) => exportCsv(rows)}
  onRemove={(rows) => remove(rows)}
/>
```

- `bulkActions` dirender di kiri, di samping tombol Export/Remove.
- Tombol **Export** selalu tampil dan memicu toast; `onExport` menerima baris terpilih.
- Tombol **Remove** hanya tampil jika `onRemove` diberikan; seleksi otomatis di-reset setelahnya.

### 6. Sorting awal + pagination

```tsx
<DataTable<Role>
  data={data}
  columns={columns}
  getRowId={(role) => role.id}
  title="Roles"
  initialSorting={[{ id: "createdAt", desc: true }]}
  initialPageSize={10}
/>
```

### 7. Custom cell (override)

Gunakan `cell` pada definisi kolom bila butuh render khusus:

```tsx
import { Badge } from "@packages/ui/components/badge"

const columns: DataTableColumn<Role>[] = [
  {
    accessorKey: "name",
    header: () => <span className="text-xs uppercase">Role</span>,
    cell: ({ row }) => <Badge>{row.original.name}</Badge>,
  },
]
```

### 8. Menambah kolom select/actions sendiri

Kolom `select` dan `actions` selalu ditambahkan otomatis oleh `DataTable`, jadi **jangan** mendefinisikannya ulang di array `columns`.

---

## Catatan

- Komponen berjalan di client (`"use client"`).
- Wajib memberi `getRowId` karena seleksi baris memakainya.
- `searchColumnId` string harus menunjuk ke id kolom yang punya `filterFn`. Helper `ColumnSortDataTable`/`ColumnBasic` membuat `filterFn` otomatis; kolom manual perlu `filterFn` sendiri.
- `searchColumnId` array memakai global filter (OR antar field), jadi bisa menyertakan field yang bukan kolom (mis. `subtitleKey`).
- Blok header (termasuk search & tombol View) hanya tampil jika `title`, `description`, atau `icon` diisi.
- `primaryAction` menerima `string` (tombol default berlabel tersebut), object `{ title, onClick? }` (tombol default + handler), maupun `ReactNode` (mis. `Button` dengan ikon dan `onClick`).
- Toast menggunakan `sonner`; `Toaster` sudah dirender di dalam komponen ini.
- Untuk definisi kolom, lebih disarankan memakai helper:
  - [`ColumnSortDataTable`](./column-sortable.md) — kolom sortable dengan header, cell, dan filterFn.
  - [`ColumnBasic`](./column-basic.md) — kolom non-sortable dengan cell auto-style.
