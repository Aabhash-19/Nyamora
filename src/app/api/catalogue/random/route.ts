import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const item = db.getRandomItem();
  if (!item) {
    return NextResponse.json({ error: 'No items available' }, { status: 404 });
  }
  return NextResponse.json({ id: item.id, item });
}
