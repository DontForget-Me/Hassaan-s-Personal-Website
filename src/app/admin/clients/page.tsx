'use client';

import { useEffect, useState } from 'react';
import AdminNav from '@/components/admin/AdminNav';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function AdminClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from('profiles')
        .select(`
          id, full_name, role, created_at,
          projects:projects(count),
          orders:client_orders(count)
        `)
        .eq('role', 'client')
        .order('created_at', { ascending: false });
      setClients(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

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
        <div className="mb-8">
          <h1 className="text-xl font-light sm:text-2xl" style={{ color: 'var(--text-primary)' }}>
            Clients
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Registered clients and their activity.
          </p>
        </div>

        {clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border py-24"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No clients registered yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border" style={{ borderColor: 'var(--border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--text-muted)' }}>Name</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--text-muted)' }}>Orders</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--text-muted)' }}>Projects</th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--text-muted)' }}>Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-3">
                      <div style={{ color: 'var(--text-primary)' }}>{client.full_name || 'Unnamed'}</div>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                      {client.orders?.[0]?.count ?? 0}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                      {client.projects?.[0]?.count ?? 0}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                      {new Date(client.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="rounded-lg px-3 py-1 text-xs transition-colors"
                        style={{ color: 'var(--accent)' }}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
