'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const links = [
  { href: '/dashboard', label: 'Overview', exact: true },
  { href: '/dashboard/orders', label: 'Orders' },
  { href: '/dashboard/projects', label: 'Projects' },
];

function NotificationBell() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
        .then(({ count }) => setUnread(count ?? 0));
    });
  }, []);

  if (unread === 0) return null;

  return (
    <span className="flex h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
  );
}

export default function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  return (
    <div
      className="border-b"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}
    >
      <div className="mx-auto flex h-12 max-w-4xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/dashboard"
          className="text-sm font-semibold gradient-text"
        >
          Client Portal
        </Link>

        <div className="flex items-center gap-1">
          {links.map((link) => {
            const active = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-1.5 text-sm transition-colors"
                style={{
                  backgroundColor: active ? 'var(--bg-tertiary)' : 'transparent',
                  color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontWeight: active ? 500 : 400,
                }}
              >
                {link.label}
              </Link>
            );
          })}

          <div className="relative mx-1.5">
            <NotificationBell />
          </div>

          <span className="h-4 w-px" style={{ backgroundColor: 'var(--border)' }} />

          <Link
            href="/"
            className="rounded-lg px-3 py-1.5 text-sm transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            Site
          </Link>

          <button
            onClick={handleSignOut}
            className="rounded-lg px-3 py-1.5 text-sm transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
