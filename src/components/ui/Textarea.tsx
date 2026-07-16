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
        <label className="text-sm font-medium text-zinc-700">{label}</label>
      )}
      <textarea
        className={`px-3 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
          placeholder:text-zinc-400 disabled:bg-zinc-50 disabled:text-zinc-500 resize-vertical min-h-[100px]
          ${error ? 'border-red-500 focus:ring-red-500/50' : ''}
          ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
