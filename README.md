# 🏛️ Portal Akademik Kampus Fiktif (SIAKAD)
### Aplikasi Khusus Simulasi Audit Keamanan Sistem Informasi & CTF

Aplikasi web portal kampus fiktif ini dibangun menggunakan **Next.js (App Router)** yang dirancang khusus untuk kebutuhan tugas praktikum, demonstrasi kerentanan web, dan simulasi audit keamanan (CTF / Capture The Flag).

---

## ⚠️ Peringatan Keamanan (Security Disclaimer)
> [!CAUTION]
> Aplikasi ini **SENGAJA DIBUAT MEMILIKI KERENTANAN KRITIS** untuk tujuan pembelajaran. Jangan pernah menggunakan pola penulisan kode pada aplikasi ini di lingkungan produksi nyata!

---

## 🎯 Kerentanan yang Sengaja Ditanam

### 1. SQL Injection pada Form Login
- **Lokasi Kode:** [`app/api/auth/login/route.js`](file:///app/api/auth/login/route.js)
- **Implementasi:**
  Menggabungkan nilai input mentah (`username` dan `password`) dari pengguna secara langsung menggunakan *string concatenation* (`${username}`) ke dalam raw query SQL tanpa sanitasi, validasi, maupun *parameterized query* (*prepared statement*):
  ```javascript
  const rawSql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  const users = await executeQuery(rawSql);
  ```
- **Contoh Payload Exploitasi:**
  - **Bypass sebagai Admin:**
    - Username: `admin' --`
    - Password: *(bebas/sembarang)*
    - *Query yang dieksekusi:*
      ```sql
      SELECT * FROM users WHERE username = 'admin' --' AND password = '...'
      ```
  - **Bypass Akun Pertama (Universal Authentication Bypass):**
    - Username: `' OR '1'='1' --`
    - Password: *(bebas/sembarang)*

### 2. Percobaan Sandi Tanpa Pembatasan (*Unrestricted Login / Brute Force*)
- **Lokasi Kode:** [`app/api/auth/login/route.js`](file:///app/api/auth/login/route.js)
- **Implementasi:**
  - Tidak ada *Rate Limiting* (misal: pembatasan 5 request per IP per menit).
  - Tidak ada mekanisme *Account Lockout* setelah beberapa kali percobaan gagal.
  - Tidak ada proteksi *CAPTCHA*.
- **Skenario Audit:**
  Penyerang dapat menggunakan alat otomatisasi seperti **Burp Suite Intruder**, **OWASP ZAP**, **Hydra**, atau script Python sederhana untuk melakukan serangan kamus (*dictionary attack*) ribuan kali berturut-turut tanpa pernah diblokir (respons HTTP 429).

---

## 👥 Data Akun Sintetis (Seed Data)

Database sudah dilengkapi dengan 6 akun sintetis yang memiliki password mudah ditebak:

| Role | Username | Password (Plaintext) | Nama Lengkap | NIM / NIP | Email |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Administrator Portal Kampus | `ADMIN001` | `admin@kampus.ac.id` |
| **Dosen** | `dosen_budi` | `dosen123` | Dr. Budi Santoso, M.Kom. | `198001152005011002` | `budi.santoso@kampus.ac.id` |
| **Dosen** | `dosen_siti` | `siti2024` | Dr. Siti Rahma, M.T. | `198506202010122001` | `siti.rahma@kampus.ac.id` |
| **Mahasiswa** | `mhs_adi` | `adi123` | Adi Nugroho | `2021001` | `adi.nugroho@mhs.kampus.ac.id` |
| **Mahasiswa** | `mhs_bella` | `bella123` | Bella Safitri | `2021002` | `bella.safitri@mhs.kampus.ac.id` |
| **Mahasiswa** | `mhs_citra` | `citra123` | Citra Lestari | `2021003` | `citra.lestari@mhs.kampus.ac.id` |

---

## 💻 Fitur Aplikasi Berdasarkan Role

1. **Mahasiswa:**
   - Masuk portal dengan akun atau payload SQLi.
   - **Kartu Hasil Studi (Nilai):** Melihat nilai mata kuliah, SKS, nama dosen, nilai angka, dan nilai huruf.
   - **Unggah Tugas (Mock Dummy):** Memilih mata kuliah, mengisi judul tugas, memilih berkas, dan melihat daftar riwayat tugas terkirim.
   - **Forum Diskusi Kampus:** Membaca pengumuman dari dosen dan memposting pertanyaan atau topik diskusi baru.

2. **Dosen:**
   - Masuk portal.
   - **Kelola Nilai Mahasiswa:** Melihat rekap nilai semua mahasiswa, memberi nilai baru, atau mengedit nilai yang sudah ada (dengan konversi nilai angka ke huruf otomatis).

3. **Admin:**
   - Masuk portal.
   - **Manajemen Akun:** Melihat seluruh akun yang tersimpan di basis data beserta password plaintext-nya (temuan audit keamanan).
   - **Reset Database:** Menjalankan ulang inisialisasi tabel dan seed data.

---

## 🚀 Panduan Menjalankan Secara Lokal (Offline / Laptop)

Aplikasi memiliki fitur *dual database support*:
- Jika variabel `POSTGRES_URL` **tidak diatur**, aplikasi secara otomatis menggunakan database **SQLite lokal (`portal.db`)** tanpa memerlukan instalasi database server tambahan!

1. **Clone atau Buka Direktori Proyek:**
   ```bash
   cd Tugasss_deploy
   ```

2. **Jalankan Aplikasi:**
   ```bash
   npm run dev
   ```

3. Buka browser di [http://localhost:3000](http://localhost:3000).
   Database SQLite lokal (`portal.db`) akan otomatis dibuat dan diisi data seed saat pertama kali dijalankan.

---

## ☁️ Panduan Langkah demi Langkah Deploy ke Vercel

### Langkah 1: Push Kode ke Repositori GitHub
1. Inisialisasi Git dan commit file (pastikan `.gitignore` sudah ada):
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit portal kampus ctf"
   ```
2. Buat repositori baru di akun GitHub Anda (misal: `portal-kampus-ctf`).
3. Hubungkan remote dan push:
   ```bash
   git remote add origin https://github.com/<username-github>/portal-kampus-ctf.git
   git branch -M main
   git push -u origin main
   ```

### Langkah 2: Buat Project di Vercel
1. Masuk ke [https://vercel.com](https://vercel.com) dan login.
2. Klik tombol **"Add New..."** ➡️ **"Project"**.
3. Pilih repositori GitHub `portal-kampus-ctf` yang baru saja diunggah, lalu klik **"Import"**.
4. Biarkan konfigurasi Framework Preset sebagai **Next.js**.

### Langkah 3: Tambahkan Database Vercel Postgres / Neon
1. Di halaman konfigurasi project sebelum deploy (atau setelah project dibuat):
   - Masuk ke tab **"Storage"** di Dashboard Vercel project Anda.
   - Klik **"Create Database"** ➡️ Pilih **"Postgres"** (didukung oleh Neon).
   - Beri nama database (misal: `portal-db`), pilih region terdekat (misal: `Singapore - sin1`), lalu klik **"Create"**.
2. Hubungkan database tersebut ke project Anda (*Connect to Project*).
   > Vercel akan secara otomatis mengisi environment variable: `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_USER`, `POSTGRES_HOST`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`.

### Langkah 4: Deploy & Inisialisasi Database
1. Klik tombol **"Deploy"** di Vercel dan tunggu proses build selesai (sekitar 1 menit).
2. Setelah website live (misal: `https://portal-kampus-ctf.vercel.app`), lakukan inisialisasi tabel dan seed data awal dengan salah satu cara berikut:
   - **Cara Mudah (Via Browser):**
     Buka URL: `https://portal-kampus-ctf.vercel.app/api/init-db` atau klik tombol **"🔄 Inisialisasi Ulang / Reset Database"** yang ada di halaman depan.
   - **Cara Alternatif (Via Vercel Storage Query Console):**
     Buka dashboard Vercel ➡️ Tab **Storage** ➡️ Database Anda ➡️ Tab **Query Editor**, lalu salin isi file [`scripts/schema.sql`](file:///scripts/schema.sql) dan klik **Run Query**.

---

## 🧪 Skenario Pengujian Simulasi Audit (Proof of Concept)

### 1. Pengujian SQL Injection
1. Buka halaman `/login`.
2. Masukkan input:
   - **Username:** `admin' --`
   - **Password:** `123456`
3. Amati bagian **"Query SQL yang Terbentuk di Backend"**:
   ```sql
   SELECT * FROM users WHERE username = 'admin' --' AND password = '...'
   ```
   Karakter `--` membuat PostgreSQL mengabaikan sisa query setelah username. Akibatnya, sistem langsung memverifikasi akun `admin` dan meloloskan akses ke `/dashboard/admin` tanpa mengetahui password aslinya.

### 2. Pengujian Brute Force (Tanpa Rate Limiting)
1. Buka terminal atau tool pengujian API (cURL / Postman / Burp Suite).
2. Kirim 20 request POST login gagal secara beruntun:
   ```bash
   for i in {1..20}; do
     curl -s -X POST https://<domain-vercel>/api/auth/login \
       -H "Content-Type: application/json" \
       -d '{"username":"admin","password":"wrongpassword"}' | jq .
   done
   ```
3. Amati hasilnya:
   - Semua 20 request menghasilkan HTTP `401 Unauthorized`.
   - **Tidak ada respons HTTP 429 (Too Many Requests)**.
   - Akun admin **tidak terkunci**, membuktikan form rentan terhadap serangan otomatisasi brute force kamus.
