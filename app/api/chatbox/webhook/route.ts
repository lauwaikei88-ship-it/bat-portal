import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

import OpenAI from 'openai';

// This token should match the one you configure in your Meta App Dashboard for the Webhook
const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'my_secret_verify_token';

// GET request is used by Meta to verify your webhook URL
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      return new NextResponse(challenge, { status: 200 });
    } else {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }
  
  return new NextResponse('Bad Request', { status: 400 });
}

// POST request handles incoming FB/IG messages
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if it's a Page (FB) or Instagram event
    if (body.object === 'page' || body.object === 'instagram') {
      
      // Iterate over each entry (there may be multiple if batched)
      for (const entry of body.entry) {
        const accountId = entry.id; // Your Page or IG account ID
        
        // Iterate over messaging events
        if (entry.messaging) {
          for (const webhookEvent of entry.messaging) {
            
            // Check if it's a text message
            if (webhookEvent.message && webhookEvent.message.text) {
              const senderId = webhookEvent.sender.id;
              const msgBody = webhookEvent.message.text;
              const platform = body.object === 'instagram' ? 'instagram' : 'facebook';

              console.log(`Received ${platform} message from ${senderId}: ${msgBody}`);

              // Initialize Supabase admin client to insert the message
              const supabase = createClient();
              
              // 1. Save the incoming message to database
              const { error } = await supabase
                .from('inbox_messages')
                .insert([
                  {
                    platform: platform,
                    from_id: senderId,
                    message_body: msgBody,
                    direction: 'in',
                    account_id: accountId
                  }
                ]);

              if (error) {
                console.error('Error inserting incoming message to DB:', error);
              }

              // 2. Fetch the bot settings (instructions) from DB
              // Since it's a simple prototype, we just grab the first row for now
              const { data: botSettings } = await supabase
                .from('bot_settings')
                .select('system_prompt')
                .limit(1)
                .single();

              const systemPrompt = botSettings?.system_prompt || "You are a helpful assistant.";

              // 3. Get AI Response from OpenAI
              if (process.env.AGNES_API_KEY) {
                try {
                  const openai = new OpenAI({ apiKey: process.env.AGNES_API_KEY });
                  const completion = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                      { role: "system", content: systemPrompt },
                      { role: "user", content: msgBody }
                    ],
                  });

                  const aiResponse = completion.choices[0].message.content || "Sorry, I cannot respond right now.";

                  // 4. Send the response back to the user via Meta Graph API
                  if (process.env.META_PAGE_ACCESS_TOKEN) {
                    const metaUrl = `https://graph.facebook.com/v19.0/me/messages?access_token=${process.env.META_PAGE_ACCESS_TOKEN}`;
                    
                    const metaRes = await fetch(metaUrl, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                        recipient: { id: senderId },
                        message: { text: aiResponse }
                      })
                    });

                    if (!metaRes.ok) {
                      const errorData = await metaRes.text();
                      console.error('Error sending message via Meta API:', errorData);
                    } else {
                      // 5. Save the sent message to database
                      await supabase
                        .from('inbox_messages')
                        .insert([
                          {
                            platform: platform,
                            from_id: senderId,
                            message_body: aiResponse,
                            direction: 'out',
                            account_id: accountId
                          }
                        ]);
                    }
                  } else {
                    console.warn('META_PAGE_ACCESS_TOKEN is not set. Could not send reply.');
                  }
                } catch (aiError) {
                  console.error('Error communicating with OpenAI:', aiError);
                }
              } else {
                console.warn('AGNES_API_KEY is not set. Could not generate AI reply.');
              }
            }
          }
        }
      }
      return new NextResponse('EVENT_RECEIVED', { status: 200 });
    } else {
      return new NextResponse('Not Found', { status: 404 });
    }
  } catch (err) {
    console.error('Error handling webhook', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
