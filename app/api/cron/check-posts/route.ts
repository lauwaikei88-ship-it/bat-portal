import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { postToInstagram }      from '@/lib/instagram';

// Force dynamic — this route must never be statically rendered at build time
export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/check-posts
 *
 * Called by Vercel Cron every minute (configured in vercel.json).
 * Finds all 'approved' posts with scheduled_at <= NOW, and for each:
 *   1. Marks it 'processing' (prevents double-posting)
 *   2. Generates image via Agnes AI
 *   3. Posts to Instagram via Meta API
 *   4. Marks it 'published' (or 'error' on failure)
 */
export async function GET(req: NextRequest) {
  // Security: Only allow calls from Vercel Cron (or your own requests with the secret)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db  = createServerSupabase();
  const now = new Date().toISOString();

  // Find approved posts that are due
  const { data: duePosts, error: fetchError } = await db
    .from('posts')
    .select('*')
    .eq('status', 'approved')
    .lte('scheduled_at', now);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!duePosts || duePosts.length === 0) {
    return NextResponse.json({ message: 'No posts due', checked_at: now });
  }

  const results = [];

  for (const post of duePosts) {
    try {
      // Step 1: Mark as processing immediately (prevents duplicate posts on next tick)
      await db.from('posts').update({ status: 'processing' }).eq('id', post.id);

      // Step 2: Ensure media URL exists
      const mediaUrl = post.media_url;
      if (!mediaUrl) {
        throw new Error('No media_url provided for this post');
      }

      // Step 3: Post to Instagram
      const igPostId = await postToInstagram(mediaUrl, post.caption, post.media_type);

      // Step 4: Mark as published
      await db.from('posts').update({
        status:       'published',
        image_url:    mediaUrl,
        ig_post_id:   igPostId,
        published_at: new Date().toISOString(),
      }).eq('id', post.id);

      results.push({ id: post.id, status: 'published', ig_post_id: igPostId });

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Failed to process post ${post.id}:`, message);

      // Mark as error so it doesn't loop forever
      await db.from('posts').update({
        status:       'error',
        error_reason: message,
      }).eq('id', post.id);

      results.push({ id: post.id, status: 'error', error: message });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
