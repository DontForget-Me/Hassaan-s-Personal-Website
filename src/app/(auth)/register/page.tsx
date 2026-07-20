'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: 'client' },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Profile is auto-created by DB trigger handle_new_user()
    // If user was created but needs confirmation, show success
    if (data.user?.identities?.length === 0) {
      setError('This email is already registered. Please sign in instead.');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div>
        <div className="mb-8 text-center">
          <span className="text-2xl font-semibold gradient-text">MHK</span>
          <h1 className="mt-4 text-xl font-light" style={{ color: 'var(--text-primary)' }}>
            Check your email
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            We&apos;ve sent a confirmation link to <strong>{email}</strong>.
            Please confirm your email, then sign in.
          </p>
        </div>
        <div className="text-center">
          <Link
            href="/login"
            className="rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-opacity inline-block"
            style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <span className="text-2xl font-semibold gradient-text">MHK</span>
        <h1 className="mt-4 text-xl font-light" style={{ color: 'var(--text-primary)' }}>
          Create an account
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Join to manage your projects and orders
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border p-6"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Full name
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            required
          />
        </div>

        <div className="mt-4 flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            required
          />
        </div>

        <div className="mt-4 flex flex-col gap-1.5">
          <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            minLength={6}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-xl py-2.5 text-sm font-medium text-white transition-all duration-200 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'var(--accent)' }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
