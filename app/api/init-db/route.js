import { NextResponse } from 'next/server';
const { initDb, isPostgres } = require('@/lib/db');

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initDb();
    return NextResponse.json({
      success: true,
      message: 'Database berhasil diinisialisasi dan di-seed.',
      database_type: isPostgres() ? 'Vercel Postgres / Neon (PostgreSQL)' : 'Local SQLite'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
