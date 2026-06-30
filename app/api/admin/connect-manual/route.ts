import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { accessToken } = await request.json();

  if (!accessToken) {
    return NextResponse.json({ error: 'Access token is required' }, { status: 400 });
  }

  try {
    // 1. Fetch Facebook Pages the user manages
    const pagesUrl = `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,picture,access_token,instagram_business_account{id,username,profile_picture_url}&access_token=${accessToken}`;
    const pagesRes = await fetch(pagesUrl);
    const pagesData = await pagesRes.json();

    if (pagesData.error) {
      return NextResponse.json({ error: `Meta API Error: ${pagesData.error.message}` }, { status: 400 });
    }

    if (!pagesData.data || pagesData.data.length === 0) {
      return NextResponse.json({ error: 'No Facebook Pages found for this token. Make sure your IG is a Business account linked to a Facebook Page.' }, { status: 400 });
    }

    const saved = [];

    // 2. Save accounts to database
    for (const page of pagesData.data) {
      // Save Facebook Page
      const { error: fbError } = await supabase.from('social_accounts').upsert({
        user_id: user.id,
        platform: 'facebook_page',
        platform_account_id: page.id,
        account_name: page.name,
        profile_picture_url: page.picture?.data?.url,
        access_token: page.access_token,
      }, { onConflict: 'user_id,platform,platform_account_id' });

      if (!fbError) saved.push(`FB: ${page.name}`);

      // Save Connected Instagram Account if exists
      if (page.instagram_business_account) {
        const ig = page.instagram_business_account;
        const { error: igError } = await supabase.from('social_accounts').upsert({
          user_id: user.id,
          platform: 'instagram',
          platform_account_id: ig.id,
          account_name: ig.username,
          account_username: ig.username,
          profile_picture_url: ig.profile_picture_url,
          access_token: page.access_token,
        }, { onConflict: 'user_id,platform,platform_account_id' });

        if (!igError) saved.push(`IG: @${ig.username}`);
      }
    }

    return NextResponse.json({ success: true, saved });

  } catch (error) {
    console.error('Manual connect error:', error);
    return NextResponse.json({ error: 'Failed to connect accounts' }, { status: 500 });
  }
}
