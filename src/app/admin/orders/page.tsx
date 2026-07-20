'use client';

import { useEffect, useState } from 'react';
import AdminNav from '@/components/admin/AdminNav';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#92400e' },
  approved: { bg: '#dbeafe', text: '#1e40af' },
  rejected: { bg: '#fee2e2', text: '#991b1b' },
  cancelled: { bg: '#f3f4f6', text: '#6b7280' },
};

interface OrderRow {
  id: string;
  title: string;
  service_type: string;
  status: string;
  description: string;
  budget_amount: number | null;
  contact_name: string;
  contact_email: string;
  created_at: string;
  client?: { full_name: string; email: string } | null;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  async function loadOrders() {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('client_orders')
        .select('*, client:profiles(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(50);
      setOrders((data as OrderRow[]) ?? []);
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders();
  }, []);

  async function handleAction(id: string, status: string, deadline?: string) {
    setActionId(id);
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, deadline: deadline || null }),
    });
    await loadOrders();
    setActionId(null);
  }

  if (loading) {
    return <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AdminNav />
      <div className="flex items-center justify-center py-24 text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AdminNav />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-light sm:text-2xl" style={{ color: 'var(--text-primary)' }}>
              Orders
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Client order inquiries. Approve to create a project.
            </p>
          </div>
          <Link
            href="/admin/dashboard"
            className="text-sm transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            &larr; Dashboard
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border py-24"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No orders yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const sc = STATUS_STYLES[order.status] ?? STATUS_STYLES.pending;
              return (
                <div key={order.id}
                  className="rounded-2xl border p-5"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {order.title || order.service_type.replace(/-/g, ' ')}
                        </p>
                        <span className="rounded-full px-2 py-0.5 text-xs font-medium capitalize"
                          style={{ backgroundColor: sc.bg, color: sc.text }}>
                          {order.status}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span>{order.client?.full_name || order.contact_name || 'Anonymous'}</span>
                        <span>{order.client?.email || order.contact_email}</span>
                        <span>{order.service_type}</span>
                        {order.budget_amount && <span>${order.budget_amount}</span>}
                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                      {order.description && (
                        <p className="mt-2 text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                          {order.description}
                        </p>
                      )}
                    </div>

                    {order.status === 'pending' && (
                      <div className="flex shrink-0 gap-2">
                        <button
                          onClick={() => handleAction(order.id, 'approved')}
                          disabled={actionId === order.id}
                          className="rounded-lg px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                          style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}
                        >
                          {actionId === order.id ? '...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleAction(order.id, 'rejected')}
                          disabled={actionId === order.id}
                          className="rounded-lg border px-3 py-1.5 text-xs font-medium disabled:opacity-50"
                          style={{ borderColor: '#ef4444', color: '#ef4444' }}
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
