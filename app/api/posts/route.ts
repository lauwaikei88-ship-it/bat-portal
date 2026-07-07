import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// GET /api/posts — fetch all posts for the logged-in user
export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const socialAccountId = searchParams.get('social_account_id');

  let query = supabase
    .from('posts')
    .select('*')
    .eq('user_id', user.id)
    .order('scheduled_at', { ascending: true });

  if (socialAccountId) {
    query = query.eq('social_account_id', socialAccountId);
  }

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/posts — create a new scheduled post for the logged-in user
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { prompt, caption, scheduled_at, media_url, media_type, format_type, social_account_id, post_to_ig, post_to_fb } = body;

  if (!caption || !scheduled_at || !social_account_id) {
    return NextResponse.json({ error: 'caption, scheduled_at, and social_account_id are required' }, { status: 400 });
  }

  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const { error: countError, count } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('scheduled_at', startOfWeek.toISOString())
    .lte('scheduled_at', endOfWeek.toISOString());
  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  if (count && count >= 5) {
    return NextResponse.json({ 
      error: 'UPGRADE_REQUIRED', 
      message: 'You have reached your limit of 5 posts per week. Upgrade to Pro for unlimited posts.' 
    }, { status: 403 });
  }

  const { data: insertData, error } = await supabase
    .from('posts')
    .insert({ 
      user_id: user.id,
      social_account_id,
      prompt, 
      caption, 
      scheduled_at, 
      media_url,
      media_type: media_type || 'IMAGE',
      format_type: format_type || 'FEED',
      post_to_ig: post_to_ig ?? true,
      post_to_fb: post_to_fb ?? false,
      status: 'scheduled' 
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(insertData, { status: 201 });
}
