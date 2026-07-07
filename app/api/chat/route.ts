import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are Agnes, the Post 2 Post AI Assistant. Your job is to help the user brainstorm social media content and write image generation prompts. IMPORTANT: You do not have the ability to post to Instagram directly. If the user asks you to schedule or post something, tell them: 'I cannot post directly, but I can write the prompt for you! Once you are happy with it, you can copy it and paste it into the Calendar & Approvals tab to schedule it.' Keep your answers concise and friendly.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const fullMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
    ];

    const response = await fetch('https://apihub.agnes-ai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AGNES_API_KEY}`
      },
      body: JSON.stringify({
        model: 'agnes-2.0-flash',
        messages: fullMessages
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate chat reply');
    }

    return NextResponse.json({ reply: data.choices[0].message.content });
  } catch (error: any) {
    console.error('Error generating chat reply:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
