import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { connectors } from '@/connectors/providers';

export async function GET() {
  const items = db.getItems({ visibilityStatus: undefined as any });
  const assetRights = db.getAllAssetRights();
  const auditEvents = db.getAuditEvents();

  // Run connector health checks
  const healthChecks = {
    catalogue: await connectors.catalogue.healthCheck(),
    community: await connectors.community.healthCheck(),
    chat: await connectors.chat.healthCheck(),
    embedding: await connectors.embedding.healthCheck(),
    readerSource: await connectors.readerSource.healthCheck()
  };

  const metrics = {
    totalItems: items.length,
    publishedCount: items.filter(i => i.visibilityStatus === 'published').length,
    quarantinedCount: items.filter(i => i.visibilityStatus === 'quarantined').length,
    licensedReaderCount: items.filter(i => i.availabilityMode === 'integrated_licensed').length,
    externalAuthorizedCount: items.filter(i => i.availabilityMode === 'external_authorized').length,
    metadataOnlyCount: items.filter(i => i.availabilityMode === 'metadata_only').length,
  };

  return NextResponse.json({
    metrics,
    healthChecks,
    items,
    assetRights,
    auditEvents
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, itemId, assetId, status, reason } = body;

    if (action === 'update_visibility' && itemId && status) {
      const ok = db.updateItemStatus(itemId, status, 'admin-portal', reason || 'Operator administration review');
      return NextResponse.json({ success: ok, itemId, status });
    }

    if (action === 'update_rights' && assetId && status) {
      const ok = db.updateAssetRights(assetId, status, 'admin-portal');
      return NextResponse.json({ success: ok, assetId, status });
    }

    if (action === 'takedown' && itemId) {
      // Immediate quarantine + disable reader
      const ok = db.updateItemStatus(itemId, 'taken_down', 'admin-portal', reason || 'Copyright/moderation takedown request');
      return NextResponse.json({ success: ok, itemId, status: 'taken_down' });
    }

    return NextResponse.json({ error: 'Unrecognized admin action' }, { status: 400 });
  } catch (error: any) {
    console.error('Admin POST error:', error);
    return NextResponse.json({ error: 'Failed to execute admin operation' }, { status: 500 });
  }
}
