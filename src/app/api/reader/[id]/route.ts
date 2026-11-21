import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = db.getItemById(id);

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Rights Gate: Integrated reader is ONLY accessible if availabilityMode is 'integrated_licensed'
    // and asset rights have 'approved' status.
    const rights = db.getAssetRights(id);
    if (item.availabilityMode !== 'integrated_licensed' || rights?.reviewStatus !== 'approved') {
      return NextResponse.json({
        error: 'Integrated reader restricted. This entry is not licensed for integrated hosting.',
        availabilityMode: item.availabilityMode,
        rightsStatus: rights?.reviewStatus || 'unverified',
        externalSource: db.getReaderSource(id)
      }, { status: 403 });
    }

    const assets = db.getReaderAssets(id);
    const readingProgress = db.getReadingProgress(id);

    return NextResponse.json({
      item,
      pages: assets,
      totalPages: assets.length,
      readingProgress
    });
  } catch (error: any) {
    console.error('Reader API error:', error);
    return NextResponse.json({ error: 'Reader service error' }, { status: 500 });
  }
}
