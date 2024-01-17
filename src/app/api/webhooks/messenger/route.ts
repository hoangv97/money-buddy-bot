import {
  sendButtons,
  sendImage,
  sendMessage,
  sendQuickReply,
} from '@/lib/messenger';
import { NextResponse, NextRequest } from 'next/server';

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
  console.log(JSON.stringify(body, null, 2));

  // send back a response// extract sender's ID
  const senderId = body.entry[0].messaging[0].sender.id;

  // extract the message
  const message = body.entry[0].messaging[0].message.text;
  console.log('message', message);

  await sendMessage(
    senderId,
    'Hello, this is a response from your Messenger Bot'
  );
  await sendQuickReply(senderId, 'Quick reply', [
    {
      content_type: 'text',
      title: 'Red',
      payload: 'red',
    },
    {
      content_type: 'text',
      title: 'Green',
      payload: 'green',
    },
  ]);
  await sendImage(senderId, 'https://picsum.photos/200/300');
  await sendButtons(senderId, 'Buttons', [
    {
      type: 'postback',
      title: 'Red',
      payload: 'red',
    },
    {
      type: 'postback',
      title: 'Green',
      payload: 'green',
    },
  ]);

  return NextResponse.json({ message: 'Hello World' }, { status: 200 });
}
