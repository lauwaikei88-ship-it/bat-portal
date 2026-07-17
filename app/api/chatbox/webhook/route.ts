import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

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
              
              // Save the incoming message to database
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
                console.error('Error inserting message to DB:', error);
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
