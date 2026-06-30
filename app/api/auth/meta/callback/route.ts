import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // user.id
  const errorParam = searchParams.get('error');

  if (errorParam || !code) {
    console.error('Meta OAuth Error:', errorParam, searchParams.get('error_description'));
    return NextResponse.redirect(new URL('/settings?error=meta_auth_failed', request.url));
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // state should match user.id for security
  if (!user || user.id !== state) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const appId = process.env.NEXT_PUBLIC_META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin}/api/auth/meta/callback`;

  try {
    // 1. Exchange code for short-lived access token
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      throw new Error(`Failed to get access token: ${JSON.stringify(tokenData)}`);
    }

    const shortLivedToken = tokenData.access_token;

    // 2. Exchange for long-lived access token
    const longLivedUrl = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;
    const longLivedRes = await fetch(longLivedUrl);
    const longLivedData = await longLivedRes.json();
    
    const accessToken = longLivedData.access_token || shortLivedToken;

    // 3. Fetch Facebook Pages the user manages
    const pagesUrl = `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,picture,access_token,instagram_business_account{id,username,profile_picture_url}&access_token=${accessToken}`;
    const pagesRes = await fetch(pagesUrl);
    const pagesData = await pagesRes.json();

    if (!pagesData.data || pagesData.data.length === 0) {
      return NextResponse.redirect(new URL('/settings?error=no_pages_found', request.url));
    }

    // 4. Save accounts to database
    for (const page of pagesData.data) {
      // Save Facebook Page
      await supabase.from('social_accounts').upsert({
        user_id: user.id,
        platform: 'facebook_page',
        platform_account_id: page.id,
        account_name: page.name,
        profile_picture_url: page.picture?.data?.url,
        access_token: page.access_token, // Page specific access token
      }, { onConflict: 'user_id,platform,platform_account_id' });

      // Save Connected Instagram Account if exists
      if (page.instagram_business_account) {
        const ig = page.instagram_business_account;
        await supabase.from('social_accounts').upsert({
          user_id: user.id,
          platform: 'instagram',
          platform_account_id: ig.id,
          account_name: ig.username,
          account_username: ig.username,
          profile_picture_url: ig.profile_picture_url,
          access_token: page.access_token, // Use page token for IG actions
        }, { onConflict: 'user_id,platform,platform_account_id' });
      }
    }

    return NextResponse.redirect(new URL('/settings?success=accounts_connected', request.url));

  } catch (error) {
    console.error('Meta OAuth Exception:', error);
    return NextResponse.redirect(new URL('/settings?error=meta_processing_failed', request.url));
  }
}
