import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
  // Auth check — prevent unauthenticated API credit drain
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const response = await fetch('https://apihub.agnes-ai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AGNES_API_KEY}`
      },
      body: JSON.stringify({
        model: 'agnes-image-2.1-flash',
        prompt: prompt,
        n: 1,
        size: '1024x1024'
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate image');
    }

    return NextResponse.json({ url: data.data[0].url });
  } catch (error: any) {
    console.error('Error generating image:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
