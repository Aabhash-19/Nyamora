import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NHENTAI_API_BASE_URL || 'https://nhentai.net/api/v2';
const DEFAULT_HEADERS = {
  'User-Agent': 'Nyamora/1.1 (https://github.com/nyamora/discovery; contact@nyamora.local)',
  'Accept': 'application/json'
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = id.replace(/^nh-/, '');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${BASE_URL}/galleries/${cleanId}`, {
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
    console.error(`nHentai gallery ${params} API error:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery details from nHentai', details: error?.message },
      { status: 502 }
    );
  }
}
