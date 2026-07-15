import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 30; // Cache the count for 30 seconds

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ count: 0 });
    }

    // Use anon key + RLS — profiles table only exposes user's own row,
    // but COUNT(*) via service role is needed for public count.
    // We use the anon key with a public aggregate only (no personal data exposed).
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // This only returns a count — no personal data, no emails, no IDs
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching tester count:', error.message);
      return NextResponse.json({ count: 0 });
    }

    return NextResponse.json({ count: count ?? 0 });
  } catch (err) {
    console.error('Failed to get tester count');
    return NextResponse.json({ count: 0 });
  }
}
