import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function GET() {
  // 1. Check who the current session user is
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // 2. Read via anon client (RLS applied) — what the frontend sees
  const { data: rlsAccounts, error: rlsError } = await supabase
    .from('social_accounts')
    .select('id, user_id, platform, account_name, created_at');

  // 3. Read via service role (bypass RLS) — what's actually in the DB
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: allAccounts, error: serviceError } = await serviceClient
    .from('social_accounts')
    .select('id, user_id, platform, account_name, created_at')
    .order('created_at', { ascending: false })
    .limit(20);

  return NextResponse.json({
    session_user_id: user?.id ?? null,
    session_user_email: user?.email ?? null,
    session_error: userError?.message ?? null,
    // What the frontend query returns (RLS-filtered)
    rls_accounts: rlsAccounts ?? [],
    rls_error: rlsError?.message ?? null,
    // What's actually in the table (all rows, no filter)
    all_accounts_in_db: allAccounts ?? [],
    service_error: serviceError?.message ?? null,
  });
}
