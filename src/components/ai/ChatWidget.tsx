'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatWidgetProps {
  autoOpenSuggestions?: boolean;
}

export default function ChatWidget({ autoOpenSuggestions }: ChatWidgetProps = {}) {
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  async function handleSubmit() {
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
      inputRef.current?.focus();
    }
  }

  const showSuggestions = autoOpenSuggestions && messages.length <= 1 && !isLoading;

  const bubbleUser = {
    background: 'linear-gradient(135deg, var(--accent), #d946ef)',
    color: '#ffffff',
  };

  const bubbleAssistant = {
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
  };

  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl border"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        height: '520px',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Header — gradient */}
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, var(--accent), #d946ef)',
            }}
          >
            AI
          </div>
          <div>
            <h3
              className="text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              AI Assistant
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Ask me anything
            </p>
          </div>
        </div>
        <span
          className="flex h-2 w-2 rounded-full"
          style={{ backgroundColor: 'var(--accent)' }}
        />
      </div>

      {/* Messages */}
      <div
        className="flex-1 space-y-3 overflow-y-auto px-5 py-4"
        ref={messagesEndRef}
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            style={{
              animation: 'fadeSlideUp 0.3s ease-out',
            }}
          >
            <div
              className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
              style={msg.role === 'user' ? bubbleUser : bubbleAssistant}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div
              className="rounded-2xl px-4 py-2.5 text-sm"
              style={bubbleAssistant}
            >
              <span className="inline-flex gap-1">
                <span className="animate-bounce">.</span>
                <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
              </span>
            </div>
          </div>
        )}

        {showSuggestions && (
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              'What services do you offer?',
              'How much for a website?',
              'Can you build an AI chatbot?',
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setInput(suggestion);
                }}
                className="rounded-xl border px-3 py-1.5 text-xs transition-colors"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.color = 'var(--accent)';
                  e.currentTarget.style.backgroundColor = 'var(--accent-light)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div
        className="border-t p-4"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            className="flex-1 rounded-xl border px-4 py-2.5 text-sm transition-colors focus:outline-none"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
            disabled={isLoading}
            maxLength={2000}
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            className="flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 disabled:opacity-40"
            style={{
              background: !isLoading && input.trim()
                ? 'linear-gradient(135deg, var(--accent), #d946ef)'
                : 'var(--bg-tertiary)',
            }}
          >
            Send
          </button>
        </div>

        {remaining !== null && remaining <= 5 && (
          <p
            className="mt-2 text-center text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            {remaining} message{remaining !== 1 ? 's' : ''} remaining this hour
          </p>
        )}
      </div>
    </div>
  );
}
