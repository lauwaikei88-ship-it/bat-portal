import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const appId = process.env.NEXT_PUBLIC_META_APP_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin}/api/auth/meta/callback`;
  const state = user.id; // Simple CSRF protection and way to know which user this is for
  const scope = 'instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement';

  const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;

  return NextResponse.redirect(authUrl);
}
