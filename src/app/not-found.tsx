import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 text-center"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <h1
        className="text-7xl font-thin tracking-tight gradient-text"
      >
        404
      </h1>
      <p className="mt-4 text-xl font-light" style={{ color: 'var(--text-primary)' }}>
        Page not found
      </p>
      <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-xl px-6 py-2.5 text-sm font-medium text-white"
        style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}
      >
        Go Home
      </Link>
    </div>
  );
}
