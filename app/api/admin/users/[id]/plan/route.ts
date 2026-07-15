import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. Verify admin
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!ADMIN_EMAIL || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { plan } = body;

  if (!plan || !['free', 'pro'].includes(plan)) {
    return NextResponse.json({ error: 'Invalid plan. Must be "free" or "pro".' }, { status: 400 });
  }

  // 2. Update via service role
  const admin = createAdminClient();
  const { error } = await admin
    .from('profiles')
    .update({ plan })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, id, plan });
}
