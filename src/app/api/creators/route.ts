import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id) {
    const creator = db.getCreatorById(id);
    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
    }
    const works = db.getItems({ creatorId: id, visibilityStatus: 'published', eligibilityStatus: 'eligible' });
    return NextResponse.json({ creator, works });
  }

  const creators = db.getCreators();
  return NextResponse.json({ creators });
}
