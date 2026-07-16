'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Hassaan's AI assistant. Ask me about his skills, projects, or background!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [remaining, setRemaining] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, sessionId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.error ?? 'Sorry, something went wrong.',
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.response },
      ]);
      setRemaining(data.remaining);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[500px] sm:h-[600px] rounded-xl border border-zinc-200 bg-white shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-100">
        <h3 className="font-semibold text-sm text-zinc-900">AI Assistant</h3>
        <p className="text-xs text-zinc-500">Ask me about Hassaan&apos;s work</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-100 text-zinc-800'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-zinc-100 rounded-lg px-3 py-2 text-sm text-zinc-500">
              <span className="inline-flex gap-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-zinc-100 p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-zinc-200 bg-white text-zinc-900
            focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
            placeholder:text-zinc-400 disabled:opacity-50"
          disabled={isLoading}
          maxLength={2000}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white
            hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:pointer-events-none
            transition-colors"
        >
          Send
        </button>
      </form>

      {/* Rate limit indicator */}
      {remaining !== null && remaining <= 5 && (
        <div className="px-3 pb-2 text-xs text-zinc-400 text-center">
          {remaining} message{remaining !== 1 ? 's' : ''} remaining this hour
        </div>
      )}
    </div>
  );
}
