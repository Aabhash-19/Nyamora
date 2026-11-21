import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken } from '@/lib/auth';
import { getUserReadingProgress, saveUserReadingProgress } from '@/lib/user-store';

function getSessionUser(req: NextRequest) {
  const cookie = req.cookies.get('nyamora_session')?.value;
  const authHeader = req.headers.get('authorization');
  const token = cookie || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null);
  return token ? verifySessionToken(token) : null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get('itemId');

  if (!itemId) {
    return NextResponse.json({ error: 'itemId required' }, { status: 400 });
  }

  const user = getSessionUser(req);
  if (user) {
    const progress = await getUserReadingProgress(user.userId, itemId);
    return NextResponse.json({ progress });
  }

  const progress = db.getReadingProgress(itemId);
  return NextResponse.json({ progress: progress || null });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { itemId, pageIndex, totalPages } = body;

    if (!itemId || typeof pageIndex !== 'number' || typeof totalPages !== 'number') {
      return NextResponse.json({ error: 'Missing required progress parameters' }, { status: 400 });
    }

    const user = getSessionUser(req);
    let progress: any;

    if (user) {
      progress = await saveUserReadingProgress(user.userId, itemId, pageIndex, totalPages);
    } else {
      progress = db.saveReadingProgress(itemId, pageIndex, totalPages);
    }

    return NextResponse.json({ progress });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to record progress' }, { status: 500 });
  }
}

export async function DELETE() {
  db.clearUserData();
  return NextResponse.json({ success: true, message: 'Private user library data purged.' });
}
