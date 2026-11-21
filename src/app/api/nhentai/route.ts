import { NextResponse } from 'next/server';
import { sourceManager } from '@/lib/sources/source-manager';

export async function GET() {
  const nhSource = sourceManager.getSource('nhentai-api');
  const health = nhSource ? await nhSource.healthCheck() : { status: 'offline', message: 'Source not loaded' };

  return NextResponse.json({
    name: 'Nyamora nHentai API Connector',
    version: '2.0.0',
    status: health.status,
    message: health.message,
    endpoints: {
      galleries: '/api/nhentai/galleries?page=1&per_page=25',
      galleryDetail: '/api/nhentai/galleries/:id',
      search: '/api/nhentai/search?query=fate&page=1&per_page=25&sort=popular',
      random: '/api/nhentai/random',
      cdn: '/api/nhentai/cdn',
      imageProxy: '/api/nhentai/image?url=...'
    },
    upstream: process.env.NHENTAI_API_BASE_URL || 'https://nhentai.net/api/v2'
  });
}
