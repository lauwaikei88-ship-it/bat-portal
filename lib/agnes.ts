import { createServerSupabase } from './supabase';

const AGNES_BASE_URL = 'https://apihub.agnes-ai.com/v1';
const AGNES_API_KEY  = process.env.AGNES_API_KEY!;

/**
 * Generate an image using Agnes AI.
 * Returns the public image URL on success, or throws on failure.
 */
export async function generateImage(prompt: string): Promise<string> {
  const res = await fetch(`${AGNES_BASE_URL}/images/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AGNES_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'agnes-image-2.1-flash',
      prompt,
      n: 1,
      size: '1024x1024',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Agnes image generation failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  const url  = data?.data?.[0]?.url;
  if (!url) throw new Error('Agnes returned no image URL');

  // Instagram blocks the Agnes URL directly (OAuthException code 1). 
  // We must download it and host it on our own Supabase bucket!
  const imgRes = await fetch(url);
  if (!imgRes.ok) throw new Error(`Failed to download image from Agnes`);
  const imgBuffer = await imgRes.arrayBuffer();

  const db = createServerSupabase();
  const fileName = `${crypto.randomUUID()}.png`;
  
  const { data: uploadData, error } = await db
    .storage
    .from('images')
    .upload(fileName, imgBuffer, {
      contentType: 'image/png',
      upsert: true
    });

  if (error) throw new Error(`Failed to upload to Supabase: ${error.message}`);

  const { data: publicUrlData } = db.storage.from('images').getPublicUrl(fileName);
  return publicUrlData.publicUrl;
}
