import { NextResponse } from 'next/server';

const BASE_URL = process.env.NHENTAI_API_BASE_URL || 'https://nhentai.net/api/v2';
const DEFAULT_HEADERS = {
  'User-Agent': 'Nyamora/1.1 (https://github.com/nyamora/discovery; contact@nyamora.local)',
  'Accept': 'application/json'
};

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${BASE_URL}/cdn`, {
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
    console.error('nHentai CDN API error:', error);
    return NextResponse.json({
      image_servers: ['https://i1.nhentai.net', 'https://i2.nhentai.net', 'https://i3.nhentai.net', 'https://i4.nhentai.net'],
      thumb_servers: ['https://t1.nhentai.net', 'https://t2.nhentai.net', 'https://t3.nhentai.net', 'https://t4.nhentai.net']
    });
  }
}
