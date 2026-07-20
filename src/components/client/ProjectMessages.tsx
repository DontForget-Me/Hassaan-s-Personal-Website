'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ProjectMessage } from '@/types/database';

interface Props {
  projectId: string;
}

export default function ProjectMessages({ projectId }: Props) {
  const [messages, setMessages] = useState<(ProjectMessage & { sender?: { full_name: string } })[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  async function loadMessages() {
    const supabase = createClient();
    const { data } = await supabase
      .from('project_messages')
      .select('*, sender:profiles(full_name)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (data) setMessages(data as (ProjectMessage & { sender?: { full_name: string } })[]);
    setLoading(false);
  }

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMessages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend() {
    if (!content.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/client/projects/${projectId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (res.ok) {
        setContent('');
        await loadMessages();
        inputRef.current?.focus();
      }
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading messages...</div>
      </div>
    );
  }

  const bubbleUser = {
    background: 'linear-gradient(135deg, var(--accent), #d946ef)',
    color: '#ffffff',
  };

  const bubbleOther = {
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
  };

  return (
    <div className="flex flex-col" style={{ height: '400px' }}>
      {/* Messages area */}
      <div className="flex-1 space-y-3 overflow-y-auto px-1 py-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === userId;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[80%]">
                  {!isMe && (
                    <p className="mb-1 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      {msg.sender?.full_name || 'Developer'}
                    </p>
                  )}
                  <div
                    className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                    style={isMe ? bubbleUser : bubbleOther}
                  >
                    {msg.content}
                  </div>
                  <p className="mt-0.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="mt-3 flex gap-2 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
        <textarea
          ref={inputRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={2}
          className="flex-1 resize-none rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none"
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
        />
        <button
          onClick={handleSend}
          disabled={sending || !content.trim()}
          className="self-end rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-all disabled:opacity-40"
          style={{
            background: !sending && content.trim()
              ? 'linear-gradient(135deg, var(--accent), #d946ef)'
              : 'var(--bg-tertiary)',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
