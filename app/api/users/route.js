import { NextResponse } from 'next/server';
const { executeQuery, initDb } = require('@/lib/db');

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initDb();
    // Khusus admin untuk melihat seluruh data akun pengguna (termasuk password untuk keperluan simulasi audit)
    const users = await executeQuery('SELECT id, username, password, name, role, nim_nip, email FROM users ORDER BY id ASC');
    return NextResponse.json({ success: true, users });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
