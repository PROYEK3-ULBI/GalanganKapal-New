# ⚓ SIMS — Sistem Manajemen Inventaris Galangan Kapal

> **Shipyard Inventory Management System** — Aplikasi manajemen inventaris terintegrasi untuk operasional galangan kapal, dibangun dengan React + Vite.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Deskripsi

SIMS (Shipyard Inventory Management System) adalah aplikasi web untuk mengelola seluruh siklus inventaris material di lingkungan galangan kapal. Aplikasi ini mencakup proses penerimaan barang, pengeluaran barang, scrap & retur, penelusuran material, manajemen alat, pengadaan, hingga pelaporan analitik.

Seluruh antarmuka pengguna telah **dilokalisasi sepenuhnya ke Bahasa Indonesia** untuk kemudahan penggunaan oleh personel galangan.

---

## ✨ Fitur Utama

| Modul | Deskripsi |
|-------|-----------|
| 📊 **Dashboard** | Ringkasan operasional, statistik pengguna, pusat persetujuan |
| 📦 **Data Master** | Katalog material lengkap dengan SKU, kategori, dan harga |
| ⬇️ **Penerimaan Barang** | Pencatatan barang masuk dari supplier/vendor |
| ⬆️ **Pengeluaran Barang** | Pencatatan barang keluar untuk proyek/hull |
| ♻️ **Scrap & Retur** | Pengelolaan material sisa dan pengembalian |
| 🔍 **Penelusuran** | Traceability material dengan timeline & heat number |
| 🔧 **Manajemen Alat** | Inventaris alat kerja, kalibrasi, dan status |
| 📋 **Permintaan Material** | Workflow request → approval oleh Supervisor |
| 🛒 **Pengadaan** | Manajemen Purchase Order dan vendor |
| 📈 **Laporan** | Analitik valuasi stok, konsumsi, dan transaksi |
| ⚙️ **Pengaturan** | Profil pengguna, notifikasi, konfigurasi gudang |
| ❓ **Bantuan** | FAQ, panduan pengguna, dan kontak support |

---

## 🔐 Role-Based Access Control (RBAC)

| Peran | Akses |
|-------|-------|
| **Admin** | Akses penuh ke semua modul, manajemen pengguna |
| **Supervisor** | Persetujuan request, monitoring operasional, laporan |
| **Staff** | Input transaksi harian, pengajuan material request |

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite 8
- **Routing:** React Router DOM v7
- **Charting:** Recharts
- **Icons:** Lucide React
- **Styling:** Vanilla CSS (custom design system)
- **State:** React Context API

---

## 🚀 Cara Menjalankan

### Prasyarat
- [Node.js](https://nodejs.org/) versi 18 atau lebih baru
- npm atau yarn

### Instalasi

```bash
# 1. Clone repository
git clone https://github.com/PROYEK3-ULBI/GalanganKapal-New.git

# 2. Masuk ke direktori proyek
cd GalanganKapal-New

# 3. Install dependencies
npm install

# 4. Jalankan development server
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173/`

### Build untuk Produksi

```bash
npm run build
```

---

## 🔑 Akun Demo

| Peran | Email | Password |
|-------|-------|----------|
| Admin | admin@shipyard.co.id | admin123 |
| Supervisor | supervisor@shipyard.co.id | admin123 |
| Staff | staff@shipyard.co.id | admin123 |

---

## 📁 Struktur Proyek

```
├── public/
├── src/
│   ├── components/
│   │   ├── layout/         # Sidebar, Header, MainLayout
│   │   └── ui/             # Button, Card, Modal, DataTable, dll.
│   ├── config/             # Permissions & RBAC
│   ├── context/            # AppContext, AuthContext
│   ├── data/               # Mock data
│   ├── pages/
│   │   ├── Dashboard/
│   │   ├── Inventory/      # GoodsReceipt, GoodsIssue, ScrapReturn
│   │   ├── MasterData/
│   │   ├── MaterialRequest/
│   │   ├── Procurement/
│   │   ├── Reports/
│   │   ├── Settings/
│   │   ├── Support/
│   │   ├── Traceability/
│   │   └── ToolsManagement/
│   ├── styles/             # CSS Variables & global styles
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

---

## 📱 Responsive Design

Aplikasi mendukung tampilan **desktop** dan **mobile**:
- Sidebar berubah menjadi hamburger menu di perangkat mobile (≤768px)
- Grid layout otomatis menyesuaikan (single column pada mobile)
- Tabel mendukung horizontal scroll
- Modal & form responsif di semua ukuran layar

---

## 👨‍💻 Tim Pengembang

**PROYEK3-ULBI** — Universitas Logistik dan Bisnis Internasional

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).
