'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const links = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/portal-projects', label: 'Projects' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/clients', label: 'Clients' },
  { href: '/admin/testimonials', label: 'Testimonials' },
  { href: '/admin/profile', label: 'Profile' },
  { href: '/admin/ai-logs', label: 'AI Logs' },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
  }

  return (
    <nav
      className="border-b"
      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-1">
          <Link
            href="/admin/dashboard"
            className="mr-2 text-sm font-semibold gradient-text"
          >
            Admin
          </Link>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-1.5 text-sm transition-colors"
              style={{
                backgroundColor: pathname.startsWith(link.href) ? 'var(--bg-tertiary)' : 'transparent',
                color: pathname.startsWith(link.href) ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: pathname.startsWith(link.href) ? 500 : 400,
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
            View Site
          </Link>
          <button onClick={handleSignOut} className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
