# Panduan Admin

## Tujuan

Admin adalah pengelola sistem dengan akses penuh terhadap seluruh fitur SIMS. Tugas utama Admin meliputi manajemen user, master data material, monitoring aktivitas sistem, serta konfigurasi seperti lokasi gudang. Panduan ini meringkas alur kerja Admin sehari-hari.

## Hak Akses

| Modul | Akses |
|---|---|
| Master Data | Buat, lihat, ubah, hapus material |
| Operasi Inventaris | Penuh |
| Pengadaan | Penuh (PO + Vendor) |
| Manajemen Alat | CRUD alat |
| Laporan | Penuh |
| Pengaturan | Penuh termasuk lokasi gudang |
| Permintaan Material | Lihat semua, approve, reject |
| Manajemen Pengguna | Tambah, edit, toggle status, hapus user |

## Alur Kerja Utama

### 1. Manajemen User

1. Buka **Dashboard** sebagai Admin.
2. Tabel **Manajemen Pengguna** menampilkan seluruh user dengan kolom Nama, Email, Role, Status, dan tanggal login terakhir.
3. Toggle status user dengan klik pada badge status (Aktif ↔ Nonaktif).
4. Tombol hapus akan minta konfirmasi. User yang punya transaksi atau material request tidak bisa dihapus karena dilindungi foreign key (akan muncul error 409).

### 2. Master Data Material

1. Buka **Data Master**.
2. Klik **Tambah Material Baru** untuk membuat entri baru. SKU akan dihasilkan otomatis berdasarkan kategori (mis. `PLT-AH36-1020`).
3. Untuk material berbahaya, aktifkan toggle HAZMAT.
4. Field **Nomor Heat** wajib diisi untuk material yang butuh sertifikasi BKI/Class.
5. Klik ikon Edit di tabel untuk ubah material existing — form sudah pre-filled.
6. Hapus material yang tidak punya transaksi terkait. Bila ada transaksi, sistem menolak dengan pesan error.

### 3. Monitoring Activity Log

1. Section **Log Aktivitas Sistem** di Dashboard menampilkan 15 aktivitas terbaru.
2. Aktivitas yang ter-capture saat ini: login user, pembuatan/approval/rejection material request.
3. Filter dan pencarian aktivitas tidak tersedia di UI. Untuk audit lengkap, hubungi tim backend.

### 4. Konfigurasi Lokasi Gudang

1. Buka **Pengaturan** → tab **Konfigurasi Gudang**.
2. Tambah lokasi baru dengan kode unik (mis. `WH-NEW-1`), nama, tipe (Yard/Warehouse), dan kapasitas opsional.
3. Hapus lokasi yang sudah tidak terpakai. Lokasi yang masih dipakai material akan ditolak hapusnya.

## Tips

- Gunakan **Pengaturan** → tab **Notifikasi** untuk atur preferensi notifikasi pribadi.
- Sebelum hapus user, pastikan tugasnya sudah dialihkan ke user lain.
- Periksa **Laporan** secara berkala untuk memantau nilai inventaris dan stok kritis.
- Activity log saat ini belum mencakup mutasi material atau transaksi — bila butuh audit trail penuh, koordinasi dengan tim backend untuk perluasan.
