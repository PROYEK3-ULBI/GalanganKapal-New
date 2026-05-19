# Panduan Supervisor

## Tujuan

Supervisor (Project Manager / Kepala Gudang) bertanggung jawab mengawasi operasional, memberikan persetujuan pada permintaan material, serta memantau performa inventaris. Panduan ini menjelaskan alur kerja kunci supervisor di SIMS.

## Hak Akses

| Modul | Akses |
|---|---|
| Master Data | Lihat saja |
| Operasi Inventaris | Penuh |
| Permintaan Material | Lihat semua, approve, reject |
| Pengadaan | Penuh (PO + Vendor) |
| Penelusuran | Penuh |
| Manajemen Alat | Lihat, checkout, return |
| Laporan | Penuh |
| Pengaturan | Profil, password, notifikasi |

## Alur Kerja Utama

### 1. Memproses Material Request (Approval Center)

1. Buka **Dashboard** sebagai Supervisor.
2. Section **Approval Center** menampilkan request berstatus *Pending*.
3. Klik tombol hijau (Approve) atau merah (Reject) sesuai keputusan.
4. Status berubah real-time. Requester (Staff) langsung dapat notifikasi.
5. Klik **Buka Material Request** untuk lihat semua request termasuk yang sudah diputuskan.

### 2. Monitoring KPI

1. KPI cards di Dashboard menampilkan total nilai inventaris, jumlah pending approvals, stok kritis, dan proyek aktif.
2. Chart **Tingkat Perputaran Inventaris** mendukung filter **7 hari / 30 hari / 90 hari**.
3. Section **Riwayat Approval Terbaru** menampilkan 5 request terakhir yang sudah diputuskan.

### 3. Membuat Purchase Order

1. Buka **Pengadaan** → klik **Buat PO Baru**.
2. Pilih vendor, isi tanggal pesan, dan tambahkan items (material + qty + harga).
3. PO Number dihasilkan otomatis dengan format `PO-{tahun}-{seq:04d}`.
4. Setelah disimpan, PO punya status *Draft* atau *Pending* (sesuai aksi).
5. Saat barang diterima Staff via Goods Receipt, status PO akan auto-update jadi *Partially Received* atau *Completed*.

### 4. Audit Traceability

1. Buka **Penelusuran**.
2. Pilih material dari sidebar (hanya yang punya nomor heat).
3. Panel kanan menampilkan info material dan timeline pergerakan dari transaksi real (Receipt, Issue, Scrap, Return).
4. Tanggal pada timeline berasal dari ledger transaksi, bukan estimasi.

### 5. Membaca Laporan

1. Buka **Laporan** untuk akses 4 tab: Valuasi Stok, Rincian Kategori, Ringkasan Transaksi, Konsumsi Proyek.
2. Tombol **Ekspor PDF** dan **Ekspor Excel** mengunduh data tab aktif. Berguna untuk meeting atau laporan ke manajemen atas.
3. Konsumsi Proyek menunjukkan total qty material yang sudah keluar (issue + scrap) per proyek kapal.

## Tips

- Periksa Approval Center setiap pagi — request menumpuk dapat menghambat operasional Staff di lapangan.
- Untuk reject request, kasih notes singkat di field notes (saat ini opsional, tapi membantu Staff memahami alasan).
- Pantau stok kritis di Dashboard — jika muncul, segera buat PR/PO untuk material itu.
- Ekspor laporan bulanan ke PDF/Excel untuk dokumentasi internal atau audit eksternal.
