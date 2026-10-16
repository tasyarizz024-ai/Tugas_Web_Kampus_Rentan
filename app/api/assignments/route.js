import { NextResponse } from 'next/server';
const { executeQuery, initDb } = require('@/lib/db');

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await initDb();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');

    let query;
    if (studentId) {
      query = `SELECT a.*, u.name as student_name 
               FROM assignments a 
               JOIN users u ON a.student_id = u.id 
               WHERE a.student_id = ${studentId} 
               ORDER BY a.id DESC`;
    } else {
      query = `SELECT a.*, u.name as student_name 
               FROM assignments a 
               JOIN users u ON a.student_id = u.id 
               ORDER BY a.id DESC`;
    }

    const rows = await executeQuery(query);
    return NextResponse.json({ success: true, assignments: rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await initDb();
    const body = await request.json();
    const { student_id, course_name, title, file_name } = body;

    if (!student_id || !course_name || !title || !file_name) {
      return NextResponse.json({ success: false, message: 'Harap isi semua data formulir tugas!' }, { status: 400 });
    }

    const insertQuery = `INSERT INTO assignments (student_id, course_name, title, file_name) 
                         VALUES (${student_id}, '${course_name}', '${title}', '${file_name}')`;
    await executeQuery(insertQuery);

    return NextResponse.json({ success: true, message: 'Tugas berhasil diunggah (Mock Simulasi)!' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
