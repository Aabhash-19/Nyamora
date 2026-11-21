import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json({ error: 'url query parameter is required' }, { status: 400 });
    }

    const parsed = new URL(imageUrl);
    const host = parsed.hostname.toLowerCase();
    const isAllowed = host === 'nhentai.net' || host.endsWith('.nhentai.net');

    if (!isAllowed) {
      return NextResponse.json({ error: 'Domain not permitted for proxying' }, { status: 403 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const upstreamRes = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://nhentai.net/'
      }
    });
    clearTimeout(timeoutId);

    if (!upstreamRes.ok) {
      return NextResponse.json({ error: `Upstream error ${upstreamRes.status}` }, { status: upstreamRes.status });
    }

    const contentType = upstreamRes.headers.get('content-type') || 'image/webp';
    const buffer = await upstreamRes.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error: any) {
    console.error('Image proxy error:', error);
    return NextResponse.json({ error: 'Image proxy failed', details: error?.message }, { status: 502 });
  }
}
