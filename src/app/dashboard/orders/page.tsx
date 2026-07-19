'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { ClientOrder } from '@/types/database';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<ClientOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data } = await supabase
        .from('client_orders')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      setOrders((data ?? []) as ClientOrder[]);
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

  const statusStyles: Record<string, React.CSSProperties> = {
    pending: { backgroundColor: '#fef3c7', color: '#92400e' },
    approved: { backgroundColor: '#dbeafe', color: '#1e40af' },
    rejected: { backgroundColor: '#fee2e2', color: '#991b1b' },
    cancelled: { backgroundColor: '#f3f4f6', color: '#6b7280' },
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
            Orders
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Your service order history.
          </p>
        </div>
        <Link
          href="/services"
          className="rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-all duration-200"
          style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}
        >
          New Order
        </Link>
      </div>

      {orders.length === 0 ? (
        <div
          className="mt-8 flex flex-col items-center justify-center rounded-2xl border py-20"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No orders yet.
          </p>
          <Link
            href="/services"
            className="mt-3 rounded-xl px-4 py-2 text-sm font-medium text-white transition-opacity"
            style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}
          >
            Place your first order
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="flex items-center justify-between rounded-2xl border p-5 transition-all duration-200"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {order.title || order.service_type.replace(/-/g, ' ')}
                </p>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {order.service_type.replace(/-/g, ' ')}
                  </span>
                  {order.budget_amount && (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      ${order.budget_amount} {order.budget_currency}
                    </span>
                  )}
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
                style={statusStyles[order.status] ?? statusStyles.pending}
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
