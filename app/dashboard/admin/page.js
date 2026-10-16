'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success) {
        setUsersList(data.users);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    async function init() {
      const sessionRes = await fetch('/api/auth/me');
      const sessionData = await sessionRes.json();
      
      let currentUser = sessionData.user;
      if (!currentUser) {
        const stored = localStorage.getItem('portal_user');
        if (stored) currentUser = JSON.parse(stored);
      }

      if (!currentUser) {
        router.push('/login');
        return;
      }

      setUser(currentUser);
      await fetchUsers();
      setLoading(false);
    }

    init();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('portal_user');
    router.push('/login');
  };

  const handleResetDatabase = async () => {
    if (!confirm('Apakah Anda yakin ingin menginisialisasi ulang database dan seed akun awal?')) {
      return;
    }
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/init-db');
      const data = await res.json();
      if (data.success) {
        setStatusMsg({ type: 'success', text: '✅ ' + data.message });
        await fetchUsers();
      } else {
        setStatusMsg({ type: 'danger', text: 'Gagal inisialisasi: ' + data.error });
      }
    } catch (err) {
      setStatusMsg({ type: 'danger', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container"><p>Memuat portal admin...</p></div>;
  }

  const countRole = (role) => usersList.filter(u => u.role === role).length;

  return (
    <div className="container">
      {/* Header Info Admin */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '4px solid #db2777' }}>
        <div>
          <span className="badge badge-admin">PORTAL ADMINISTRATOR UTAMA</span>
          <h1 style={{ fontSize: '1.5rem', marginTop: '0.4rem', color: '#0f172a' }}>{user.name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Username: <code>{user.username}</code> | NIP/Kode: <strong>{user.nim_nip || '-'}</strong> | Email: {user.email || '-'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleResetDatabase} className="btn btn-outline btn-sm">
            🔄 Reset Seed DB
          </button>
          <button onClick={handleLogout} className="btn btn-danger btn-sm">
            Keluar (Logout)
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className={`alert alert-${statusMsg.type}`}>
          {statusMsg.text}
        </div>
      )}

      {/* Ringkasan Statistik */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ margin: 0, textAlign: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Pengguna</span>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b' }}>{usersList.length}</div>
        </div>
        <div className="card" style={{ margin: 0, textAlign: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Akun Admin</span>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#be185d' }}>{countRole('admin')}</div>
        </div>
        <div className="card" style={{ margin: 0, textAlign: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Akun Dosen</span>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#4338ca' }}>{countRole('dosen')}</div>
        </div>
        <div className="card" style={{ margin: 0, textAlign: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Akun Mahasiswa</span>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#15803d' }}>{countRole('mahasiswa')}</div>
        </div>
      </div>

      {/* Tabel Daftar Seluruh Akun */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">👥 Daftar Seluruh Akun Pengguna (Users Database)</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              Data akun sintetis untuk keperluan simulasi audit keamanan sistem informasi.
            </p>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Total: {usersList.length} akun
          </span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Role</th>
                <th>Username</th>
                <th>Password (Plaintext)</th>
                <th>Nama Lengkap</th>
                <th>NIM / NIP</th>
                <th>Alamat Email</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((u) => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td>
                    <span className={`badge badge-${u.role}`}>
                      {u.role}
                    </span>
                  </td>
                  <td><code>{u.username}</code></td>
                  <td><code style={{ background: '#fee2e2', color: '#991b1b' }}>{u.password}</code></td>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.nim_nip || '-'}</td>
                  <td>{u.email || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="alert alert-warning" style={{ marginTop: '1.25rem' }}>
          ⚠️ <strong>Catatan Temuan Audit Keamanan:</strong> Penyimpanan password dalam bentuk <em>plaintext</em> (teks biasa) tanpa algoritma hashing seperti <code>bcrypt</code> atau <code>argon2</code> merupakan kerentanan fatal kedua setelah SQL Injection yang ditemukan pada basis data ini.
        </div>
      </div>
    </div>
  );
}
