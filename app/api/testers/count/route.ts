import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const revalidate = 30; // Cache the count for 30 seconds

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ count: 0 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ count: 0 });
    }

    const count = data.users ? data.users.length : 0;
    
    return NextResponse.json({ count });
  } catch (err) {
    console.error('Failed to get tester count:', err);
    return NextResponse.json({ count: 0 });
  }
}
