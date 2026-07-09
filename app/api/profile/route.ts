import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email ?? '',
    display_name: (user.user_metadata?.display_name as string) ?? '',
    avatar_url: (user.user_metadata?.avatar_url as string) ?? '',
  });
}

export async function PATCH(request: Request) {
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const display_name = body.display_name !== undefined ? (body.display_name as string)?.trim() : undefined;
  const avatar_url = body.avatar_url !== undefined ? (body.avatar_url as string)?.trim() : undefined;

  const updateData: any = {};
  if (display_name !== undefined) updateData.display_name = display_name;
  if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const { error } = await supabase.auth.updateUser({
    data: updateData,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, ...updateData });
}
