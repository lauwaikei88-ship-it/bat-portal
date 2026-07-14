import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/media-proxy?url=<encoded_url>
 * Fetches a remote file (e.g. Google Drive) and streams it back.
 * This lets Instagram/Facebook crawlers download media via our own domain.
 */
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get('url');
  if (!rawUrl) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
  }

  let targetUrl = rawUrl;

  // Convert Google Drive share links to direct download
  const driveMatch = rawUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    targetUrl = `https://drive.google.com/uc?export=download&id=${driveMatch[1]}&confirm=t`;
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        // Pretend to be a normal browser so Google Drive doesn't block us
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Upstream returned ${response.status}` }, { status: 502 });
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const body = await response.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
