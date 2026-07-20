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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    const supabase = createClient();

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        router.push('/admin/login');
        setLoading(false);
        return;
      }

      // Verify admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role === 'admin') {
        setAuthenticated(true);
      } else {
        await supabase.auth.signOut();
        router.push('/admin/login');
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        if (profile?.role === 'admin') {
          setAuthenticated(true);
          router.push('/admin/dashboard');
        } else {
          await supabase.auth.signOut();
          router.push('/admin/login');
        }
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
