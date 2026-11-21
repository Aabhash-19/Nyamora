import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sourceManager } from '@/lib/sources/source-manager';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let item = db.getItemById(id);

    if (!item) {
      item = (await sourceManager.getById(id)) || undefined;
    }

    if (!item) {
      return NextResponse.json({ error: 'Catalogue entry not found' }, { status: 404 });
    }

    // Safety and visibility check
    if (item.visibilityStatus !== 'published' || item.eligibilityStatus !== 'eligible') {
      return NextResponse.json({ error: 'Entry is currently restricted or in review' }, { status: 403 });
    }

    const provenance = db.getProvenance(id);
    const assetRights = db.getAssetRights(id);
    const relatedItems = db.getRelatedItems(id, 4);
    const readerSource = db.getReaderSource(id);
    const communityReferences = db.getCommunityReferences(id);
    const isBookmarked = db.isBookmarked(id);
    const readingProgress = db.getReadingProgress(id);

    return NextResponse.json({
      item,
      provenance,
      assetRights,
      relatedItems,
      readerSource,
      communityReferences,
      userState: {
        isBookmarked,
        readingProgress
      }
    });
  } catch (error: any) {
    console.error('Item detail API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve item detail' }, { status: 500 });
  }
}
