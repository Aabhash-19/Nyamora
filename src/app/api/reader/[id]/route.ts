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
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    let assets = await sourceManager.getPages(id);
    if (!assets || assets.length === 0) {
      assets = db.getReaderAssets(id);
    }

    const readingProgress = db.getReadingProgress(id);

    return NextResponse.json({
      item,
      pages: assets,
      totalPages: assets.length || item.pageCount,
      readingProgress
    });
  } catch (error: any) {
    console.error('Reader API error:', error);
    return NextResponse.json({ error: 'Reader service error' }, { status: 500 });
  }
}
