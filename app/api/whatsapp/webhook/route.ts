import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// This token should match the one you configure in your Meta App Dashboard for the Webhook
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'my_secret_verify_token';

// GET request is used by Meta/WhatsApp to verify your webhook URL
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

// POST request handles incoming WhatsApp messages
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if it's a WhatsApp status update or message
    if (body.object) {
      if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages && body.entry[0].changes[0].value.messages[0]) {
        const value = body.entry[0].changes[0].value;
        const phone_number_id = value.metadata.phone_number_id;
        const from = value.messages[0].from; // The sender's phone number
        const msg_body = value.messages[0].text.body; // The text message

        console.log(`Received message from ${from}: ${msg_body}`);

        // Initialize Supabase admin client to insert the message
        // (we use normal server client here, but if RLS prevents inserts without auth, 
        //  you might need lib/supabase-admin createAdminClient instead)
        const supabase = createClient();
        
        // Save the incoming message to a database table
        const { error } = await supabase
          .from('whatsapp_messages')
          .insert([
            {
              from_number: from,
              message_body: msg_body,
              direction: 'in',
              phone_number_id: phone_number_id
            }
          ]);

        if (error) {
          console.error('Error inserting message to DB:', error);
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
