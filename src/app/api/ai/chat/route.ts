import { NextRequest, NextResponse } from 'next/server';
import { nyanChanAssistant } from '@/ai/nyan-chan';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message || '';
    const context = body.context || {};

    if (!message.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    const response = await nyanChanAssistant.chat(message, context);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Nyan-chan chat API error:', error);
    return NextResponse.json({ error: 'Assistant service temporarily unavailable' }, { status: 500 });
  }
}
