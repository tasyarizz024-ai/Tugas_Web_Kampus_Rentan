const path = require('path');

let pgPool = null;
let sqliteDb = null;

function isPostgres() {
  return Boolean(process.env.POSTGRES_URL || process.env.DATABASE_URL);
}

function getPostgresPool() {
  if (!pgPool) {
    const { Pool } = require('pg');
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    pgPool = new Pool({
      connectionString,
      ssl: connectionString && connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
    });
  }
  return pgPool;
}

function getSqliteDb() {
  if (!sqliteDb) {
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.join(process.cwd(), 'portal.db');
    sqliteDb = new sqlite3.Database(dbPath);
  }
  return sqliteDb;
}

/**
 * Menjalankan raw query SQL tanpa sanitasi (sengaja rentan untuk keperluan simulasi CTF)
 */
async function executeQuery(queryText) {
  if (isPostgres()) {
    const pool = getPostgresPool();
    const client = await pool.connect();
    try {
      const res = await client.query(queryText);
      return res.rows || [];
    } finally {
      client.release();
    }
  } else {
    const db = getSqliteDb();
    return new Promise((resolve, reject) => {
      const trimmed = queryText.trim().toUpperCase();
      if (trimmed.startsWith('SELECT') || trimmed.startsWith('PRAGMA')) {
        db.all(queryText, [], (err, rows) => {
          if (err) return reject(err);
          resolve(rows || []);
        });
      } else {
        db.run(queryText, [], function (err) {
          if (err) return reject(err);
          resolve({ lastID: this.lastID, changes: this.changes });
        });
      }
    });
  }
}

/**
 * Inisialisasi tabel dan seed data
 */
async function initDb() {
  const postgresMode = isPostgres();
  
  if (postgresMode) {
    const pool = getPostgresPool();
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password VARCHAR(100) NOT NULL,
          name VARCHAR(100) NOT NULL,
          role VARCHAR(20) NOT NULL,
          nim_nip VARCHAR(50),
          email VARCHAR(100)
        );

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

        CREATE TABLE IF NOT EXISTS assignments (
          id SERIAL PRIMARY KEY,
          student_id INT NOT NULL,
          course_name VARCHAR(100) NOT NULL,
          title VARCHAR(200) NOT NULL,
          file_name VARCHAR(255) NOT NULL,
          submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS discussions (
          id SERIAL PRIMARY KEY,
          author_name VARCHAR(100) NOT NULL,
          author_role VARCHAR(20) NOT NULL,
          title VARCHAR(200) NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const checkUsers = await client.query('SELECT COUNT(*) as count FROM users');
      if (parseInt(checkUsers.rows[0].count, 10) === 0) {
        await client.query(`
          INSERT INTO users (username, password, name, role, nim_nip, email) VALUES
          ('admin', 'admin123', 'Administrator Portal Kampus', 'admin', 'ADMIN001', 'admin@kampus.ac.id'),
          ('dosen_budi', 'dosen123', 'Dr. Budi Santoso, M.Kom.', 'dosen', '198001152005011002', 'budi.santoso@kampus.ac.id'),
          ('dosen_siti', 'siti2024', 'Dr. Siti Rahma, M.T.', 'dosen', '198506202010122001', 'siti.rahma@kampus.ac.id'),
          ('mhs_adi', 'adi123', 'Adi Nugroho', 'mahasiswa', '2021001', 'adi.nugroho@mhs.kampus.ac.id'),
          ('mhs_bella', 'bella123', 'Bella Safitri', 'mahasiswa', '2021002', 'bella.safitri@mhs.kampus.ac.id'),
          ('mhs_citra', 'citra123', 'Citra Lestari', 'mahasiswa', '2021003', 'citra.lestari@mhs.kampus.ac.id');
        `);

        await client.query(`
          INSERT INTO grades (student_id, course_code, course_name, sks, dosen_name, score, grade_letter) VALUES
          (4, 'IF301', 'Keamanan Sistem Informasi', 3, 'Dr. Budi Santoso, M.Kom.', 88.50, 'A'),
          (4, 'IF302', 'Rekayasa Perangkat Lunak', 3, 'Dr. Siti Rahma, M.T.', 76.00, 'B'),
          (4, 'IF303', 'Basis Data Lanjut', 3, 'Dr. Budi Santoso, M.Kom.', 82.00, 'A-'),
          (5, 'IF301', 'Keamanan Sistem Informasi', 3, 'Dr. Budi Santoso, M.Kom.', 91.00, 'A'),
          (5, 'IF302', 'Rekayasa Perangkat Lunak', 3, 'Dr. Siti Rahma, M.T.', 84.50, 'A-'),
          (6, 'IF301', 'Keamanan Sistem Informasi', 3, 'Dr. Budi Santoso, M.Kom.', 72.00, 'B-'),
          (6, 'IF303', 'Basis Data Lanjut', 3, 'Dr. Budi Santoso, M.Kom.', 80.00, 'B+');
        `);

        await client.query(`
          INSERT INTO assignments (student_id, course_name, title, file_name) VALUES
          (4, 'Keamanan Sistem Informasi', 'Tugas 1: Analisis Kerentanan SQL Injection', 'tugas1_adi_sqli.pdf'),
          (5, 'Keamanan Sistem Informasi', 'Tugas 1: Pengujian Brute Force & Rate Limit', 'tugas1_bella_bruteforce.pdf');
        `);

        await client.query(`
          INSERT INTO discussions (author_name, author_role, title, content) VALUES
          ('Dr. Budi Santoso, M.Kom.', 'dosen', 'Pengumuman Jadwal Ujian Praktikum CTF', 'Halo rekan mahasiswa, pekan depan kita akan mengadakan ujian praktikum simulasi audit keamanan web. Pelajari teknik SQL injection dan pengujian brute force.'),
          ('Adi Nugroho', 'mahasiswa', 'Format Laporan Tugas 2 Lab Keamanan', 'Izin bertanya Pak, apakah laporan tugas 2 perlu melampirkan file log pengujian atau cukup screenshot saja?'),
          ('Dr. Siti Rahma, M.T.', 'dosen', 'Tips Pengamanan Web Application', 'Selain melakukan audit, pahami juga konsep parameterized queries (prepared statements) dan rate limiter untuk mitigasi kerentanan ini.');
        `);
      }
    } finally {
      client.release();
    }
  } else {
    // SQLite Mode
    const db = getSqliteDb();
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            nim_nip TEXT,
            email TEXT
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS grades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            course_code TEXT NOT NULL,
            course_name TEXT NOT NULL,
            sks INTEGER NOT NULL,
            dosen_name TEXT NOT NULL,
            score REAL NOT NULL,
            grade_letter TEXT NOT NULL
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS assignments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            course_name TEXT NOT NULL,
            title TEXT NOT NULL,
            file_name TEXT NOT NULL,
            submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS discussions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author_name TEXT NOT NULL,
            author_role TEXT NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
          if (err) return reject(err);
          if (row.count === 0) {
            const stmtUser = db.prepare('INSERT INTO users (username, password, name, role, nim_nip, email) VALUES (?, ?, ?, ?, ?, ?)');
            stmtUser.run('admin', 'admin123', 'Administrator Portal Kampus', 'admin', 'ADMIN001', 'admin@kampus.ac.id');
            stmtUser.run('dosen_budi', 'dosen123', 'Dr. Budi Santoso, M.Kom.', 'dosen', '198001152005011002', 'budi.santoso@kampus.ac.id');
            stmtUser.run('dosen_siti', 'siti2024', 'Dr. Siti Rahma, M.T.', 'dosen', '198506202010122001', 'siti.rahma@kampus.ac.id');
            stmtUser.run('mhs_adi', 'adi123', 'Adi Nugroho', 'mahasiswa', '2021001', 'adi.nugroho@mhs.kampus.ac.id');
            stmtUser.run('mhs_bella', 'bella123', 'Bella Safitri', 'mahasiswa', '2021002', 'bella.safitri@mhs.kampus.ac.id');
            stmtUser.run('mhs_citra', 'citra123', 'Citra Lestari', 'mahasiswa', '2021003', 'citra.lestari@mhs.kampus.ac.id');
            stmtUser.finalize();

            const stmtGrade = db.prepare('INSERT INTO grades (student_id, course_code, course_name, sks, dosen_name, score, grade_letter) VALUES (?, ?, ?, ?, ?, ?, ?)');
            stmtGrade.run(4, 'IF301', 'Keamanan Sistem Informasi', 3, 'Dr. Budi Santoso, M.Kom.', 88.50, 'A');
            stmtGrade.run(4, 'IF302', 'Rekayasa Perangkat Lunak', 3, 'Dr. Siti Rahma, M.T.', 76.00, 'B');
            stmtGrade.run(4, 'IF303', 'Basis Data Lanjut', 3, 'Dr. Budi Santoso, M.Kom.', 82.00, 'A-');
            stmtGrade.run(5, 'IF301', 'Keamanan Sistem Informasi', 3, 'Dr. Budi Santoso, M.Kom.', 91.00, 'A');
            stmtGrade.run(5, 'IF302', 'Rekayasa Perangkat Lunak', 3, 'Dr. Siti Rahma, M.T.', 84.50, 'A-');
            stmtGrade.run(6, 'IF301', 'Keamanan Sistem Informasi', 3, 'Dr. Budi Santoso, M.Kom.', 72.00, 'B-');
            stmtGrade.run(6, 'IF303', 'Basis Data Lanjut', 3, 'Dr. Budi Santoso, M.Kom.', 80.00, 'B+');
            stmtGrade.finalize();

            const stmtAssign = db.prepare('INSERT INTO assignments (student_id, course_name, title, file_name) VALUES (?, ?, ?, ?)');
            stmtAssign.run(4, 'Keamanan Sistem Informasi', 'Tugas 1: Analisis Kerentanan SQL Injection', 'tugas1_adi_sqli.pdf');
            stmtAssign.run(5, 'Keamanan Sistem Informasi', 'Tugas 1: Pengujian Brute Force & Rate Limit', 'tugas1_bella_bruteforce.pdf');
            stmtAssign.finalize();

            const stmtDisc = db.prepare('INSERT INTO discussions (author_name, author_role, title, content) VALUES (?, ?, ?, ?)');
            stmtDisc.run('Dr. Budi Santoso, M.Kom.', 'dosen', 'Pengumuman Jadwal Ujian Praktikum CTF', 'Halo rekan mahasiswa, pekan depan kita akan mengadakan ujian praktikum simulasi audit keamanan web. Pelajari teknik SQL injection dan pengujian brute force.');
            stmtDisc.run('Adi Nugroho', 'mahasiswa', 'Format Laporan Tugas 2 Lab Keamanan', 'Izin bertanya Pak, apakah laporan tugas 2 perlu melampirkan file log pengujian atau cukup screenshot saja?');
            stmtDisc.run('Dr. Siti Rahma, M.T.', 'dosen', 'Tips Pengamanan Web Application', 'Selain melakukan audit, pahami juga konsep parameterized queries (prepared statements) dan rate limiter untuk mitigasi kerentanan ini.');
            stmtDisc.finalize(() => resolve(true));
          } else {
            resolve(true);
          }
        });
      });
    });
  }
}

module.exports = {
  isPostgres,
  executeQuery,
  initDb
};
