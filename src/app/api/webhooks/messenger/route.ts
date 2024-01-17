import { processMessage } from '@/lib/chatbot';
import { addRow } from '@/lib/googlesheet';
import { sendMessage } from '@/lib/messenger';
import { NextRequest, NextResponse } from 'next/server';

// confirm the webhook
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  // check if the hub.mode is subscribe and hub.verify_token is the same as the one we set
  if (
    searchParams.get('hub.mode') === 'subscribe' &&
    searchParams.get('hub.verify_token') === process.env.MESSENGER_VERIFY_TOKEN
  ) {
    // return the hub.challenge token
    return new Response(searchParams.get('hub.challenge'), {
      status: 200,
    });
  }
  // if the hub.mode is not subscribe
  return NextResponse.json({ message: 'Hello World' }, { status: 200 });
}

// webhook event handler
export async function POST(req: NextRequest) {
  const body = await req.json();

  const response = await processMessage(body);

  return NextResponse.json({ message: 'ok' }, { status: 200 });
}
