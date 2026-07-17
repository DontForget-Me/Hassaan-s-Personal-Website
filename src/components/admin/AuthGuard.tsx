'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    // Login page always renders — no auth check needed
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthenticated(true);
      } else {
        router.push('/admin/login');
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setAuthenticated(true);
        router.push('/admin/dashboard');
      } else if (event === 'SIGNED_OUT') {
        setAuthenticated(false);
        router.push('/admin/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, isLoginPage]);

  // Login page: render immediately without auth gate
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-zinc-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (!authenticated) return null;

  return <>{children}</>;
}
