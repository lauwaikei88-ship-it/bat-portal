import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { posts } = body;

  if (!Array.isArray(posts) || posts.length === 0) {
    return NextResponse.json({ error: 'posts array is required' }, { status: 400 });
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

  const currentCount = count || 0;
  
  // Enforce 5 posts per week limit
  if (currentCount + posts.length > 5) {
    return NextResponse.json({ 
      error: 'UPGRADE_REQUIRED', 
      message: `You are trying to schedule ${posts.length} posts, but you only have ${5 - currentCount} remaining this week. Upgrade to Pro for unlimited posts.` 
    }, { status: 403 });
  }

  const rowsToInsert = posts.map(post => {
    return {
      user_id: user.id,
      social_account_id: post.social_account_id,
      prompt: post.prompt || null,
      caption: post.caption,
      scheduled_at: post.scheduled_at,
      media_url: post.media_url || null,
      media_type: post.media_type || 'IMAGE',
      format_type: post.format_type || 'FEED',
      post_to_ig: post.post_to_ig ?? false,
      post_to_fb: post.post_to_fb ?? false,
      status: 'scheduled'
    };
  });

  const { data: insertData, error } = await supabase
    .from('posts')
    .insert(rowsToInsert)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  
  return NextResponse.json({ success: true, count: insertData.length }, { status: 201 });
}
