'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 text-center"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <h1 className="text-2xl font-light" style={{ color: 'var(--text-primary)' }}>
        Something went wrong
      </h1>
      <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
        An unexpected error occurred. Please try again.
      </p>
      <div className="mt-8 flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl px-6 py-2.5 text-sm font-medium text-white"
          style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}
        >
          Try Again
        </button>
        <Link
          href="/"
          className="rounded-xl border px-6 py-2.5 text-sm font-medium"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
