# Panduan Staff

## Tujuan

Staff Gudang adalah user lapangan yang menangani penerimaan barang, pengeluaran ke proyek, pengembalian, dan peminjaman alat. Panduan ini meringkas operasi harian Staff di SIMS.

## Hak Akses

| Modul | Akses |
|---|---|
| Operasi Inventaris | Penuh |
| Permintaan Material | Buat, lihat sendiri |
| Penelusuran | Lihat |
| Manajemen Alat | Lihat, checkout, return |
| Pengaturan | Profil, password, notifikasi |
| Master Data, Pengadaan, Laporan | Tidak dapat diakses |

## Alur Kerja Utama

### 1. Membuat Material Request

1. Buka **Permintaan Material** → klik **Buat Request Baru**.
2. Pilih proyek tujuan, prioritas (Rendah/Sedang/Tinggi).
3. Tambahkan item: cari material → set qty → ulangi untuk material lain.
4. Tulis alasan singkat di field notes (opsional tapi disarankan).
5. Klik **Kirim Request**. Status awal: *Pending*.
6. Pantau status: *Pending* → Supervisor sedang review. *Approved* → Anda boleh lanjut ke Goods Issue. *Rejected* → cek alasan, buat ulang jika perlu.

### 2. Goods Receipt (Penerimaan Barang)

1. Buka **Operasi Inventaris** → **Penerimaan Barang**.
2. Pilih PO yang sudah dipesan dari dropdown. Item-item akan otomatis ditampilkan.
3. Untuk setiap item, isi qty yang benar-benar diterima dan nomor heat (jika baja).
4. Qty diterima tidak boleh melebihi qty yang dipesan.
5. Klik **Konfirmasi Penerimaan**. Stok material di tabel master akan otomatis bertambah.

### 3. Goods Issue (Pengeluaran Barang)

1. Buka **Operasi Inventaris** → **Pengeluaran Barang**.
2. Pilih proyek tujuan dan isi nama mandor.
3. Cari material → tambahkan ke cart → set qty.
4. Sistem mengecek stok aktual: jika qty diminta > stok tersedia, baris dihighlight merah dan tombol Submit non-aktif.
5. Klik **Kirim** untuk finalize. Stok berkurang otomatis.

### 4. Scrap & Return (Pengembalian)

1. Buka **Operasi Inventaris** → **Scrap & Retur**.
2. Pilih tipe: **Scrap** (material rusak / tidak bisa dipakai → mengurangi stok) atau **Retur** (material masih bagus, balik ke gudang → menambah stok).
3. Cari material, isi qty, alasan, opsional nomor heat dan proyek.
4. Klik Submit.

### 5. Peminjaman Alat

1. Buka **Manajemen Alat**.
2. Filter status **Available** untuk alat yang siap dipinjam.
3. Klik **Pinjam** pada card alat yang dibutuhkan. Status berubah jadi *In Use* dan Anda dicatat sebagai borrower.
4. Setelah selesai pakai, klik **Kembalikan**. Status balik ke *Available*.
5. Riwayat peminjaman tercatat di tool history (audit trail).

## Tips

- Selalu input nomor heat untuk material baja saat Goods Receipt — ini penting untuk traceability.
- Sebelum Goods Issue, pastikan material request Anda sudah **Approved**. Kalau belum, koordinasi dengan Supervisor.
- Kalau scan barcode tidak tersedia, ketik SKU secara manual di field search.
- Pengembalian alat tepat waktu menghindari konflik dengan rekan lain yang butuh alat sama.
- Bila ada masalah teknis, kirim tiket di **Bantuan** dengan prioritas yang sesuai.
