'use client';

import { useEffect, useState } from 'react';
import AdminNav from '@/components/admin/AdminNav';

interface MonthlyRevenue {
  month: string;
  amount: number;
}

interface AnalyticsData {
  revenue: { total: number; monthly: MonthlyRevenue[] };
  projects: { total: number; active: number; completed: number; paused: number };
  clients: { total: number; newThisMonth: number };
  orders: { pending: number; approved: number };
  milestones: { total: number; completed: number; completionRate: number };
  averageProjectValue: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Failed to load analytics.'); setLoading(false); });
  }, []);

  if (loading) {
    return <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AdminNav />
      <div className="flex items-center justify-center py-24 text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div>
    </div>;
  }

  if (error) {
    return <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AdminNav />
      <div className="flex items-center justify-center py-24 text-sm" style={{ color: 'var(--text-muted)' }}>{error}</div>
    </div>;
  }

  if (!data) {
    return <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AdminNav />
      <div className="flex items-center justify-center py-24 text-sm" style={{ color: 'var(--text-muted)' }}>No data available.</div>
    </div>;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AdminNav />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-xl font-light sm:text-2xl" style={{ color: 'var(--text-primary)' }}>
          Analytics
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Business overview and performance metrics.
        </p>

        {/* Revenue */}
        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Total Revenue</p>
            <p className="mt-2 text-3xl font-light" style={{ color: 'var(--accent)' }}>
              ${data.revenue.total.toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Active Projects</p>
            <p className="mt-2 text-3xl font-light" style={{ color: 'var(--text-primary)' }}>{data.projects.active}</p>
          </div>
          <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Total Clients</p>
            <p className="mt-2 text-3xl font-light" style={{ color: 'var(--text-primary)' }}>{data.clients.total}</p>
          </div>
          <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Avg Project Value</p>
            <p className="mt-2 text-3xl font-light" style={{ color: 'var(--text-primary)' }}>
              ${Math.round(data.averageProjectValue).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Project Metrics */}
        <h2 className="mt-10 text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Projects</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-4">
          {[
            { label: 'Total', value: data.projects.total },
            { label: 'Active', value: data.projects.active, accent: true },
            { label: 'Completed', value: data.projects.completed },
            { label: 'Paused', value: data.projects.paused },
          ].map(s => (
            <div key={s.label} className="rounded-xl border p-4 text-center" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <p className="text-2xl font-light" style={{ color: s.accent ? 'var(--accent)' : 'var(--text-primary)' }}>{s.value}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Client + Order Metrics */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {/* Clients */}
          <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Clients</h3>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-muted)' }}>Total registered</span>
                <span style={{ color: 'var(--text-primary)' }}>{data.clients.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-muted)' }}>New this month</span>
                <span style={{ color: 'var(--accent)' }}>{data.clients.newThisMonth}</span>
              </div>
            </div>
          </div>

          {/* Orders */}
          <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Orders</h3>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-muted)' }}>Pending approval</span>
                <span style={{ color: data.orders.pending > 0 ? 'var(--accent)' : 'var(--text-primary)' }}>
                  {data.orders.pending}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-muted)' }}>Approved</span>
                <span style={{ color: 'var(--text-primary)' }}>{data.orders.approved}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Milestones + Monthly Revenue */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Milestones</h3>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-muted)' }}>Completion rate</span>
                <span style={{ color: 'var(--accent)' }}>{data.milestones.completionRate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-muted)' }}>Completed / Total</span>
                <span style={{ color: 'var(--text-primary)' }}>{data.milestones.completed} / {data.milestones.total}</span>
              </div>
              {/* Progress bar */}
              <div className="h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <div className="h-full rounded-full transition-all" style={{
                  width: `${data.milestones.completionRate}%`,
                  background: 'linear-gradient(90deg, var(--accent), #d946ef)',
                }} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Monthly Revenue</h3>
            <div className="mt-4 max-h-48 space-y-2 overflow-y-auto">
              {data.revenue.monthly.map((m) => (
                <div key={m.month} className="flex items-center gap-3">
                  <span className="w-16 text-xs" style={{ color: 'var(--text-muted)' }}>{m.month}</span>
                  <div className="flex-1">
                    <div className="h-5 rounded-full" style={{
                      width: `${Math.min(100, (m.amount / Math.max(...data.revenue.monthly.map((x) => x.amount))) * 100)}%`,
                      background: 'linear-gradient(90deg, var(--accent), #d946ef)',
                      opacity: 0.7,
                    }} />
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>${m.amount}</span>
                </div>
              ))}
              {data.revenue.monthly.length === 0 && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No revenue data yet.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
