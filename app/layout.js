import './globals.css';

export const metadata = {
  title: 'Portal Akademik Fiktif - Latihan Audit Keamanan Sistem Informasi',
  description: 'Aplikasi portal kampus fiktif khusus untuk simulasi audit keamanan (SQL Injection & Brute Force)',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <nav className="navbar">
          <div className="nav-brand">
            <span>🏛️ Portal Akademik Kampus</span>
            <span className="badge-ctf">SIMULASI AUDIT KEAMANAN</span>
          </div>
          <div className="nav-links">
            <a href="/" className="btn btn-outline btn-sm">Beranda</a>
            <a href="/login" className="btn btn-primary btn-sm">Halaman Login</a>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="footer">
          <p>
            ⚠️ <strong>Pemberitahuan Khusus:</strong> Aplikasi web portal kampus ini dibuat semata-mata untuk tujuan edukasi, latihan audit keamanan sistem informasi (CTF), dan pengujian kerentanan. 
            Semua data akun dan nilai bersifat fiktif dan sintetis.
          </p>
        </footer>
      </body>
    </html>
  );
}
