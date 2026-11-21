import { NextResponse } from 'next/server';

const BASE_URL = process.env.NHENTAI_API_BASE_URL || 'https://nhentai.net/api/v2';
const DEFAULT_HEADERS = {
  'User-Agent': 'Nyamora/1.1 (https://github.com/nyamora/discovery; contact@nyamora.local)',
  'Accept': 'application/json'
};

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const randomRes = await fetch(`${BASE_URL}/galleries/random`, {
      signal: controller.signal,
      headers: DEFAULT_HEADERS
    });
    clearTimeout(timeoutId);

    if (!randomRes.ok) {
      return NextResponse.json(
        { error: `nHentai upstream returned status ${randomRes.status}` },
        { status: randomRes.status }
      );
    }

    const randomData = await randomRes.json();
    const galleryId = randomData.id;

    if (!galleryId) {
      return NextResponse.json(randomData);
    }

    // Fetch full gallery details
    const detailRes = await fetch(`${BASE_URL}/galleries/${galleryId}`, {
      headers: DEFAULT_HEADERS
    });

    if (detailRes.ok) {
      const fullDetail = await detailRes.json();
      return NextResponse.json(fullDetail);
    }

    return NextResponse.json(randomData);
  } catch (error: any) {
    console.error('nHentai random API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch random gallery from nHentai', details: error?.message },
      { status: 502 }
    );
  }
}
