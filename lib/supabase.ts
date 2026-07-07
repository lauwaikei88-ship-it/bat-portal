import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type PostStatus = 'approved' | 'processing' | 'published' | 'error';

export interface Post {
  id: number;
  prompt: string;
  caption: string;
  scheduled_at: string;
  status: PostStatus;
  image_url: string | null;
  ig_post_id: string | null;
  error_reason: string | null;
  published_at: string | null;
  created_at: string;
}

// Browser-side client — lazy singleton (safe to expose, uses anon key)
let _browserClient: SupabaseClient | null = null;
export function getSupabase() {
  if (!_browserClient) {
    _browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _browserClient;
}

// Backwards-compat alias used by page.tsx
export const supabase = {
  from: (...args: Parameters<SupabaseClient['from']>) => getSupabase().from(...args),
};

// Server-side client — new instance per call (uses service role key — NEVER expose to browser)
export function createServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
