'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <h1 className="text-xl font-light" style={{ color: 'var(--text-primary)' }}>
        Something went wrong
      </h1>
      <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
        An error occurred while loading this page.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl px-5 py-2 text-sm font-medium text-white"
          style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}
        >
          Try Again
        </button>
        <Link
          href="/dashboard"
          className="rounded-xl border px-5 py-2 text-sm font-medium"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
