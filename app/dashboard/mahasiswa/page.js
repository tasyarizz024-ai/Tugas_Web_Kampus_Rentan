'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MahasiswaDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('nilai');
  const [grades, setGrades] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [taskCourse, setTaskCourse] = useState('Keamanan Sistem Informasi');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskFile, setTaskFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);

  // Discussion form
  const [discTitle, setDiscTitle] = useState('');
  const [discContent, setDiscContent] = useState('');
  const [discStatus, setDiscStatus] = useState(null);

  useEffect(() => {
    async function loadData() {
      // Periksa auth sesi
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

      try {
        // Ambil data nilai
        const gRes = await fetch(`/api/grades?student_id=${currentUser.id}`);
        const gData = await gRes.json();
        if (gData.success) setGrades(gData.grades);

        // Ambil data tugas
        const aRes = await fetch(`/api/assignments?student_id=${currentUser.id}`);
        const aData = await aRes.json();
        if (aData.success) setAssignments(aData.assignments);

        // Ambil data diskusi
        const dRes = await fetch('/api/discussions');
        const dData = await dRes.json();
        if (dData.success) setDiscussions(dData.discussions);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('portal_user');
    router.push('/login');
  };

  const handleUploadAssignment = async (e) => {
    e.preventDefault();
    if (!taskTitle) return;

    const fakeFileName = taskFile ? taskFile.name : `laporan_${taskTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`;
    
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user.id,
          course_name: taskCourse,
          title: taskTitle,
          file_name: fakeFileName
        })
      });
      const data = await res.json();
      if (data.success) {
        setUploadStatus({ type: 'success', text: '✅ ' + data.message });
        setTaskTitle('');
        setTaskFile(null);
        // Refresh tugas
        const aRes = await fetch(`/api/assignments?student_id=${user.id}`);
        const aData = await aRes.json();
        if (aData.success) setAssignments(aData.assignments);
      } else {
        setUploadStatus({ type: 'danger', text: 'Gagal: ' + data.message });
      }
    } catch (err) {
      setUploadStatus({ type: 'danger', text: err.message });
    }
  };

  const handlePostDiscussion = async (e) => {
    e.preventDefault();
    if (!discTitle || !discContent) return;

    try {
      const res = await fetch('/api/discussions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_name: user.name,
          author_role: 'mahasiswa',
          title: discTitle,
          content: discContent
        })
      });
      const data = await res.json();
      if (data.success) {
        setDiscStatus({ type: 'success', text: '✅ Topik diskusi berhasil dipublikasikan!' });
        setDiscTitle('');
        setDiscContent('');
        // Refresh diskusi
        const dRes = await fetch('/api/discussions');
        const dData = await dRes.json();
        if (dData.success) setDiscussions(dData.discussions);
      }
    } catch (err) {
      setDiscStatus({ type: 'danger', text: err.message });
    }
  };

  if (loading) {
    return <div className="container"><p>Memuat portal mahasiswa...</p></div>;
  }

  return (
    <div className="container">
      {/* Header Info Mahasiswa */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-mahasiswa">PORTAL MAHASISWA</span>
          <h1 style={{ fontSize: '1.5rem', marginTop: '0.4rem', color: '#0f172a' }}>{user.name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            NIM: <strong>{user.nim_nip || '-'}</strong> | Email: {user.email || '-'}
          </p>
        </div>
        <div>
          <button onClick={handleLogout} className="btn btn-outline btn-sm">Keluar (Logout)</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'nilai' ? 'active' : ''}`}
          onClick={() => setActiveTab('nilai')}
        >
          📊 Kartu Hasil Studi (Nilai)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'tugas' ? 'active' : ''}`}
          onClick={() => setActiveTab('tugas')}
        >
          📤 Pengumpulan Tugas (Mock)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'diskusi' ? 'active' : ''}`}
          onClick={() => setActiveTab('diskusi')}
        >
          💬 Forum Diskusi Kampus
        </button>
      </div>

      {/* TAB 1: NILAI */}
      {activeTab === 'nilai' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Daftar Nilai Akademik Mahasiswa</h2>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Semester Ganjil 2026/2027</span>
          </div>

          {grades.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Belum ada data nilai yang diinputkan oleh dosen.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Kode MK</th>
                    <th>Nama Mata Kuliah</th>
                    <th>SKS</th>
                    <th>Dosen Pengampu</th>
                    <th>Nilai Angka</th>
                    <th>Nilai Huruf</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map((g) => (
                    <tr key={g.id}>
                      <td><code>{g.course_code}</code></td>
                      <td><strong>{g.course_name}</strong></td>
                      <td>{g.sks}</td>
                      <td>{g.dosen_name}</td>
                      <td>{parseFloat(g.score).toFixed(2)}</td>
                      <td>
                        <strong style={{ 
                          color: g.grade_letter.startsWith('A') ? '#16a34a' : g.grade_letter.startsWith('B') ? '#2563eb' : '#dc2626' 
                        }}>
                          {g.grade_letter}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TUGAS MOCK */}
      {activeTab === 'tugas' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Form Unggah Tugas Mahasiswa (Mock Dummy)</h2>
            </div>

            {uploadStatus && (
              <div className={`alert alert-${uploadStatus.type}`}>
                {uploadStatus.text}
              </div>
            )}

            <form onSubmit={handleUploadAssignment}>
              <div className="form-group">
                <label className="form-label">Mata Kuliah</label>
                <select 
                  className="form-control"
                  value={taskCourse}
                  onChange={(e) => setTaskCourse(e.target.value)}
                >
                  <option value="Keamanan Sistem Informasi">Keamanan Sistem Informasi</option>
                  <option value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak</option>
                  <option value="Basis Data Lanjut">Basis Data Lanjut</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Judul / Keterangan Tugas</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Contoh: Tugas 2 - Analisis Kelemahan SQL Injection"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Pilih Berkas Tugas (Dummy File Picker)</label>
                <input 
                  type="file" 
                  className="form-control"
                  onChange={(e) => setTaskFile(e.target.files[0])}
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block', marginTop: '0.3rem' }}>
                  *Simulasi pengunggahan tugas untuk tugas praktikum. File tidak disimpan ke disk server nyata.
                </small>
              </div>

              <button type="submit" className="btn btn-primary">
                Kirim / Unggah Tugas
              </button>
            </form>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ fontSize: '1.1rem' }}>Riwayat Tugas yang Telah Dikirim</h3>
            </div>
            {assignments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>Belum ada tugas yang dikirim.</p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Mata Kuliah</th>
                      <th>Judul Tugas</th>
                      <th>Nama Berkas</th>
                      <th>Waktu Unggah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignments.map((a) => (
                      <tr key={a.id}>
                        <td>#{a.id}</td>
                        <td>{a.course_name}</td>
                        <td><strong>{a.title}</strong></td>
                        <td><code>📄 {a.file_name}</code></td>
                        <td>{new Date(a.submitted_at || Date.now()).toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DISKUSI */}
      {activeTab === 'diskusi' && (
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Kirim Pertanyaan / Diskusi Baru</h2>
            </div>
            {discStatus && (
              <div className={`alert alert-${discStatus.type}`}>{discStatus.text}</div>
            )}
            <form onSubmit={handlePostDiscussion}>
              <div className="form-group">
                <label className="form-label">Judul Topik Diskusi</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Contoh: Diskusi materi prepared statement"
                  value={discTitle}
                  onChange={(e) => setDiscTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Isi Pesan / Pertanyaan</label>
                <textarea 
                  className="form-control" 
                  rows={3} 
                  placeholder="Tuliskan pesan diskusi Anda..."
                  value={discContent}
                  onChange={(e) => setDiscContent(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">Kirim Diskusi</button>
            </form>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ fontSize: '1.1rem' }}>Forum Diskusi Kelas & Akademik</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {discussions.map((d) => (
                <div key={d.id} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '1rem', background: '#fdfdfe' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>{d.title}</span>
                    <span className={`badge ${d.author_role === 'dosen' ? 'badge-dosen' : 'badge-mahasiswa'}`}>
                      {d.author_role}
                    </span>
                  </div>
                  <p style={{ color: '#334155', fontSize: '0.95rem', marginBottom: '0.5rem' }}>{d.content}</p>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Oleh: <strong>{d.author_name}</strong> • {new Date(d.created_at || Date.now()).toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
