const META_GRAPH_URL   = 'https://graph.facebook.com/v19.0';
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN!;
const IG_ACCOUNT_ID    = process.env.IG_ACCOUNT_ID!;

/**
 * Post an image + caption to Instagram via Meta Graph API.
 * Returns the Instagram post ID on success, or throws on failure.
 *
 * Flow:
 *   1. Create a media container (image_url + caption)
 *   2. Poll until container status = FINISHED
 *   3. Publish the container
 */
export async function postToInstagram(mediaUrl: string, caption: string, mediaType: string = 'IMAGE'): Promise<string> {
  // ── Step 1: Create container ──────────────────────────────────────
  const bodyParams: any = {
    caption:      caption,
    access_token: META_ACCESS_TOKEN,
  };

  if (mediaType === 'VIDEO') {
    bodyParams.video_url = mediaUrl;
    bodyParams.media_type = 'REELS'; // Instagram uses REELS for video posts
  } else {
    bodyParams.image_url = mediaUrl;
  }

  const containerRes = await fetch(`${META_GRAPH_URL}/${IG_ACCOUNT_ID}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(bodyParams),
  });

  const containerData = await containerRes.json();
  const creationId    = containerData?.id;
  if (!creationId) {
    throw new Error(`Failed to create Instagram container: ${JSON.stringify(containerData)}`);
  }

  // ── Step 2: Poll for FINISHED ────────────────────────────────────
  for (let attempt = 0; attempt < 24; attempt++) {
    const statusRes  = await fetch(
      `${META_GRAPH_URL}/${creationId}?fields=status_code&access_token=${META_ACCESS_TOKEN}`
    );
    const statusData = await statusRes.json();
    const status     = (statusData?.status_code ?? '').toUpperCase();

    if (status === 'FINISHED') break;
    if (status === 'ERROR') {
      throw new Error(`Instagram rejected the image: ${JSON.stringify(statusData)}`);
    }

    // Wait 5 seconds before retrying
    await new Promise(r => setTimeout(r, 5000));
  }

  // ── Step 3: Publish ──────────────────────────────────────────────
  const publishRes  = await fetch(`${META_GRAPH_URL}/${IG_ACCOUNT_ID}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      creation_id:  creationId,
      access_token: META_ACCESS_TOKEN,
    }),
  });

  const publishData = await publishRes.json();
  const postId      = publishData?.id;
  if (!postId) {
    throw new Error(`Failed to publish to Instagram: ${JSON.stringify(publishData)}`);
  }

  return postId;
}
