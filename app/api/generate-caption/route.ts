import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const response = await fetch('https://apihub.agnes-ai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AGNES_API_KEY}`
      },
      body: JSON.stringify({
        model: 'agnes-2.0-flash',
        messages: [
          { role: 'system', content: 'You are a social media manager. Generate a short, engaging Instagram caption based on the user\'s prompt. Include relevant hashtags.' },
          { role: 'user', content: prompt }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate caption');
    }

    return NextResponse.json({ caption: data.choices[0].message.content });
  } catch (error: any) {
    console.error('Error generating caption:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
