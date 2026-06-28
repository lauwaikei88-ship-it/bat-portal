import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET /api/posts — fetch all posts
export async function GET() {
  const db = createServerSupabase();
  const { data, error } = await db
    .from('posts')
    .select('*')
    .order('scheduled_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/posts — create a new scheduled post
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { prompt, caption, scheduled_at } = body;

  if (!prompt || !caption || !scheduled_at) {
    return NextResponse.json({ error: 'prompt, caption, and scheduled_at are required' }, { status: 400 });
  }

  const db = createServerSupabase();
  const { data, error } = await db
    .from('posts')
    .insert({ prompt, caption, scheduled_at, status: 'approved' })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
