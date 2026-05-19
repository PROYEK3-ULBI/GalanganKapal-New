# Panduan Pengadaan (Procurement)

## Tujuan

Modul Pengadaan mengelola pembelian material ke vendor. Output utamanya adalah **Purchase Order (PO)** yang nantinya jadi acuan saat Goods Receipt. Panduan ini menjelaskan alur PO + manajemen vendor.

## Hak Akses

| Aksi | Admin | Supervisor | Staff |
|---|---|---|---|
| Lihat PO & Vendor | ✓ | ✓ | ✗ |
| Buat / Edit PO | ✓ | ✓ | ✗ |
| Buat / Edit Vendor (via API) | ✓ | ✓ | ✗ |

> Catatan: tombol UI untuk tambah/edit/hapus Vendor dari halaman Procurement saat ini belum ada — operasi mutasi vendor harus via Postman atau langsung database. Lihat AUDIT_LOCAL.md item #13.

## Halaman Pengadaan

Halaman punya 2 tab utama:

### Tab "Daftar PO"

- Tabel PO dengan progress bar yang menampilkan persentase qty terterima vs qty dipesan.
- Klik baris untuk buka modal detail PO + items.
- Filter status: Draft, Pending, Partially Received, Completed, Cancelled.

### Tab "Daftar Vendor"

- Tabel vendor dengan jumlah PO yang sudah pernah dibuat.
- Read-only di UI saat ini.

## Alur Kerja Buat PO

1. Klik **Buat PO Baru** di tab Daftar PO.
2. Pilih vendor dari dropdown.
3. Isi tanggal pesan (default hari ini).
4. Tambahkan line items: pilih material → qty pesan → harga satuan.
5. Klik **Simpan**. Sistem auto-generate `PO-{tahun}-{seq:04d}`.
6. Status awal: *Draft* (belum committed) atau *Pending* (siap diterima).

## Status PO Auto-Update

Saat Staff melakukan Goods Receipt yang ter-link ke PO ini:

- Sebagian item diterima → status PO jadi **Partially Received**.
- Semua item full diterima (qty receipt = qty pesan) → status PO jadi **Completed**.

Auto-update ini dijalankan dalam transaction database, jadi tidak ada race condition.

## Database Constraint

- DB level constraint: `received_qty <= ordered_qty` di tabel `purchase_order_items`. Goods Receipt yang melebihi qty pesan akan ditolak dengan error 422.
- PO yang sudah punya transaksi receipt tidak bisa dihapus (FK protection).

## Catatan & Batasan

- **Workflow PR → PO** belum end-to-end di UI: Material Request bertipe "Purchase Request" disetujui tidak otomatis jadi PO. Saat ini admin/supervisor masih buat PO manual.
- Vendor management masih lewat API. UI Add/Edit/Delete Vendor masih open task.
- PDF cetak PO untuk vendor belum ada (di-print dari halaman pakai browser print).

## Tips

- Sebelum buat PO, cek dulu di **Pengaturan Master Data** apakah material yang dipesan sudah ada di catalog. Kalau belum, koordinasi dengan Admin untuk buat dulu.
- Pakai notes PO untuk catat informasi tambahan (mis. "Pengiriman bertahap", "PIC: Pak Budi 0812-xxx").
- Pantau Daftar PO secara berkala — PO yang sudah lewat lead time tapi masih *Pending* mungkin perlu follow-up ke vendor.
