'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [executedQuery, setExecutedQuery] = useState(null);
  const [attemptCount, setAttemptCount] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setExecutedQuery(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      setAttemptCount((prev) => prev + 1);

      if (data.executed_query) {
        setExecutedQuery(data.executed_query);
      }

      if (res.ok && data.success) {
        setMessage({ type: 'success', text: `Login Berhasil! Mengalihkan ke dashboard ${data.user.role}...` });
        
        // Simpan sesi ke localStorage untuk kemudahan akses client-side
        localStorage.setItem('portal_user', JSON.stringify(data.user));

        setTimeout(() => {
          if (data.user.role === 'admin') {
            router.push('/dashboard/admin');
          } else if (data.user.role === 'dosen') {
            router.push('/dashboard/dosen');
          } else {
            router.push('/dashboard/mahasiswa');
          }
        }, 1200);
      } else {
        setMessage({ type: 'danger', text: data.message || 'Login gagal!' });
      }
    } catch (err) {
      setMessage({ type: 'danger', text: 'Terjadi error jaringan: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="container" style={{ maxWidth: '640px' }}>
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header" style={{ textAlign: 'center', display: 'block' }}>
          <h2 className="card-title" style={{ fontSize: '1.5rem' }}>🔐 Masuk Portal Akademik</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Form login ini sengaja memiliki celah <strong>SQL Injection</strong> & <strong>Tanpa Rate Limiting</strong>
          </p>
        </div>

        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username atau NIM / NIP</label>
            <input
              id="username"
              type="text"
              className="form-control"
              placeholder="Contoh: admin atau mhs_adi atau payload SQLi"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Kata Sandi (Password)</label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="Masukkan password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Percobaan ke: <strong>{attemptCount}</strong> (Tanpa batas lockout)
            </span>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ minWidth: '130px' }}>
              {loading ? 'Memeriksa...' : 'Masuk (Login)'}
            </button>
          </div>
        </form>

        {/* Live Query Inspector untuk kemudahan analisis audit / CTF */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
            🔍 Query SQL yang Terbentuk di Backend:
          </span>
          <div className="code-box">
            {executedQuery 
              ? executedQuery 
              : `SELECT * FROM users WHERE username = '${username || '<username>'}' AND password = '${password || '<password>'}'`}
          </div>
          <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.4rem', fontSize: '0.8rem' }}>
            *String input langsung disambungkan ke dalam query SQL tanpa sanitasi atau tanda tanya (parameterized).
          </small>
        </div>

        {/* Shortcut Quick Test Payload */}
        <div style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
            ⚡ Uji Coba Cepat (Klik untuk Mengisi Input):
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              onClick={() => handleQuickFill("admin' --", "sembarang")} 
              className="btn btn-outline btn-sm"
            >
              💉 SQLi Bypass: <code>admin&#39; --</code>
            </button>
            <button 
              type="button" 
              onClick={() => handleQuickFill("' OR '1'='1' --", "apapun")} 
              className="btn btn-outline btn-sm"
            >
              💉 SQLi Bypass: <code>&#39; OR &#39;1&#39;=&#39;1&#39; --</code>
            </button>
            <button 
              type="button" 
              onClick={() => handleQuickFill("admin", "admin123")} 
              className="btn btn-outline btn-sm"
            >
              Normal: Admin
            </button>
            <button 
              type="button" 
              onClick={() => handleQuickFill("dosen_budi", "dosen123")} 
              className="btn btn-outline btn-sm"
            >
              Normal: Dosen Budi
            </button>
            <button 
              type="button" 
              onClick={() => handleQuickFill("mhs_adi", "adi123")} 
              className="btn btn-outline btn-sm"
            >
              Normal: Mhs Adi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
