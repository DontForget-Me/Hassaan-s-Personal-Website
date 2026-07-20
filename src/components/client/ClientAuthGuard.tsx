'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ClientAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  const isAuthPage = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    if (isAuthPage) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthenticated(true);
      return;
    }

    const supabase = createClient();

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push('/login');
        setAuthenticated(false);
        return;
      }

      // Verify user has a profile (client or admin)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setAuthenticated(true);
      } else {
        router.push('/login');
        setAuthenticated(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        setAuthenticated(true);
        router.push('/dashboard');
      } else if (event === 'SIGNED_OUT') {
        setAuthenticated(false);
        router.push('/login');
      }
    });

    return () => subscription?.unsubscribe();
  }, [pathname, router, isAuthPage]);

  if (isAuthPage) return <>{children}</>;

  if (authenticated === null) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        <div className="flex flex-col items-center gap-3">
          <span className="text-lg font-semibold gradient-text">MHK</span>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!authenticated) return null;

  return <>{children}</>;
}
