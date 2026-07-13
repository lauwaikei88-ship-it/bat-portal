import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

/**
 * Cron: Refresh Meta long-lived tokens that are expiring within 10 days.
 * Long-lived tokens last ~60 days. We refresh them before they expire.
 * Schedule: Run daily — add to vercel.json cron config.
 */
export async function GET(request: Request) {
  // Protect this endpoint with a secret header
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerSupabase();

  // Get all social accounts whose tokens expire in the next 10 days
  const tenDaysFromNow = new Date();
  tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);

  const { data: accounts, error } = await supabase
    .from('social_accounts')
    .select('id, access_token, token_expires_at, platform, account_name')
    .or(`token_expires_at.is.null,token_expires_at.lte.${tenDaysFromNow.toISOString()}`);

  if (error) {
    console.error('[Token Refresh] Supabase error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const appId = process.env.NEXT_PUBLIC_META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  if (!appId || !appSecret) {
    return NextResponse.json({ error: 'Missing Meta credentials' }, { status: 500 });
  }

  const results: { id: string; account_name: string; status: string; error?: string }[] = [];

  for (const account of accounts ?? []) {
    if (!account.access_token) {
      results.push({ id: account.id, account_name: account.account_name, status: 'skipped_no_token' });
      continue;
    }

    try {
      // Exchange existing token for a fresh long-lived token
      const refreshUrl = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${account.access_token}`;
      const res = await fetch(refreshUrl);
      const data = await res.json();

      if (!data.access_token) {
        console.error(`[Token Refresh] Failed for ${account.account_name}:`, data);
        results.push({ id: account.id, account_name: account.account_name, status: 'failed', error: data.error?.message });

        // Mark token as expired in DB so the UI can show a reconnect prompt
        await supabase
          .from('social_accounts')
          .update({ token_expires_at: new Date().toISOString() })
          .eq('id', account.id);

        continue;
      }

      // Calculate expiry — Meta returns expires_in in seconds
      const expiresIn: number = data.expires_in ?? 5184000; // default 60 days
      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      await supabase
        .from('social_accounts')
        .update({
          access_token: data.access_token,
          token_expires_at: expiresAt.toISOString(),
        })
        .eq('id', account.id);

      results.push({ id: account.id, account_name: account.account_name, status: 'refreshed' });
      console.log(`[Token Refresh] Refreshed token for ${account.account_name}, expires ${expiresAt.toLocaleDateString()}`);

    } catch (err) {
      console.error(`[Token Refresh] Exception for ${account.account_name}:`, err);
      results.push({ id: account.id, account_name: account.account_name, status: 'exception', error: String(err) });
    }
  }

  return NextResponse.json({ refreshed: results.length, results });
}
