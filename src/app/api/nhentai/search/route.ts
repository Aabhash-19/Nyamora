import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NHENTAI_API_BASE_URL || 'https://nhentai.net/api/v2';
const DEFAULT_HEADERS = {
  'User-Agent': 'Nyamora/1.1 (https://github.com/nyamora/discovery; contact@nyamora.local)',
  'Accept': 'application/json'
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = Math.min(parseInt(searchParams.get('per_page') || '25', 10), 50);
    const sort = searchParams.get('sort') || '';

    if (!query.trim()) {
      // Fallback to galleries list when no query provided
      const targetUrl = new URL(`${BASE_URL}/galleries`);
      targetUrl.searchParams.set('page', String(page));
      targetUrl.searchParams.set('per_page', String(perPage));

      const res = await fetch(targetUrl.toString(), { headers: DEFAULT_HEADERS });
      const data = await res.json();
      return NextResponse.json(data);
    }

    const targetUrl = new URL(`${BASE_URL}/search`);
    targetUrl.searchParams.set('query', query.trim());
    targetUrl.searchParams.set('page', String(page));
    targetUrl.searchParams.set('per_page', String(perPage));
    if (sort) targetUrl.searchParams.set('sort', sort);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(targetUrl.toString(), {
      signal: controller.signal,
      headers: DEFAULT_HEADERS
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json(
        { error: `nHentai upstream returned status ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('nHentai search API error:', error);
    return NextResponse.json(
      { error: 'Failed to execute search on nHentai', details: error?.message },
      { status: 502 }
    );
  }
}
