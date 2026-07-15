import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

const ALLOWED_HOSTS = [
  'drive.google.com',
  'drive.usercontent.google.com',
  'lh3.googleusercontent.com',
];

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 });
    }

    // Build the direct download URL for Google Drive links
    let fetchUrl = url;
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    const driveIdMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    const fileId = (driveMatch && driveMatch[1]) || (driveIdMatch && driveIdMatch[1]);
    if (fileId) {
      fetchUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`;
    }

    // Strict allowlist — block SSRF
    try {
      const parsed = new URL(fetchUrl);
      if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
        return NextResponse.json({ error: 'URL not allowed' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Fetch the actual file bytes
    const response = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch media from source' }, { status: 502 });
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const buffer = await response.arrayBuffer();

    if (buffer.byteLength === 0) {
      return NextResponse.json({ error: 'Fetched file is empty' }, { status: 502 });
    }

    // Determine extension from content-type
    let ext = 'jpg';
    if (contentType.includes('png')) ext = 'png';
    else if (contentType.includes('gif')) ext = 'gif';
    else if (contentType.includes('webp')) ext = 'webp';
    else if (contentType.includes('mp4')) ext = 'mp4';
    else if (contentType.includes('quicktime') || contentType.includes('mov')) ext = 'mov';
    else if (contentType.includes('webm')) ext = 'webm';

    const fileName = `csv-uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(fileName, buffer, { contentType, upsert: false });

    if (uploadError) {
      console.error('mirror-media upload error:', uploadError.message);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    const { data: publicData } = supabase.storage.from('media').getPublicUrl(uploadData.path);

    return NextResponse.json({ publicUrl: publicData.publicUrl, contentType });
  } catch (err: any) {
    console.error('mirror-media error:', err.message);
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }
}
