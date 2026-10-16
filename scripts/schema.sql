-- ==============================================================
-- SCHEMA & SEED DATA PORTAL KAMPUS FIKTIF (LATIHAN CTF & AUDIT)
-- Kompatibel dengan Vercel Postgres / Neon / PostgreSQL
-- ==============================================================

-- 1. Buat Tabel Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL, -- 'admin', 'dosen', 'mahasiswa'
  nim_nip VARCHAR(50),
  email VARCHAR(100)
);

-- 2. Buat Tabel Nilai (Grades)
CREATE TABLE IF NOT EXISTS grades (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL,
  course_code VARCHAR(20) NOT NULL,
  course_name VARCHAR(100) NOT NULL,
  sks INT NOT NULL,
  dosen_name VARCHAR(100) NOT NULL,
  score NUMERIC(5, 2) NOT NULL,
  grade_letter VARCHAR(2) NOT NULL
);

-- 3. Buat Tabel Pengumpulan Tugas (Assignments - Mock)
CREATE TABLE IF NOT EXISTS assignments (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL,
  course_name VARCHAR(100) NOT NULL,
  title VARCHAR(200) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Buat Tabel Diskusi Kampus (Discussions)
CREATE TABLE IF NOT EXISTS discussions (
  id SERIAL PRIMARY KEY,
  author_name VARCHAR(100) NOT NULL,
  author_role VARCHAR(20) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================
-- SEED DATA (DATA AWAL)
-- ==============================================================

-- Akun Pengguna Fiktif
INSERT INTO users (username, password, name, role, nim_nip, email) VALUES
('admin', 'admin123', 'Administrator Portal Kampus', 'admin', 'ADMIN001', 'admin@kampus.ac.id'),
('dosen_budi', 'dosen123', 'Dr. Budi Santoso, M.Kom.', 'dosen', '198001152005011002', 'budi.santoso@kampus.ac.id'),
('dosen_siti', 'siti2024', 'Dr. Siti Rahma, M.T.', 'dosen', '198506202010122001', 'siti.rahma@kampus.ac.id'),
('mhs_adi', 'adi123', 'Adi Nugroho', 'mahasiswa', '2021001', 'adi.nugroho@mhs.kampus.ac.id'),
('mhs_bella', 'bella123', 'Bella Safitri', 'mahasiswa', '2021002', 'bella.safitri@mhs.kampus.ac.id'),
('mhs_citra', 'citra123', 'Citra Lestari', 'mahasiswa', '2021003', 'citra.lestari@mhs.kampus.ac.id')
ON CONFLICT (username) DO NOTHING;

-- Data Nilai Mahasiswa
INSERT INTO grades (student_id, course_code, course_name, sks, dosen_name, score, grade_letter) VALUES
(4, 'IF301', 'Keamanan Sistem Informasi', 3, 'Dr. Budi Santoso, M.Kom.', 88.50, 'A'),
(4, 'IF302', 'Rekayasa Perangkat Lunak', 3, 'Dr. Siti Rahma, M.T.', 76.00, 'B'),
(4, 'IF303', 'Basis Data Lanjut', 3, 'Dr. Budi Santoso, M.Kom.', 82.00, 'A-'),
(5, 'IF301', 'Keamanan Sistem Informasi', 3, 'Dr. Budi Santoso, M.Kom.', 91.00, 'A'),
(5, 'IF302', 'Rekayasa Perangkat Lunak', 3, 'Dr. Siti Rahma, M.T.', 84.50, 'A-'),
(6, 'IF301', 'Keamanan Sistem Informasi', 3, 'Dr. Budi Santoso, M.Kom.', 72.00, 'B-'),
(6, 'IF303', 'Basis Data Lanjut', 3, 'Dr. Budi Santoso, M.Kom.', 80.00, 'B+');

-- Data Tugas Awal
INSERT INTO assignments (student_id, course_name, title, file_name) VALUES
(4, 'Keamanan Sistem Informasi', 'Tugas 1: Analisis Kerentanan SQL Injection', 'tugas1_adi_sqli.pdf'),
(5, 'Keamanan Sistem Informasi', 'Tugas 1: Pengujian Brute Force & Rate Limit', 'tugas1_bella_bruteforce.pdf');

-- Data Diskusi Kampus Awal
INSERT INTO discussions (author_name, author_role, title, content) VALUES
('Dr. Budi Santoso, M.Kom.', 'dosen', 'Pengumuman Jadwal Ujian Praktikum CTF', 'Halo rekan mahasiswa, pekan depan kita akan mengadakan ujian praktikum simulasi audit keamanan web. Pelajari teknik SQL injection dan pengujian brute force.'),
('Adi Nugroho', 'mahasiswa', 'Format Laporan Tugas 2 Lab Keamanan', 'Izin bertanya Pak, apakah laporan tugas 2 perlu melampirkan file log pengujian atau cukup screenshot saja?'),
('Dr. Siti Rahma, M.T.', 'dosen', 'Tips Pengamanan Web Application', 'Selain melakukan audit, pahami juga konsep parameterized queries (prepared statements) dan rate limiter untuk mitigasi kerentanan ini.');
