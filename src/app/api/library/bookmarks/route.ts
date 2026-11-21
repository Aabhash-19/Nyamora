import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const bookmarks = db.getBookmarks();
  const bookmarkedItems = bookmarks.map(b => {
    const item = db.getItemById(b.itemId);
    return { ...b, item };
  }).filter(b => b.item !== undefined);

  return NextResponse.json({ bookmarks: bookmarkedItems });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const itemId = body.itemId;

    if (!itemId) {
      return NextResponse.json({ error: 'itemId required' }, { status: 400 });
    }

    const isBookmarked = db.toggleBookmark(itemId, body.listName || 'Favorites');
    return NextResponse.json({ isBookmarked, itemId });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update bookmark' }, { status: 500 });
  }
}
