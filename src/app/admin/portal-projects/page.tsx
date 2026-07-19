'use client';

import { useEffect, useState } from 'react';
import AdminNav from '@/components/admin/AdminNav';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';

export default function AdminPortalProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    async function load() {
      const supabase = createAdminClient();
      let query = supabase
        .from('portal_projects')
        .select('*, client:profiles(full_name, email), milestones:project_milestones(count)')
        .order('created_at', { ascending: false });

      const { data } = await query;
      setProjects(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = filter ? projects.filter(p => p.status === filter) : projects;

  const statusStyles: Record<string, { bg: string; text: string }> = {
    in_progress: { bg: '#dbeafe', text: '#1e40af' },
    completed: { bg: '#d1fae5', text: '#065f46' },
    paused: { bg: '#fdf6b2', text: '#854d0e' },
    cancelled: { bg: '#f3f4f6', text: '#6b7280' },
  };

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
              Client Projects
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Manage all client portal projects.
            </p>
          </div>
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border px-3 py-1.5 text-sm"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <option value="">All Status</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="space-y-3">
          {filtered.map((project) => {
            const sc = statusStyles[project.status] ?? statusStyles.in_progress;
            const msCount = project.milestones?.[0]?.count ?? 0;

            return (
              <Link
                key={project.id}
                href={`/admin/portal-projects/${project.id}`}
                className="flex items-center justify-between rounded-2xl border p-5 transition-all"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {project.title}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>{project.client?.full_name || 'Unknown'}</span>
                    <span>${project.total_amount ?? 0}</span>
                    <span>{msCount} milestone{msCount !== 1 ? 's' : ''}</span>
                    {project.deadline && <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>}
                  </div>
                </div>
                <span className="rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
                  style={{ backgroundColor: sc.bg, color: sc.text }}>
                  {project.status.replace(/_/g, ' ')}
                </span>
              </Link>
            );
          })}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border py-24"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No projects found.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
