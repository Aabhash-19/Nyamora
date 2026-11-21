import { NextRequest, NextResponse } from 'next/server';
import { sourceManager } from '@/lib/sources/source-manager';

export async function GET() {
  const sources = sourceManager.getAllSources();
  const activeSource = sourceManager.getActiveSource();

  // Run health check on sources
  const healthChecks = await Promise.all(
    sources.map(async s => {
      const src = sourceManager.getSource(s.id);
      const health = src ? await src.healthCheck() : { status: 'offline', message: 'Not found' };
      return { id: s.id, health };
    })
  );

  return NextResponse.json({
    sources,
    activeSourceId: activeSource.id,
    health: Object.fromEntries(healthChecks.map(h => [h.id, h.health]))
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sourceId } = body;

    if (!sourceId) {
      return NextResponse.json({ error: 'sourceId required' }, { status: 400 });
    }

    const success = sourceManager.setActiveSource(sourceId);
    if (!success) {
      return NextResponse.json({ error: 'Unknown sourceId' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      activeSourceId: sourceId
    });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to update source' }, { status: 500 });
  }
}
