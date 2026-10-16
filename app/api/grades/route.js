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
      query = `SELECT g.*, u.name as student_name, u.nim_nip as student_nim 
               FROM grades g 
               JOIN users u ON g.student_id = u.id 
               WHERE g.student_id = ${studentId} 
               ORDER BY g.id ASC`;
    } else {
      query = `SELECT g.*, u.name as student_name, u.nim_nip as student_nim 
               FROM grades g 
               JOIN users u ON g.student_id = u.id 
               ORDER BY g.id ASC`;
    }

    const rows = await executeQuery(query);
    return NextResponse.json({ success: true, grades: rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await initDb();
    const body = await request.json();
    const { id, student_id, course_code, course_name, sks, dosen_name, score, grade_letter } = body;

    if (!student_id || !course_name || score === undefined || !grade_letter) {
      return NextResponse.json({ success: false, message: 'Data tidak lengkap' }, { status: 400 });
    }

    if (id) {
      // Update existing grade
      const updateQuery = `UPDATE grades 
                           SET course_code = '${course_code}', course_name = '${course_name}', 
                               sks = ${sks || 3}, dosen_name = '${dosen_name}', 
                               score = ${score}, grade_letter = '${grade_letter}' 
                           WHERE id = ${id}`;
      await executeQuery(updateQuery);
      return NextResponse.json({ success: true, message: 'Nilai mahasiswa berhasil diperbarui!' });
    } else {
      // Insert new grade
      const insertQuery = `INSERT INTO grades (student_id, course_code, course_name, sks, dosen_name, score, grade_letter) 
                           VALUES (${student_id}, '${course_code}', '${course_name}', ${sks || 3}, '${dosen_name}', ${score}, '${grade_letter}')`;
      await executeQuery(insertQuery);
      return NextResponse.json({ success: true, message: 'Nilai baru berhasil ditambahkan!' });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
