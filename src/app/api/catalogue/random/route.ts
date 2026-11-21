import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sourceManager } from '@/lib/sources/source-manager';

export async function GET() {
  const item = (await sourceManager.getRandom()) || db.getRandomItem();
  if (!item) {
    return NextResponse.json({ error: 'No items available' }, { status: 404 });
  }
  return NextResponse.json({ id: item.id, item });
}
