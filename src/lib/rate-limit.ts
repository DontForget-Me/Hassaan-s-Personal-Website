import { createAdminClient } from './supabase/admin';

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_MESSAGES_PER_WINDOW = 20;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  total: number;
}

export async function checkRateLimit(ipAddress: string): Promise<RateLimitResult> {
  const supabase = createAdminClient();
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

  const { count, error } = await supabase
    .from('ai_chat_logs')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ipAddress)
    .gte('created_at', since);

  if (error) {
    console.error('Rate limit check error:', error);
    // Fail open — allow the request if we can't check
    return { allowed: true, remaining: MAX_MESSAGES_PER_WINDOW, total: MAX_MESSAGES_PER_WINDOW };
  }

  const used = count ?? 0;
  const remaining = Math.max(0, MAX_MESSAGES_PER_WINDOW - used);

  return {
    allowed: used < MAX_MESSAGES_PER_WINDOW,
    remaining,
    total: MAX_MESSAGES_PER_WINDOW,
  };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return '127.0.0.1';
}
