const DEEPSEEK_BASE = 'https://api.deepseek.com';

export interface DeepseekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function createChatCompletion(
  messages: DeepseekMessage[],
  options?: { temperature?: number; max_tokens?: number }
): Promise<string> {
  const res = await fetch(`${DEEPSEEK_BASE}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.max_tokens ?? 512,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Deepseek chat error: ${res.status} — ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}
