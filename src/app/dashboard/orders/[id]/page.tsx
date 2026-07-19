'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { ClientOrder } from '@/types/database';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<ClientOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data } = await supabase
        .from('client_orders')
        .select('*')
        .eq('id', id)
        .eq('client_id', user.id)
        .single();

      if (!data) {
        router.push('/dashboard/orders');
        return;
      }

      setOrder(data as ClientOrder);
      setLoading(false);
    }
    load();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div>
      </div>
    );
  }

  if (!order) return null;

  const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: '#fef3c7', text: '#92400e' },
    approved: { bg: '#dbeafe', text: '#1e40af' },
    rejected: { bg: '#fee2e2', text: '#991b1b' },
    cancelled: { bg: '#f3f4f6', text: '#6b7280' },
  };

  const sc = statusColors[order.status] ?? statusColors.pending;

  const fields = [
    { label: 'Service Type', value: order.service_type.replace(/-/g, ' ') },
    { label: 'Status', value: order.status },
    { label: 'Budget', value: order.budget_amount ? `$${order.budget_amount} ${order.budget_currency}` : 'Not specified' },
    { label: 'Timeline', value: order.timeline_days ? `${order.timeline_days} days` : 'Not specified' },
    { label: 'Submitted', value: new Date(order.created_at).toLocaleDateString() },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/dashboard/orders"
        className="text-sm transition-colors"
        style={{ color: 'var(--text-muted)' }}
      >
        &larr; Back to Orders
      </Link>

      <div className="mt-6 flex items-center justify-between">
        <h1 className="text-xl font-light sm:text-2xl" style={{ color: 'var(--text-primary)' }}>
          {order.title || order.service_type.replace(/-/g, ' ')}
        </h1>
        <span
          className="rounded-full px-3 py-1 text-xs font-medium capitalize"
          style={{ backgroundColor: sc.bg, color: sc.text }}
        >
          {order.status}
        </span>
      </div>

      {order.admin_notes && (
        <div
          className="mt-4 rounded-xl border p-4 text-sm"
          style={{
            backgroundColor: 'var(--accent-light)',
            borderColor: 'var(--accent)',
            color: 'var(--text-primary)',
          }}
        >
          <span className="text-xs font-medium" style={{ color: 'var(--accent)' }}>
            Admin Note:
          </span>{' '}
          {order.admin_notes}
        </div>
      )}

      <div
        className="mt-6 rounded-2xl border p-6"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <h2 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          Details
        </h2>
        <div className="mt-4 divide-y" style={{ borderColor: 'var(--border)' }}>
          {fields.map((f) => (
            <div
              key={f.label}
              className="flex items-center justify-between py-3 text-sm"
            >
              <span style={{ color: 'var(--text-muted)' }}>{f.label}</span>
              <span style={{ color: 'var(--text-primary)' }}>{f.value}</span>
            </div>
          ))}
        </div>
      </div>

      {order.description && (
        <div
          className="mt-4 rounded-2xl border p-6"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <h2 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Description
          </h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {order.description}
          </p>
        </div>
      )}

      {order.status === 'pending' && (
        <div
          className="mt-6 rounded-2xl border p-6 text-center"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Your order is being reviewed. You&apos;ll hear back soon!
          </p>
        </div>
      )}
    </div>
  );
}
