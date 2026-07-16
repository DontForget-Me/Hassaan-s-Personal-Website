import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { answerQuestion } from '@/lib/ai/rag';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: 'Message too long (max 2000 chars)' }, { status: 400 });
    }

    // Rate limiting
    const ip = getClientIp(request);
    const rateLimit = await checkRateLimit(ip);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. You can send 20 messages per hour. Please try again later.',
          remaining: 0,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(rateLimit.total),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // Get AI response
    const aiResponse = await answerQuestion(message);

    // Log the chat
    const supabase = createAdminClient();
    await supabase.from('ai_chat_logs').insert({
      session_id: sessionId ?? crypto.randomUUID(),
      visitor_query: message,
      ai_response: aiResponse,
      ip_address: ip,
    });

    return NextResponse.json({
      response: aiResponse,
      remaining: rateLimit.remaining - 1,
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: 'Sorry, something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
