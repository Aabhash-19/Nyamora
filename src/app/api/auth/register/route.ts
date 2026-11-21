import { NextRequest, NextResponse } from 'next/server';
import { createUser, findUserByUsernameOrEmail } from '@/lib/user-store';
import { createSessionToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password, birthday } = body;

    if (!username || !email || !password || !birthday) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // Verify 18+ age strictly
    const today = new Date();
    const birth = new Date(birthday);
    if (isNaN(birth.getTime())) {
      return NextResponse.json({ error: 'Invalid birthday format.' }, { status: 400 });
    }
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    if (age < 18) {
      return NextResponse.json({ error: `Entry Denied: Must be 18+ to register (age: ${age}).` }, { status: 403 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    // Check if username or email is already taken
    const existing = await findUserByUsernameOrEmail(username);
    if (existing) {
      return NextResponse.json({ error: 'Username is already taken.' }, { status: 409 });
    }
    const existingEmail = await findUserByUsernameOrEmail(email);
    if (existingEmail) {
      return NextResponse.json({ error: 'Email is already registered.' }, { status: 409 });
    }

    const newUser = await createUser({
      username,
      email,
      password,
      birthday,
      age
    });

    const token = createSessionToken({
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email,
      is18Plus: true
    });

    const response = NextResponse.json({
      success: true,
      user: newUser,
      token
    });

    // Set HTTP-only secure cookie for seamless cross-device auth
    response.cookies.set('nyamora_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/'
    });

    return response;
  } catch (err: any) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
