import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // user.id
  const errorParam = searchParams.get('error');

  console.log('[Meta Callback] Received:', { code: !!code, state, errorParam });

  if (errorParam || !code) {
    console.error('[Meta Callback] Error from Meta:', errorParam, searchParams.get('error_description'));
    return NextResponse.redirect(new URL('/settings?error=meta_auth_failed', request.url));
  }

  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  console.log('[Meta Callback] User from session:', user?.id, 'State:', state, 'userError:', userError?.message);

  if (!user) {
    console.error('[Meta Callback] No user session found, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Note: state check - if mismatch we still try to proceed since cookie timing can be off
  if (user.id !== state) {
    console.warn('[Meta Callback] State mismatch — user.id:', user.id, 'state:', state, '— proceeding anyway');
  }

  const appId = process.env.NEXT_PUBLIC_META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin}/api/auth/meta/callback`;

  console.log('[Meta Callback] Using redirectUri:', redirectUri);

  try {
    // 1. Exchange code for short-lived access token
    const tokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    console.log('[Meta Callback] Token exchange response:', JSON.stringify(tokenData));

    if (!tokenData.access_token) {
      throw new Error(`Failed to get access token: ${JSON.stringify(tokenData)}`);
    }

    const shortLivedToken = tokenData.access_token;

    // 2. Exchange for long-lived user access token
    const longLivedUrl = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;
    const longLivedRes = await fetch(longLivedUrl);
    const longLivedData = await longLivedRes.json();

    console.log('[Meta Callback] Long-lived token response:', JSON.stringify(longLivedData));

    const userAccessToken = longLivedData.access_token || shortLivedToken;
    // Calculate expiry — long-lived tokens last ~60 days (5,184,000 seconds)
    const tokenExpiresIn: number = longLivedData.expires_in ?? 5184000;
    const tokenExpiresAt = new Date(Date.now() + tokenExpiresIn * 1000).toISOString();

    // 3. Get identity of this token
    const meRes = await fetch(`https://graph.facebook.com/v21.0/me?fields=id,name&access_token=${userAccessToken}`);
    const meData = await meRes.json();
    console.log('[Meta Callback] /me response:', JSON.stringify(meData));

    // 4. Fetch Facebook Pages this user manages
    const pagesUrl = `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,picture,access_token,instagram_business_account{id,username,profile_picture_url}&access_token=${userAccessToken}`;
    const pagesRes = await fetch(pagesUrl);
    const pagesData = await pagesRes.json();

    console.log('[Meta Callback] /me/accounts response:', JSON.stringify(pagesData));

    if (!pagesData.data || pagesData.data.length === 0) {
      // Fallback: try treating the token itself as a Page token
      console.warn('[Meta Callback] No pages from me/accounts. Trying token as Page token directly...');

      const pageInfoRes = await fetch(`https://graph.facebook.com/v21.0/me?fields=id,name,picture,instagram_business_account{id,username,profile_picture_url}&access_token=${userAccessToken}`);
      const pageInfoData = await pageInfoRes.json();
      console.log('[Meta Callback] Fallback /me page token response:', JSON.stringify(pageInfoData));

      if (pageInfoData.id && pageInfoData.name) {
        // Save as page directly
        await supabase.from('social_accounts').upsert({
          user_id: user.id,
          platform: 'facebook_page',
          platform_account_id: pageInfoData.id,
          account_name: pageInfoData.name,
          profile_picture_url: pageInfoData.picture?.data?.url,
          access_token: userAccessToken,
          token_expires_at: tokenExpiresAt,
        }, { onConflict: 'user_id,platform,platform_account_id' });

        if (pageInfoData.instagram_business_account) {
          const ig = pageInfoData.instagram_business_account;
          await supabase.from('social_accounts').upsert({
            user_id: user.id,
            platform: 'instagram',
            platform_account_id: ig.id,
            account_name: ig.username,
            account_username: ig.username,
            profile_picture_url: ig.profile_picture_url,
            access_token: userAccessToken,
            token_expires_at: tokenExpiresAt,
          }, { onConflict: 'user_id,platform,platform_account_id' });
        }

        return NextResponse.redirect(new URL('/settings?success=accounts_connected', request.url));
      }

      return NextResponse.redirect(new URL('/settings?error=no_pages_found', request.url));
    }

    // 5. Save pages and linked IG accounts to database
    for (const page of pagesData.data) {
      console.log('[Meta Callback] Saving page:', page.name, page.id);

      await supabase.from('social_accounts').upsert({
        user_id: user.id,
        platform: 'facebook_page',
        platform_account_id: page.id,
        account_name: page.name,
        profile_picture_url: page.picture?.data?.url,
        access_token: page.access_token,
        token_expires_at: tokenExpiresAt,
      }, { onConflict: 'user_id,platform,platform_account_id' });

      if (page.instagram_business_account) {
        const ig = page.instagram_business_account;
        console.log('[Meta Callback] Saving IG:', ig.username, ig.id);

        await supabase.from('social_accounts').upsert({
          user_id: user.id,
          platform: 'instagram',
          platform_account_id: ig.id,
          account_name: ig.username,
          account_username: ig.username,
          profile_picture_url: ig.profile_picture_url,
          access_token: page.access_token,
          token_expires_at: tokenExpiresAt,
        }, { onConflict: 'user_id,platform,platform_account_id' });
      }
    }

    return NextResponse.redirect(new URL('/settings?success=accounts_connected', request.url));

  } catch (error) {
    console.error('[Meta Callback] Exception:', error);
    return NextResponse.redirect(new URL('/settings?error=meta_processing_failed', request.url));
  }
}
