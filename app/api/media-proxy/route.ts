import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

/**
 * GET /api/media-proxy?url=<encoded_url>
 * Fetches a remote file (e.g. Google Drive) and streams it back.
 * This lets Instagram/Facebook crawlers download media via our own domain.
 *
 * Security: requires auth + strict URL allowlist to prevent SSRF.
 */
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ALLOWED_HOSTS = [
  'drive.google.com',
  'drive.usercontent.google.com',
  'lh3.googleusercontent.com',
];

export async function GET(req: NextRequest) {
  // Auth check
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

  // Strict allowlist — block SSRF
  try {
    const parsed = new URL(targetUrl);
    if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
      return NextResponse.json({ error: 'URL not allowed' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Upstream error` }, { status: 502 });
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
  } catch {
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}
