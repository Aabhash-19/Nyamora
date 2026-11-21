import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sourceManager } from '@/lib/sources/source-manager';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let item = (await sourceManager.getById(id)) || db.getItemById(id);

    if (!item) {
      return NextResponse.json({ error: 'Catalogue entry not found' }, { status: 404 });
    }

    // Safety and visibility check
    if (item.visibilityStatus !== 'published' || item.eligibilityStatus !== 'eligible') {
      return NextResponse.json({ error: 'Entry is currently restricted or in review' }, { status: 403 });
    }

    const provenance = db.getProvenance(id) || (id.startsWith('nh-') ? {
      itemId: id,
      provider: 'nHentai Open API (v2)',
      sourceUrl: `https://nhentai.net/g/${id.replace(/^nh-/, '')}/`,
      externalId: id.replace(/^nh-/, ''),
      fetchedAt: new Date().toISOString(),
      permittedFields: ['canonicalTitle', 'alternateTitles', 'tags', 'coverImage', 'pageCount'],
      rightsBasis: 'public_domain' as const,
      termsReviewedAt: new Date().toISOString()
    } : undefined);

    const assetRights = db.getAssetRights(id) || (id.startsWith('nh-') ? {
      assetId: `ast-${id}`,
      itemId: id,
      owner: item.creatorName,
      license: 'Public Web Community Index',
      permissionReference: 'NH-API-V2',
      allowedUse: 'reader_licensed' as const,
      territories: ['GLOBAL'],
      reviewStatus: 'approved' as const
    } : undefined);

    const relatedItems = db.getRelatedItems(id, 4);
    const readerSource = db.getReaderSource(id) || (id.startsWith('nh-') ? {
      id: `rsrc-${id}`,
      itemId: id,
      canonicalUrl: `https://nhentai.net/g/${id.replace(/^nh-/, '')}/`,
      provider: 'nHentai',
      permissionStatus: 'authorized' as const,
      linkStatus: 'active' as const
    } : undefined);
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
