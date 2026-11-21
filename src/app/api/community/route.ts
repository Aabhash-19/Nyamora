import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get('itemId') || undefined;

  const references = db.getCommunityReferences(itemId);
  return NextResponse.json({
    references,
    mode: 'outbound_curated',
    note: 'References link directly to Reddit. No Reddit threads or comments are mirrored on this platform.'
  });
}
