# ⚓ NaviStock — Frontend

> **Navigation/Naval Stock** — Aplikasi web manajemen inventaris galangan kapal, dibangun dengan React + Vite.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Prasyarat

| Tool | Versi Minimal | Cek dengan |
|------|--------------|------------|
| **Node.js** | 18.x | `node -v` |
| **npm** | 9.x | `npm -v` |
| **Git** | — | `git --version` |

> ⚠️ Frontend ini **butuh backend berjalan** untuk berfungsi penuh. Lihat [Koneksi ke Backend](#koneksi-ke-backend).

---

## Cara Menjalankan (Dari Nol)

### 1. Clone Repository

```bash
git clone https://github.com/PROYEK3-ULBI/sims-frontend.git
cd sims-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Konfigurasi Environment

```bash
# Salin template
cp .env.example .env.local
```

Buka `.env.local` dan pastikan URL backend benar:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

> Jika backend berjalan di port lain (misal 9090), sesuaikan URL-nya.

### 4. Jalankan Development Server

```bash
npm run dev
```

Aplikasi berjalan di **http://localhost:5173/**

### 5. Login

Gunakan salah satu akun demo (dibuat otomatis oleh backend saat pertama kali dijalankan):

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@shipyard.co.id` | `admin123` |
| Supervisor | `supervisor@shipyard.co.id` | `admin123` |
| Staff | `staff@shipyard.co.id` | `admin123` |

---

## Koneksi ke Backend

Frontend ini membutuhkan **sims-backend** untuk semua operasi data. Pastikan:

1. **Backend sudah berjalan** di `http://localhost:8080` (lihat [README backend](../sims-backend/README.md))
2. **CORS sudah dikonfigurasi** — default backend sudah mengizinkan `http://localhost:5173`
3. Jika backend di port/host lain, update `VITE_API_BASE_URL` di `.env.local`

**Urutan menjalankan:**
```
1. Jalankan backend dulu    →  cd sims-backend && go run ./cmd/api
2. Baru jalankan frontend   →  cd sims-frontend && npm run dev
```

---

## Fitur Utama

| Modul | Deskripsi |
|-------|-----------|
| 📊 **Dashboard** | Ringkasan operasional, statistik, pusat persetujuan |
| 📦 **Data Master** | Katalog material dengan SKU, kategori, harga |
| ⬇️ **Penerimaan Barang** | Pencatatan barang masuk dari vendor |
| ⬆️ **Pengeluaran Barang** | Pencatatan barang keluar untuk proyek |
| ♻️ **Scrap & Retur** | Pengelolaan material sisa dan pengembalian |
| 🔍 **Penelusuran** | Traceability material dengan timeline & heat number |
| 🔧 **Manajemen Alat** | Inventaris alat kerja, kalibrasi, status |
| 📋 **Permintaan Material** | Workflow request → approval Supervisor |
| 🛒 **Pengadaan** | Purchase Order dan manajemen vendor |
| 📈 **Laporan** | Analitik valuasi stok, konsumsi, transaksi |
| ⚙️ **Pengaturan** | Profil pengguna, notifikasi, konfigurasi gudang |
| ❓ **Bantuan** | FAQ, panduan pengguna, kontak support |

---

## Role-Based Access Control (RBAC)

| Peran | Akses |
|-------|-------|
| **Admin** | Akses penuh ke semua modul + manajemen pengguna |
| **Supervisor** | Persetujuan request, monitoring operasional, laporan |
| **Staff** | Input transaksi harian, pengajuan material request |

---

## Tech Stack

| Layer | Library |
|-------|---------|
| UI Framework | React 19 |
| Bundler | Vite 8 |
| Routing | React Router DOM v7 |
| Charts | Recharts |
| Icons | Lucide React |
| Styling | Vanilla CSS (custom design system) |
| State | React Context API (AuthContext, AppContext, ThemeContext) |
| Export | jspdf, jspdf-autotable, xlsx (dynamic import) |

---

## Scripts

```bash
npm run dev       # Jalankan dev server (http://localhost:5173)
npm run build     # Build untuk produksi (output di dist/)
npm run preview   # Preview build produksi lokal
npm run lint      # Jalankan ESLint
```

---

## Struktur Project

```
sims-frontend/
├── public/                 # Asset statis
├── src/
│   ├── components/
│   │   ├── layout/         # Sidebar, Header, MainLayout
│   │   └── ui/             # Button, Card, Modal, DataTable, dll.
│   ├── config/
│   │   └── permissions.js  # RBAC: allowedRoutes & sidebarItems per role
│   ├── context/            # AuthContext, AppContext, ThemeContext
│   ├── data/               # Data statis / mock
│   ├── lib/
│   │   └── api/            # API client per domain (materials, vendors, dll.)
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
│   ├── App.jsx             # Root component + routing
│   └── main.jsx            # Entry point
├── index.html
├── package.json
├── vite.config.js
└── eslint.config.js
```

---

## Responsive Design

- Sidebar → hamburger menu pada layar ≤768px
- Grid layout menyesuaikan ke single column pada mobile
- Tabel mendukung horizontal scroll
- Modal & form responsif di semua ukuran layar

---

## Troubleshooting

### Halaman blank / "Network Error" setelah login
Backend belum berjalan atau URL tidak sesuai. Pastikan:
1. Backend running di port yang sesuai dengan `VITE_API_BASE_URL`
2. Cek console browser → Network tab untuk melihat error detail

### Semua halaman tampil "403 Forbidden"
Role akun kamu tidak punya akses ke halaman tersebut. Login sebagai **Admin** untuk akses penuh.

### `npm install` gagal
- Pastikan Node.js versi ≥18: `node -v`
- Hapus cache dan coba lagi:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

### Perubahan `.env.local` tidak terdeteksi
Restart dev server (`Ctrl+C` lalu `npm run dev`). Vite hanya membaca env saat startup.

---

## Tim Pengembang

**PROYEK3-ULBI** — Universitas Logistik dan Bisnis Internasional

---

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).
