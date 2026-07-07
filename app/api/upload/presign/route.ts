import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { fileName } = await req.json();

    if (!fileName) {
      return NextResponse.json({ error: 'No fileName provided' }, { status: 400 });
    }

    const db = createServerSupabase();

    // Generate signed upload URL using service role key (bypasses RLS)
    const { data, error } = await db.storage
      .from('media')
      .createSignedUploadUrl(fileName);

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`);
    }

    return NextResponse.json({ 
      signedUrl: data.signedUrl, 
      token: data.token,
      path: data.path 
    });
  } catch (error: any) {
    console.error('Presign error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
