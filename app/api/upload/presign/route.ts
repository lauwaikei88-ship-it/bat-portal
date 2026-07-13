import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { createClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const { fileName } = await req.json();

    if (!fileName) {
      return NextResponse.json({ error: 'Missing fileName' }, { status: 400 });
    }

    const authClient = createClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = createServerSupabase();

    // Create a signed upload URL
    const { data, error } = await db.storage
      .from('media')
      .createSignedUploadUrl(fileName);

    if (error) {
      throw new Error(`Failed to create presigned URL: ${error.message}`);
    }

    // Return the token and path to the frontend
    return NextResponse.json({
      token: data.token,
      path: data.path
    });
  } catch (error: any) {
    console.error('Presign error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
