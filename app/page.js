'use client';

import { useState } from 'react';

export default function HomePage() {
  const [initStatus, setInitStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInitDb = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/init-db');
      const data = await res.json();
      setInitStatus(data);
    } catch (e) {
      setInitStatus({ success: false, error: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ borderTop: '4px solid var(--primary)' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: '#1e293b' }}>
          Portal Akademik Terpadu (SIAKAD) Fiktif
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
          Aplikasi web simulasi khusus untuk tugas mata kuliah <strong>Keamanan Sistem Informasi</strong>. 
          Aplikasi ini sengaja dikonfigurasi dengan dua kerentanan utama untuk pengujian penetrasi dan audit keamanan (CTF).
        </p>

        <div className="alert alert-warning">
          <strong>🎯 Skenario Latihan Kerentanan:</strong>
          <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem', lineHeight: '1.6' }}>
            <li>
              <strong>1. SQL Injection pada Form Login:</strong> Sistem menggunakan query SQL mentah dengan penggabungan string (concatenation) tanpa prepared statement atau sanitasi. 
              Peserta audit dapat mencoba membypass otentikasi login menggunakan payload seperti <code>admin&#39; --</code> atau <code>&#39; OR &#39;1&#39;=&#39;1&#39; --</code>.
            </li>
            <li>
              <strong>2. Percobaan Sandi Tanpa Pembatasan (Unrestricted Login / Brute Force):</strong> Form login tidak memiliki pembatasan rate limit (429), CAPTCHA, maupun penguncian akun (lockout), sehingga rentan terhadap serangan brute force kamus (dictionary attack).
            </li>
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <a href="/login" className="btn btn-primary" style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}>
            🚀 Menuju Halaman Login Rentan
          </a>
          <button 
            onClick={handleInitDb} 
            disabled={loading}
            className="btn btn-outline"
            style={{ padding: '0.75rem 1.5rem' }}
          >
            {loading ? 'Memproses...' : '🔄 Inisialisasi Ulang / Reset Database'}
          </button>
        </div>

        {initStatus && (
          <div style={{ marginTop: '1rem' }}>
            {initStatus.success ? (
              <div className="alert alert-success">
                ✅ {initStatus.message} (Tipe Database: <strong>{initStatus.database_type}</strong>)
              </div>
            ) : (
              <div className="alert alert-danger">
                ❌ Gagal inisialisasi: {initStatus.error}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid-2">
        {/* Info Akun Sintetis */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📋 Daftar Akun Sintetis untuk Pengujian</h2>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Gunakan akun-akun di bawah untuk menguji alur login normal, atau uji coba serangan brute force terhadap password yang mudah ditebak:
          </p>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Username</th>
                  <th>Password</th>
                  <th>Nama / NIP / NIM</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="badge badge-admin">Admin</span></td>
                  <td><code>admin</code></td>
                  <td><code>admin123</code></td>
                  <td>Administrator Portal</td>
                </tr>
                <tr>
                  <td><span className="badge badge-dosen">Dosen</span></td>
                  <td><code>dosen_budi</code></td>
                  <td><code>dosen123</code></td>
                  <td>Dr. Budi Santoso, M.Kom.</td>
                </tr>
                <tr>
                  <td><span className="badge badge-dosen">Dosen</span></td>
                  <td><code>dosen_siti</code></td>
                  <td><code>siti2024</code></td>
                  <td>Dr. Siti Rahma, M.T.</td>
                </tr>
                <tr>
                  <td><span className="badge badge-mahasiswa">Mahasiswa</span></td>
                  <td><code>mhs_adi</code></td>
                  <td><code>adi123</code></td>
                  <td>Adi Nugroho (2021001)</td>
                </tr>
                <tr>
                  <td><span className="badge badge-mahasiswa">Mahasiswa</span></td>
                  <td><code>mhs_bella</code></td>
                  <td><code>bella123</code></td>
                  <td>Bella Safitri (2021002)</td>
                </tr>
                <tr>
                  <td><span className="badge badge-mahasiswa">Mahasiswa</span></td>
                  <td><code>mhs_citra</code></td>
                  <td><code>citra123</code></td>
                  <td>Citra Lestari (2021003)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Petunjuk Fitur Berdasarkan Role */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🎓 Fitur Berdasarkan Role Pengguna</h2>
          </div>
          <ul style={{ paddingLeft: '1.25rem', lineHeight: '1.8', color: '#334155' }}>
            <li>
              <strong>Mahasiswa:</strong> Masuk ke portal, melihat transkrip nilai akademik (KHS), melihat simulasi formulir pengumpulan tugas (upload dummy), dan melihat halaman forum diskusi kampus.
            </li>
            <li>
              <strong>Dosen:</strong> Masuk ke portal dan memiliki hak akses untuk memasukkan atau mengubah nilai mahasiswa.
            </li>
            <li>
              <strong>Admin:</strong> Masuk ke portal dan memiliki hak akses untuk melihat daftar seluruh akun pengguna yang terdaftar pada sistem basis data.
            </li>
          </ul>

          <div className="alert alert-info" style={{ marginTop: '1.25rem' }}>
            💡 <strong>Tips SQL Injection:</strong> Masukkan <code>admin&#39; --</code> pada kolom Username dan ketik sembarang password. Lihat bagaimana sistem memotong verifikasi password dan langsung meloloskan Anda sebagai Administrator!
          </div>
        </div>
      </div>
    </div>
  );
}
