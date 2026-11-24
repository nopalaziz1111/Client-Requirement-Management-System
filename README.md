# Client Requirement Management System

Aplikasi web modern berbasis **HTML5, CSS3, JavaScript (Vanilla ES6+)**, dan **Supabase (PostgreSQL & Supabase Auth & RLS)** untuk memfasilitasi pengumpulan kebutuhan proyek website dari calon klien secara terstruktur serta pengelolaan pengajuan melalui Dashboard Administrator.

Desain antarmuka mengusung konsep **Modern Minimalist (White, Navy, Clean)** yang responsif di desktop, tablet, dan ponsel.

---

## 🚀 Fitur Utama

### 1. Client Side
- **Landing Page & Hero (CL-01):** Informasi tujuan pengumpulan kebutuhan dan tombol call-to-action.
- **Section A — Informasi Klien (CL-02):** Nama lengkap, perusahaan/bisnis, email, WhatsApp, dan bidang usaha.
- **Section B — Kebutuhan Website (CL-03, CL-04, CL-05):** Pemilihan kategori website (Company Profile, E-Commerce, Education, Booking System, dll.), tujuan pembuatan, dan deskripsi proyek.
- **Section C — Pemilihan Fitur (CL-06):** Checklist kartu fitur interaktif (Auth, Dashboard, CRUD, Payment, WhatsApp, Notifikasi, dsb.) serta opsi tambah fitur kustom.
- **Section D — Pengguna & Konten (CL-07, CL-08):** Target pengguna website, kesiapan materi konten (teks/gambar), dan kebutuhan CMS.
- **Section E — Preferensi Desain (CL-09):** Pilihan style (Modern Minimalis, Corporate, Elegant, Colorful, dsb.), URL referensi website, palet warna, dan catatan desain.
- **Section F — Budget & Timeline (CL-10, CL-11, CL-12):** Estimasi anggaran, target deadline, kepemilikan domain & hosting.
- **Review & Validasi Realtime:** Pemeriksaan rangkuman jawaban sebelum dikirim dengan tombol edit langsung ke section terkait.
- **Halaman Konfirmasi (CL-14):** Layar sukses dengan ID referensi UUID dan informasi langkah selanjutnya.

### 2. Admin Side
- **Autentikasi Administrator (AD-01):** Login email & password menggunakan Supabase Auth (dengan kredensial demo untuk testing offline).
- **Dashboard Statistik (AD-02 s/d AD-05):** Kartu metrik realtime untuk Total Pengajuan, Pending, Sedang Diproses (Reviewing & In Progress), dan Selesai (Completed).
- **Daftar Pengajuan (AD-06):** Tabel responsif dengan format tanggal, nama klien, kontak link (WhatsApp & Email), tipe website, estimasi budget, dan status badge.
- **Detail Kebutuhan (AD-07):** Modal rincian lengkap seluruh jawaban klien terorganisir per section A - F.
- **Pencarian Realtime (AD-08):** Filter instan berdasarkan nama klien, nama perusahaan, email, atau nomor telepon.
- **Filter Kategori & Status (AD-09):** Filter berdasarkan jenis website dan status proyek.
- **Pembaruan Status (AD-10):** Transisi status: `Pending` &rarr; `Reviewing` &rarr; `In Progress` &rarr; `Completed`.
- **Hapus Pengajuan (AD-11):** Penghapusan pengajuan dengan dialog konfirmasi.
- **Ekspor CSV (AD-12):** Unduh seluruh dataset pengajuan ke format CSV (UTF-8 BOM compatible dengan Microsoft Excel).
- **Supabase Connection Manager:** Konfigurasi Supabase Project URL dan Anon Key langsung melalui modal pengaturan di dashboard atau offline fallback mode.

---

## 📁 Struktur Direktori

```text
Client Requirement Management System/
├── index.html              # Halaman formulir pengumpulan kebutuhan klien
├── admin.html              # Halaman portal login & dashboard administrator
├── schema.sql              # Skrip skema database PostgreSQL, RLS, & data seed untuk Supabase
├── css/
│   └── styles.css          # Desain sistem & styling modern minimalist
├── js/
│   ├── supabase-config.js  # Service layer Supabase & offline demo fallback
│   ├── app.js              # Logika formulir bertahap (stepper) klien
│   └── admin.js            # Logika dashboard admin, auth, filter, dan CRUD
└── README.md               # Dokumentasi instalasi dan penggunaan
```

---

## 🛠️ Panduan Integrasi Supabase

Aplikasi dapat langsung diuji coba berkat **Demo Storage Mode**. Untuk menghubungkan ke project database Supabase Anda:

### Langkah 1: Buat Proyek Supabase
1. Masuk ke [Supabase Dashboard](https://supabase.com).
2. Buat proyek baru (*New Project*).
3. Catat **Project URL** dan **Anon / Public API Key** di menu **Settings > API**.

### Langkah 2: Jalankan Skrip SQL
1. Buka menu **SQL Editor** di dashboard Supabase Anda.
2. Salin seluruh isi berkas [`schema.sql`](file:///c:/Users/naufa/Downloads/Client%20Requirement%20Management%20System/schema.sql) dan tempel ke SQL Editor.
3. Klik **Run**.
4. Skrip ini akan membuat tabel `submissions`, fungsi otomatis `updated_at`, dan aturan **Row Level Security (RLS)**:
   - Akses publik hanya diizinkan untuk `INSERT` formulir baru.
   - Hanya pengguna terautentikasi (Admin) yang dapat melakukan `SELECT`, `UPDATE`, dan `DELETE`.

### Langkah 3: Buat Akun Administrator di Supabase Auth
1. Buka menu **Authentication > Users** di Supabase.
2. Klik **Add User** > **Create User**.
3. Masukkan email administrator (misal `admin@domainanda.com`) dan password yang aman.
4. Pastikan opsi *Auto Confirm User* dicentang.

### Langkah 4: Hubungkan ke Aplikasi
Buka `admin.html`, klik menu **Koneksi Supabase** di sidebar (atau klik badge status di pojok kanan atas), masukkan **Project URL** dan **Anon Key** Anda, lalu klik **Simpan & Hubungkan**.

---

## 🔑 Mode Demo (Out of the Box)

Jika Anda langsung membuka file di browser tanpa mengisi kredensial Supabase, sistem otomatis beralih ke **Demo Storage Mode** yang menyimpan data di browser (`localStorage`) dengan data seed contoh.

Kredensial login demo admin:
- **Email:** `admin@clientrequirements.com`
- **Password:** `admin123`

---

## 🌐 Menjalankan Secara Lokal & Deployment

### Menjalankan Lokal
Cukup buka berkas `index.html` dan `admin.html` langsung pada browser web modern, atau gunakan web server lokal sederhana (misal Live Server di VS Code atau Python):

```bash
# Menggunakan Python 3:
python -m http.server 8000
```
Buka:
- Client Portal: `http://localhost:8000/`
- Admin Portal: `http://localhost:8000/admin.html`

### Deployment ke GitHub Pages
1. Inisialisasi Git repository dan push proyek ini ke GitHub.
2. Buka menu **Settings > Pages** pada repository GitHub Anda.
3. Pada bagian **Build and deployment > Source**, pilih branch `main` dan folder `/ (root)`.
4. Simpan, dan aplikasi web Anda akan live secara publik dalam hitungan menit!
