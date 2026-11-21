import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken } from '@/lib/auth';
import { getUserBookmarks, toggleUserBookmark } from '@/lib/user-store';
import { sourceManager } from '@/lib/sources/source-manager';

function getSessionUser(req: NextRequest) {
  const cookie = req.cookies.get('nyamora_session')?.value;
  const authHeader = req.headers.get('authorization');
  const token = cookie || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null);
  return token ? verifySessionToken(token) : null;
}

export async function GET(req: NextRequest) {
  const user = getSessionUser(req);

  if (user) {
    const itemIds = await getUserBookmarks(user.userId);
    const bookmarkedItems = await Promise.all(
      itemIds.map(async (itemId) => {
        const item = await sourceManager.getById(itemId);
        return {
          itemId,
          listName: 'Favorites',
          createdAt: new Date().toISOString(),
          item: item || undefined
        };
      })
    );
    return NextResponse.json({ bookmarks: bookmarkedItems.filter(b => b.item !== undefined) });
  }

  // Guest / fallback mode
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

    const user = getSessionUser(req);
    let isBookmarked: boolean;

    if (user) {
      isBookmarked = await toggleUserBookmark(user.userId, itemId);
    } else {
      isBookmarked = db.toggleBookmark(itemId, body.listName || 'Favorites');
    }

    return NextResponse.json({ isBookmarked, itemId });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update bookmark' }, { status: 500 });
  }
}
