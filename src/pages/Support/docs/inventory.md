# Panduan Inventaris

## Tujuan

Inventaris adalah inti dari SIMS. Panduan ini menjelaskan konsep stok, threshold (min stock, reorder point), serta operasi receipt / issue / scrap & return yang memengaruhi stok.

## Konsep Stok

Setiap material punya 3 angka kunci:

| Field | Arti |
|---|---|
| **Stok** | Jumlah aktual material yang ada di gudang sekarang. |
| **Min Stock** | Batas minimum di mana sistem akan menandai material sebagai *Low Stock* (warna kuning). |
| **Reorder Point** | Threshold yang disarankan untuk mulai membuat purchase request (biasanya > min stock). |

Status stok di-derive otomatis dari kedua threshold:

- `stock <= 0` → **Out of Stock** (merah)
- `stock <= minStock` → **Low Stock** (kuning)
- selain itu → **In Stock** (hijau)

## Tipe Transaksi

Semua mutasi stok tercatat di **ledger transaksi** dengan 4 tipe:

| Tipe | Pengaruh ke Stok | Catatan |
|---|---|---|
| `receipt` | +qty | Penerimaan dari vendor (Goods Receipt) |
| `issue` | -qty | Pengeluaran ke proyek (Goods Issue) |
| `scrap` | -qty | Material rusak / tidak terpakai |
| `return` | +qty | Material balik dari proyek ke gudang |

Setiap transaksi punya nomor unik `TRX-{tahun}-{seq:04d}` dan tercatat dengan tanggal aktual, user pelaksana, dan referensi (PO, proyek, atau heat number bila applicable).

## Atomic Operation

Setiap operasi yang mengubah stok dijalankan dalam database transaction:

1. Lock row material via `SELECT FOR UPDATE`.
2. Validasi (mis. cek stok cukup untuk issue).
3. Update qty stok.
4. Insert ke tabel transactions.
5. Untuk Goods Receipt yang ter-link PO: update juga `po_item.received_qty` + auto-refresh status PO.

Bila ada satu langkah gagal, semua di-rollback. Tidak ada kondisi setengah-jadi.

## Goods Receipt Validation

- Qty diterima tidak boleh melebihi qty yang dipesan di PO. DB-level constraint `received_qty <= ordered_qty` mencegah over-receive.
- Setelah semua item full diterima, status PO otomatis jadi *Completed*.

## Goods Issue Validation

- Qty issue tidak boleh melebihi stok aktual. Sistem mengecek stok dengan `SELECT FOR UPDATE` agar tidak ada race condition antar Staff yang issue bersamaan.
- Material **Out of Stock** tidak bisa di-issue (tombol Submit non-aktif di UI, plus validasi server-side).

## Penomoran Heat

Untuk material baja, **selalu** input nomor heat saat receipt agar:

- Halaman **Penelusuran** dapat menampilkan timeline pergerakan material.
- Audit BKI/Class lebih mudah karena bisa di-cross-reference dengan mill test certificate.

## Stok Kritis & Reorder

1. Material di bawah `min_stock` muncul di section **Stok Kritis** di Dashboard.
2. Field `reorder_point` saat ini hanya disimpan sebagai metadata — belum ada auto-trigger PR/PO. Lihat AUDIT_LOCAL.md item #12 untuk roadmap auto-notify low stock.
3. Saat kondisi kritis: Supervisor buat PO baru via halaman Pengadaan, atau Staff buat Material Request bertipe Purchase Request.

## Tips

- Selalu **tutup transaksi yang sudah dimulai** — jangan tinggalkan tab di tengah pengisian, karena tidak ada draft auto-save.
- Untuk material HAZMAT, isi field MSDS / specifications agar info bahaya selalu tersedia bagi Staff lapangan.
- Lakukan stock opname berkala (manual) dan cocokkan dengan stok di sistem. Bila ada selisih, gunakan **Scrap & Retur** untuk koreksi (scrap untuk pengurangan, return untuk penambahan).
