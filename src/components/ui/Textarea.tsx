'use client';

import { type TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {label}
        </label>
      )}
      <textarea
        className={`rounded-md border px-3 py-2 text-sm transition-colors
          focus:outline-none focus:ring-2 placeholder:text-sm resize-vertical min-h-[100px] ${className}`}
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: error ? '#ef4444' : 'var(--border)',
          color: 'var(--text-primary)',
          '--tw-ring-color': error ? '#ef4444' : 'var(--accent)',
        } as React.CSSProperties}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error ? '#ef4444' : 'var(--accent)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? '#ef4444' : 'var(--border)';
        }}
        {...props}
      />
      {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
    </div>
  );
}
