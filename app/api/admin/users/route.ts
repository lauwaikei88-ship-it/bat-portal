import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export async function GET() {
  // 1. Verify the caller is the admin
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!ADMIN_EMAIL || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 2. Use service-role client to bypass RLS
  const admin = createAdminClient();

  // Fetch all profiles
  const { data: profiles, error: profilesError } = await admin
    .from('profiles')
    .select('id, email, display_name, plan, created_at')
    .order('created_at', { ascending: false });

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  // Fetch account counts per user
  const { data: accountCounts, error: acError } = await admin
    .from('social_accounts')
    .select('user_id');

  // Fetch post counts per user
  const { data: postCounts, error: pcError } = await admin
    .from('posts')
    .select('user_id');

  if (acError || pcError) {
    return NextResponse.json({ error: 'Failed to fetch counts' }, { status: 500 });
  }

  // Build count maps
  const accountMap: Record<string, number> = {};
  for (const row of accountCounts ?? []) {
    accountMap[row.user_id] = (accountMap[row.user_id] ?? 0) + 1;
  }
  const postMap: Record<string, number> = {};
  for (const row of postCounts ?? []) {
    postMap[row.user_id] = (postMap[row.user_id] ?? 0) + 1;
  }

  const users = (profiles ?? []).map((p) => ({
    ...p,
    account_count: accountMap[p.id] ?? 0,
    post_count: postMap[p.id] ?? 0,
  }));

  return NextResponse.json({ users });
}
