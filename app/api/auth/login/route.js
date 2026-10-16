import { NextResponse } from 'next/server';
const { executeQuery, initDb } = require('@/lib/db');

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    // Pastikan database terinisialisasi
    await initDb();

    const body = await request.json();
    const { username = '', password = '' } = body;

    // =========================================================================
    // PERINGATAN KEAMANAN: KODE DI BAWAH INI SENGAJA DIBUAT RENTAN UNTUK SIMULASI AUDIT / CTF!
    // 
    // 1. KERENTANAN SQL INJECTION:
    //    Menggabungkan string user input (username & password) langsung ke query SQL 
    //    tanpa sanitasi, escape, atau parameterized query (prepared statement).
    //
    // 2. KERENTANAN UNRESTRICTED PASSWORD ATTEMPTS (BRUTE FORCE):
    //    Tidak ada rate limiting (misal max 5 request/menit), tidak ada CAPTCHA,
    //    dan tidak ada account lockout mechanism.
    // =========================================================================
    const rawSql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

    console.log('[AUDIT LOG - LOGIN QUERY EXECUTED]:', rawSql);

    // Eksekusi raw query langsung
    const users = await executeQuery(rawSql);

    if (users && users.length > 0) {
      // Login berhasil (mengambil record user pertama yang cocok)
      const user = users[0];
      
      const userPayload = {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        nim_nip: user.nim_nip,
        email: user.email
      };

      const response = NextResponse.json({
        success: true,
        message: `Selamat datang, ${user.name}!`,
        user: userPayload,
        executed_query: rawSql
      });

      // Simpan session cookie sederhana
      response.cookies.set('portal_session', JSON.stringify(userPayload), {
        httpOnly: false, // sengaja agar mudah diakses di client-side demo
        path: '/',
        maxAge: 60 * 60 * 24 // 1 hari
      });

      return response;
    } else {
      // Login gagal
      return NextResponse.json({
        success: false,
        message: 'Username atau password tidak cocok!',
        executed_query: rawSql
      }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Kesalahan saat memproses query SQL: ' + error.message,
      error_detail: error.message
    }, { status: 500 });
  }
}
