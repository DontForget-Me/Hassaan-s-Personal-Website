'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';
import Link from 'next/link';

interface ClientDetailData {
  profile: { full_name: string };
  orders: { id: string; title: string; service_type: string; status: string; created_at: string }[];
  projects: { id: string; title: string; status: string; total_amount: number | null }[];
  payments: { id: string; status: string; amount: number }[];
}

export default function AdminClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ClientDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/clients/${id}`);
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AdminNav />
      <div className="flex items-center justify-center py-24 text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div>
    </div>;
  }

  if (!data) {
    return <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AdminNav />
      <div className="text-center py-24 text-sm" style={{ color: 'var(--text-muted)' }}>Client not found.</div>
    </div>;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AdminNav />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Link href="/admin/clients" className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
          &larr; Back to Clients
        </Link>

        <h1 className="mt-4 text-xl font-light sm:text-2xl" style={{ color: 'var(--text-primary)' }}>
          {data.profile.full_name || 'Unnamed Client'}
        </h1>

        {/* Stats */}
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border p-4 text-center" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-2xl font-light" style={{ color: 'var(--text-primary)' }}>{data.orders.length}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Orders</p>
          </div>
          <div className="rounded-xl border p-4 text-center" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-2xl font-light" style={{ color: 'var(--accent)' }}>{data.projects.length}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Projects</p>
          </div>
          <div className="rounded-xl border p-4 text-center" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-2xl font-light" style={{ color: 'var(--text-primary)' }}>{data.payments.length}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Payments</p>
          </div>
          <div className="rounded-xl border p-4 text-center" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-2xl font-light" style={{ color: 'var(--text-primary)' }}>
              {data.payments.filter((p) => p.status === 'paid').reduce((a, p) => a + p.amount, 0)}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Revenue ($)</p>
          </div>
        </div>

        {/* Projects */}
        <h2 className="mt-10 text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Projects</h2>
        <div className="mt-3 space-y-2">
          {data.projects.map((p) => (
            <Link key={p.id} href={`/admin/portal-projects/${p.id}`}
              className="flex items-center justify-between rounded-xl border px-4 py-3 transition-all"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{p.title}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.status} · ${p.total_amount ?? 0}</p>
              </div>
              <span className="text-xs" style={{ color: 'var(--accent)' }}>View &rarr;</span>
            </Link>
          ))}
          {data.projects.length === 0 && (
            <p className="text-sm py-4" style={{ color: 'var(--text-muted)' }}>No projects yet.</p>
          )}
        </div>

        {/* Recent Orders */}
        <h2 className="mt-8 text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Recent Orders</h2>
        <div className="mt-3 space-y-2">
          {data.orders.slice(0, 5).map((o) => (
            <div key={o.id} className="flex items-center justify-between rounded-xl border px-4 py-3"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{o.title || o.service_type}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{o.status} · {new Date(o.created_at).toLocaleDateString()}</p>
              </div>
              <span className="rounded-full px-2 py-0.5 text-xs capitalize"
                style={{
                  backgroundColor: o.status === 'pending' ? '#fef3c7' : o.status === 'approved' ? '#dbeafe' : '#f3f4f6',
                  color: o.status === 'pending' ? '#92400e' : o.status === 'approved' ? '#1e40af' : '#6b7280',
                }}>
                {o.status}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
