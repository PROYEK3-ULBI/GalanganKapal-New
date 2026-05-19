# Panduan Penelusuran (Traceability)

## Tujuan

Penelusuran material adalah kemampuan untuk melacak asal, pergerakan, dan riwayat sebuah material berdasarkan **nomor heat** (heat number). Ini penting untuk audit Badan Klasifikasi Indonesia (BKI/Class), audit internal, dan investigasi kualitas.

## Konsep Penting

| Istilah | Arti |
|---|---|
| **Heat Number** | Kode batch produksi baja dari pabrik. Wajib untuk material yang butuh sertifikasi. |
| **SKU** | Kode unik identifikasi material di sistem. |
| **Mill Test Certificate** | Sertifikat dari pabrik yang menyatakan komposisi kimia & sifat mekanis batch baja. |
| **BKI** | Badan Klasifikasi Indonesia, lembaga sertifikasi kapal. |

## Mengakses Halaman

1. Buka menu sidebar **Penelusuran**.
2. Sidebar kiri menampilkan daftar material yang punya nomor heat (otomatis terfilter dari master data).
3. Klik salah satu material untuk membuka detail di panel kanan.

## Membaca Timeline

Panel kanan punya 2 card:

### Informasi Material
Menampilkan SKU, nama, nomor heat, kategori, lokasi gudang, dan stok saat ini.

### Timeline Pergerakan
Daftar pergerakan dari ledger transaksi, urut dari yang **paling baru** ke yang **paling lama**. Setiap entri timeline punya:

- **Judul step** sesuai tipe transaksi:
  - *Diterima dari {vendor}* — penerimaan dari vendor (Goods Receipt)
  - *Dikeluarkan ke proyek {kode}* — pengeluaran ke proyek (Goods Issue)
  - *Scrap* — pencatatan material rusak / tidak terpakai
  - *Dikembalikan dari proyek {kode}* — material balik dari proyek
- **Detail** — qty, satuan, nomor PO (jika ada), notes
- **Tanggal** transaksi (format Indonesia)
- **Nomor transaksi** (mis. `TRX-2026-0042`) untuk cross-reference di laporan

Sub-judul card menunjukkan jumlah pergerakan yang tercatat.

## Skenario Audit BKI

Misalnya BKI minta bukti material baja AH36 di posisi tertentu di kapal H-2026-001:

1. Cari material `PLT-AH36-1020` (atau SKU sejenis) di Penelusuran.
2. Cek nomor heat di card Informasi Material — cocokkan dengan certificate dari pabrik.
3. Lihat timeline: cari step *Dikeluarkan ke proyek H-2026-001* untuk konfirmasi material itu memang dipakai di kapal tersebut.
4. Catat nomor transaksi sebagai referensi audit.

## Catatan & Batasan

- Saat ini sistem **belum punya fitur upload mill test certificate** ke database. Sertifikat fisik atau scan masih harus disimpan terpisah.
- Tidak semua material punya nomor heat — hanya material yang isi field `heatNumber` saat dibuat atau saat receipt yang muncul di sidebar Penelusuran.
- Bila material punya 2 batch berbeda dengan heat berbeda, di sistem saat ini belum dipisah per batch — semua agregasi di satu SKU. Untuk skenario ini, koordinasi dengan tim untuk catat manual.

## Tips

- Saat input Goods Receipt, **selalu** isi field nomor heat per item agar traceability lengkap.
- Bila menemukan ketidakcocokan timeline (mis. tanggal aneh atau qty tidak masuk akal), cek langsung di halaman Laporan tab Transaksi atau koordinasi dengan Supervisor.
