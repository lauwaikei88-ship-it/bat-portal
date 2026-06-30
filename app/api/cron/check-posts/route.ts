import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { postToInstagram, postToFacebookPage } from '@/lib/instagram';

// Force dynamic — this route must never be statically rendered at build time
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Security: Only allow calls from Vercel Cron (or your own requests with the secret)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db  = createServerSupabase();
  const now = new Date().toISOString();

  // Find scheduled posts that are due, along with their social account credentials
  const { data: duePosts, error: fetchError } = await db
    .from('posts')
    .select(`
      *,
      social_account:social_account_id (
        platform,
        platform_account_id,
        access_token
      )
    `)
    .in('status', ['scheduled', 'approved'])
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
      // Step 1: Mark as processing immediately
      await db.from('posts').update({ status: 'processing' }).eq('id', post.id);

      const mediaUrl = post.media_url;
      if (!mediaUrl) {
        throw new Error('No media_url provided for this post');
      }

      // Parse mediaUrls from string, JSON array, or comma-separated
      let mediaUrls: string[] = [];
      try {
        if (mediaUrl.startsWith('[')) {
          mediaUrls = JSON.parse(mediaUrl);
        } else if (mediaUrl.includes(',')) {
          mediaUrls = mediaUrl.split(',').map((u: string) => u.trim());
        } else {
          mediaUrls = [mediaUrl];
        }
      } catch (e) {
        mediaUrls = [mediaUrl];
      }

      if (!post.social_account) {
        throw new Error('No social account connected for this post');
      }

      const { platform, platform_account_id, access_token } = post.social_account;
      const formatType = post.format_type || 'FEED';
      let finalPostId = null;

      // Post to Instagram
      if (post.post_to_ig && platform === 'instagram') {
        finalPostId = await postToInstagram(mediaUrls, post.caption, access_token, platform_account_id, formatType);
      }
      
      // Post to Facebook
      if (post.post_to_fb && platform === 'facebook_page') {
        finalPostId = await postToFacebookPage(mediaUrls, post.caption, access_token, platform_account_id, formatType);
      }

      // Step 4: Mark as published
      await db.from('posts').update({
        status:       'published',
        image_url:    mediaUrls[0],
        ig_post_id:   finalPostId,
        published_at: new Date().toISOString(),
      }).eq('id', post.id);

      results.push({ id: post.id, status: 'published', final_post_id: finalPostId });

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Failed to process post ${post.id}:`, message);

      await db.from('posts').update({
        status:       'error',
        error_reason: message,
      }).eq('id', post.id);

      results.push({ id: post.id, status: 'error', error: message });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
