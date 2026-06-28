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
  return url;
}
