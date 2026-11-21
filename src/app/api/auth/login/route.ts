import { NextRequest, NextResponse } from 'next/server';
import { findUserByUsernameOrEmail, getUserBookmarks } from '@/lib/user-store';
import { verifyPassword, createSessionToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { usernameOrEmail, password } = body;

    if (!usernameOrEmail || !password) {
      return NextResponse.json({ error: 'Username/email and password required.' }, { status: 400 });
    }

    const user = await findUserByUsernameOrEmail(usernameOrEmail);
    if (!user) {
      return NextResponse.json({ error: 'Invalid username/email or password.' }, { status: 401 });
    }

    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid username/email or password.' }, { status: 401 });
    }

    const token = createSessionToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      is18Plus: true
    });

    // Fetch user's synced bookmarks
    const bookmarks = await getUserBookmarks(user.id);

    const publicProfile = {
      id: user.id,
      username: user.username,
      email: user.email,
      birthday: user.birthday,
      age: user.age,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt
    };

    const response = NextResponse.json({
      success: true,
      user: publicProfile,
      bookmarks,
      token
    });

    response.cookies.set('nyamora_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    });

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
