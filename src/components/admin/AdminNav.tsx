'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const links = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/projects', label: 'Projects' },
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
    <nav className="border-b border-zinc-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-1">
          <Link href="/admin/dashboard" className="font-semibold text-sm text-zinc-900 mr-3">
            Admin
          </Link>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                pathname === link.href
                  ? 'bg-zinc-100 text-zinc-900 font-medium'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-700"
          >
            View Site
          </Link>
          <button
            onClick={handleSignOut}
            className="text-sm text-zinc-500 hover:text-zinc-700"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
