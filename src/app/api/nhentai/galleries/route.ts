import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NHENTAI_API_BASE_URL || 'https://nhentai.net/api/v2';
const DEFAULT_HEADERS = {
  'User-Agent': 'Nyamora/1.1 (https://github.com/nyamora/discovery; contact@nyamora.local)',
  'Accept': 'application/json'
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = Math.min(parseInt(searchParams.get('per_page') || '25', 10), 50);

    const targetUrl = new URL(`${BASE_URL}/galleries`);
    targetUrl.searchParams.set('page', String(page));
    targetUrl.searchParams.set('per_page', String(perPage));

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
    console.error('nHentai galleries API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch galleries from nHentai', details: error?.message },
      { status: 502 }
    );
  }
}
