'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DosenDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState(null);

  // Form input/edit nilai
  const [editingGradeId, setEditingGradeId] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState('4');
  const [courseCode, setCourseCode] = useState('IF301');
  const [courseName, setCourseName] = useState('Keamanan Sistem Informasi');
  const [sks, setSks] = useState(3);
  const [score, setScore] = useState(85);
  const [gradeLetter, setGradeLetter] = useState('A');

  const fetchData = async () => {
    try {
      const gRes = await fetch('/api/grades');
      const gData = await gRes.json();
      if (gData.success) setGrades(gData.grades);

      const uRes = await fetch('/api/users');
      const uData = await uRes.json();
      if (uData.success) {
        setStudents(uData.users.filter(u => u.role === 'mahasiswa'));
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
      await fetchData();
      setLoading(false);
    }

    init();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem('portal_user');
    router.push('/login');
  };

  const handleEditClick = (g) => {
    setEditingGradeId(g.id);
    setSelectedStudentId(g.student_id);
    setCourseCode(g.course_code);
    setCourseName(g.course_name);
    setSks(g.sks);
    setScore(g.score);
    setGradeLetter(g.grade_letter);
    setStatusMsg({ type: 'info', text: `Sedang mengedit nilai ID #${g.id} untuk ${g.student_name}.` });
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingGradeId(null);
    setScore(85);
    setGradeLetter('A');
    setStatusMsg(null);
  };

  const handleSubmitGrade = async (e) => {
    e.preventDefault();
    setStatusMsg(null);

    try {
      const payload = {
        id: editingGradeId,
        student_id: parseInt(selectedStudentId, 10),
        course_code: courseCode,
        course_name: courseName,
        sks: parseInt(sks, 10),
        dosen_name: user.name,
        score: parseFloat(score),
        grade_letter: gradeLetter
      };

      const res = await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setStatusMsg({ type: 'success', text: '✅ ' + data.message });
        setEditingGradeId(null);
        await fetchData();
      } else {
        setStatusMsg({ type: 'danger', text: 'Gagal: ' + data.message });
      }
    } catch (err) {
      setStatusMsg({ type: 'danger', text: err.message });
    }
  };

  // Helper konversi skor ke huruf
  const handleScoreChange = (val) => {
    const num = parseFloat(val);
    setScore(val);
    if (!isNaN(num)) {
      if (num >= 85) setGradeLetter('A');
      else if (num >= 80) setGradeLetter('A-');
      else if (num >= 75) setGradeLetter('B+');
      else if (num >= 70) setGradeLetter('B');
      else if (num >= 65) setGradeLetter('B-');
      else if (num >= 60) setGradeLetter('C');
      else setGradeLetter('D');
    }
  };

  if (loading) {
    return <div className="container"><p>Memuat portal dosen...</p></div>;
  }

  return (
    <div className="container">
      {/* Header Info Dosen */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="badge badge-dosen">PORTAL DOSEN PENGAMPU</span>
          <h1 style={{ fontSize: '1.5rem', marginTop: '0.4rem', color: '#0f172a' }}>{user.name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            NIP: <strong>{user.nim_nip || '-'}</strong> | Email: {user.email || '-'}
          </p>
        </div>
        <div>
          <button onClick={handleLogout} className="btn btn-outline btn-sm">Keluar (Logout)</button>
        </div>
      </div>

      {statusMsg && (
        <div className={`alert alert-${statusMsg.type}`}>
          {statusMsg.text}
        </div>
      )}

      {/* Form Input / Edit Nilai */}
      <div className="card" style={{ borderLeft: '4px solid var(--accent)' }}>
        <div className="card-header">
          <h2 className="card-title">
            {editingGradeId ? `✏️ Ubah Nilai Mahasiswa (ID #${editingGradeId})` : '➕ Beri Nilai Baru Mahasiswa'}
          </h2>
          {editingGradeId && (
            <button onClick={handleCancelEdit} className="btn btn-outline btn-sm">
              Batal Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmitGrade}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Pilih Mahasiswa</label>
              <select 
                className="form-control"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                disabled={Boolean(editingGradeId)}
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.nim_nip || s.username})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Mata Kuliah</label>
              <select 
                className="form-control"
                value={courseName}
                onChange={(e) => {
                  setCourseName(e.target.value);
                  if (e.target.value === 'Keamanan Sistem Informasi') setCourseCode('IF301');
                  else if (e.target.value === 'Rekayasa Perangkat Lunak') setCourseCode('IF302');
                  else setCourseCode('IF303');
                }}
              >
                <option value="Keamanan Sistem Informasi">Keamanan Sistem Informasi (IF301)</option>
                <option value="Rekayasa Perangkat Lunak">Rekayasa Perangkat Lunak (IF302)</option>
                <option value="Basis Data Lanjut">Basis Data Lanjut (IF303)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">SKS</label>
              <input 
                type="number" 
                className="form-control" 
                value={sks}
                onChange={(e) => setSks(e.target.value)}
                min="1" 
                max="6"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nilai Angka (0-100)</label>
              <input 
                type="number" 
                step="0.1" 
                className="form-control" 
                value={score}
                onChange={(e) => handleScoreChange(e.target.value)}
                min="0" 
                max="100"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nilai Huruf</label>
              <input 
                type="text" 
                className="form-control" 
                value={gradeLetter}
                onChange={(e) => setGradeLetter(e.target.value.toUpperCase())}
                maxLength="2"
                required
              />
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn btn-primary">
              {editingGradeId ? 'Simpan Perubahan Nilai' : 'Simpan Nilai Baru'}
            </button>
            {editingGradeId && (
              <button type="button" onClick={handleCancelEdit} className="btn btn-outline">
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tabel Seluruh Nilai Mahasiswa */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📋 Rekap Nilai Seluruh Mahasiswa</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total: {grades.length} entri nilai</span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama Mahasiswa</th>
                <th>NIM</th>
                <th>Mata Kuliah</th>
                <th>SKS</th>
                <th>Nilai Angka</th>
                <th>Nilai Huruf</th>
                <th>Dosen Penilai</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => (
                <tr key={g.id}>
                  <td>#{g.id}</td>
                  <td><strong>{g.student_name}</strong></td>
                  <td><code>{g.student_nim}</code></td>
                  <td>{g.course_name} ({g.course_code})</td>
                  <td>{g.sks}</td>
                  <td>{parseFloat(g.score).toFixed(2)}</td>
                  <td>
                    <strong style={{ 
                      color: g.grade_letter.startsWith('A') ? '#16a34a' : g.grade_letter.startsWith('B') ? '#2563eb' : '#dc2626' 
                    }}>
                      {g.grade_letter}
                    </strong>
                  </td>
                  <td>{g.dosen_name}</td>
                  <td>
                    <button onClick={() => handleEditClick(g)} className="btn btn-outline btn-sm">
                      ✏️ Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
