import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get('itemId');

  if (itemId) {
    const progress = db.getReadingProgress(itemId);
    return NextResponse.json({ progress: progress || null });
  }

  return NextResponse.json({ error: 'itemId required' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { itemId, pageIndex, totalPages } = body;

    if (!itemId || typeof pageIndex !== 'number' || typeof totalPages !== 'number') {
      return NextResponse.json({ error: 'Missing required progress parameters' }, { status: 400 });
    }

    const progress = db.saveReadingProgress(itemId, pageIndex, totalPages);
    return NextResponse.json({ progress });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to record progress' }, { status: 500 });
  }
}

export async function DELETE() {
  db.clearUserData();
  return NextResponse.json({ success: true, message: 'Private user library data purged.' });
}
