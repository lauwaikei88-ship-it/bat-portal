import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * POST /api/mirror-media
 * Body: { url: string }
 * 
 * Fetches a remote file (e.g. Google Drive) using a server-side request,
 * uploads it to Supabase Storage, and returns a permanent public URL.
 * This is called at CSV-upload time so Instagram/Facebook always get a
 * clean, fast, stable URL — not a Google Drive redirect.
 */
export async function POST(req: NextRequest) {
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

    // Fetch the actual file bytes
    const response = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch media: HTTP ${response.status} from ${fetchUrl}`);
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const buffer = await response.arrayBuffer();

    if (buffer.byteLength === 0) {
      throw new Error('Fetched file is empty — Google Drive may have blocked the download.');
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

    const db = createServerSupabase();
    const { data: uploadData, error: uploadError } = await db.storage
      .from('media')
      .upload(fileName, buffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Supabase upload failed: ${uploadError.message}`);
    }

    const { data: publicData } = db.storage.from('media').getPublicUrl(uploadData.path);

    return NextResponse.json({ publicUrl: publicData.publicUrl, contentType });
  } catch (err: any) {
    console.error('mirror-media error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
