'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Profile, ClientOrder } from '@/types/database';

interface DashData {
  profile: Profile | null;
  orders: ClientOrder[];
  projectsCount: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Fetch orders
      const { data: orders } = await supabase
        .from('client_orders')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Count projects
      const { count: pCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', user.id);

      setData({
        profile: profile ?? null,
        orders: (orders ?? []) as ClientOrder[],
        projectsCount: pCount ?? 0,
      });
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div>
      </div>
    );
  }

  const pendingOrders = data?.orders.filter((o) => o.status === 'pending').length ?? 0;

  const stats = [
    { value: data?.orders.length ?? 0, label: 'Total Orders' },
    { value: pendingOrders, label: 'Pending', accent: pendingOrders > 0 },
    { value: data?.projectsCount ?? 0, label: 'Projects' },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Welcome */}
      <h1 className="text-2xl font-light sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
        Hello, {data?.profile?.full_name || 'there'}
      </h1>
      <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
        Welcome to your client dashboard.
      </p>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border p-6"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: stat.accent ? 'var(--accent)' : 'var(--border)',
            }}
          >
            <p className="text-3xl font-light" style={{ color: stat.accent ? 'var(--accent)' : 'var(--text-primary)' }}>
              {stat.value}
            </p>
            <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 flex gap-3">
        <Link
          href="/dashboard/orders/new"
          className="rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-all duration-200"
          style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}
        >
          New Order
        </Link>
        <Link
          href="/dashboard/orders"
          className="rounded-xl border px-5 py-2.5 text-sm font-medium transition-all duration-200"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          View Orders
        </Link>
      </div>

      {/* Recent Orders */}
      <h2 className="mt-12 text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
        Recent Orders
      </h2>

      {(!data?.orders || data.orders.length === 0) ? (
        <div
          className="mt-4 flex flex-col items-center justify-center rounded-2xl border py-16"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No orders yet.
          </p>
          <Link
            href="/dashboard/orders/new"
            className="mt-3 rounded-xl px-4 py-2 text-sm font-medium text-white transition-opacity"
            style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}
          >
            Place your first order
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {data.orders.slice(0, 5).map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="flex items-center justify-between rounded-2xl border p-4 transition-all duration-200"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {order.service_type.replace('-', ' ')}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
                style={{
                  backgroundColor:
                    order.status === 'pending' ? '#fef3c7' :
                    order.status === 'approved' ? '#dbeafe' :
                    order.status === 'rejected' ? '#fee2e2' : '#d1fae5',
                  color:
                    order.status === 'pending' ? '#92400e' :
                    order.status === 'approved' ? '#1e40af' :
                    order.status === 'rejected' ? '#991b1b' : '#065f46',
                }}
              >
                {order.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
