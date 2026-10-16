import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const sessionCookie = request.cookies.get('portal_session');
  if (!sessionCookie || !sessionCookie.value) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  try {
    const user = JSON.parse(sessionCookie.value);
    return NextResponse.json({ authenticated: true, user });
  } catch (e) {
    return NextResponse.json({ authenticated: false, user: null });
  }
}
