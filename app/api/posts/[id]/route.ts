import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// PATCH /api/posts/[id] — update a post (status, prompt, caption, scheduled_at)
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const db     = createServerSupabase();
  const body   = await req.json();
  const { id } = await context.params;

  const { data, error } = await db
    .from('posts')
    .update(body)
    .eq('id', Number(id))
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/posts/[id] — delete a post
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const db     = createServerSupabase();
  const { id } = await context.params;

  const { error } = await db.from('posts').delete().eq('id', Number(id));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
