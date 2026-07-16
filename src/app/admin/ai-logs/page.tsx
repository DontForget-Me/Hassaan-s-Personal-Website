import AdminNav from '@/components/admin/AdminNav';
import { createAdminClient } from '@/lib/supabase/admin';
import type { AiChatLog } from '@/types/database';

export const dynamic = 'force-dynamic';

async function getChatLogs(): Promise<AiChatLog[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('ai_chat_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  return data ?? [];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString();
}

export default async function AdminAiLogsPage() {
  const logs = await getChatLogs();

  return (
    <>
      <AdminNav />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900">AI Chat Logs</h1>
          <p className="text-sm text-zinc-500">
            Monitor what visitors are asking the AI assistant. Last 100 messages shown.
          </p>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-12 text-zinc-400">
            <p>No chat logs yet. The AI assistant hasn&apos;t received any messages.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="rounded-lg border border-zinc-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-400 font-mono">
                    IP: {log.ip_address || 'unknown'}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {formatDate(log.created_at)}
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Query</span>
                    <p className="text-sm text-zinc-900 mt-0.5">{log.visitor_query}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Response</span>
                    <p className="text-sm text-zinc-700 mt-0.5 line-clamp-3">{log.ai_response}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
