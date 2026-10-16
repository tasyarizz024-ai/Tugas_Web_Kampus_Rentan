'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    async function checkRole() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        let user = data.user;
        if (!user) {
          const stored = localStorage.getItem('portal_user');
          if (stored) user = JSON.parse(stored);
        }

        if (!user) {
          router.push('/login');
          return;
        }

        if (user.role === 'admin') {
          router.push('/dashboard/admin');
        } else if (user.role === 'dosen') {
          router.push('/dashboard/dosen');
        } else {
          router.push('/dashboard/mahasiswa');
        }
      } catch (e) {
        router.push('/login');
      }
    }

    checkRole();
  }, [router]);

  return (
    <div className="container" style={{ textAlign: 'center', padding: '3rem 0' }}>
      <p>Mengalihkan ke dashboard sesuai peran akun...</p>
    </div>
  );
}
