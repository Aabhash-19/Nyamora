import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { findUserById, getUserBookmarks } from '@/lib/user-store';

export async function GET(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get('nyamora_session')?.value;
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = cookieToken || bearerToken;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const session = verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = await findUserById(session.userId);
    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const bookmarks = await getUserBookmarks(user.id);

    return NextResponse.json({
      user,
      bookmarks
    });
  } catch (err: any) {
    console.error('Auth verification error:', err);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  // Logout endpoint: clear session cookie
  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  response.cookies.delete('nyamora_session');
  return response;
}
