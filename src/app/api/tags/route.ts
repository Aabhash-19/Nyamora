import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id) {
    const tag = db.getTagById(id);
    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }
    const works = db.getItems({ tagIds: [id], visibilityStatus: 'published', eligibilityStatus: 'eligible' });
    return NextResponse.json({ tag, works, count: works.length });
  }

  const tags = db.getTags();
  return NextResponse.json({ tags });
}
