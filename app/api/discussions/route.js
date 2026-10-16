import { NextResponse } from 'next/server';
const { executeQuery, initDb } = require('@/lib/db');

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await initDb();
    const rows = await executeQuery('SELECT * FROM discussions ORDER BY id DESC');
    return NextResponse.json({ success: true, discussions: rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await initDb();
    const body = await request.json();
    const { author_name, author_role, title, content } = body;

    if (!author_name || !title || !content) {
      return NextResponse.json({ success: false, message: 'Harap isi judul dan konten diskusi!' }, { status: 400 });
    }

    const cleanTitle = title.replace(/'/g, "''");
    const cleanContent = content.replace(/'/g, "''");

    const insertQuery = `INSERT INTO discussions (author_name, author_role, title, content) 
                         VALUES ('${author_name}', '${author_role || 'mahasiswa'}', '${cleanTitle}', '${cleanContent}')`;
    await executeQuery(insertQuery);

    return NextResponse.json({ success: true, message: 'Topik diskusi berhasil dikirim!' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
