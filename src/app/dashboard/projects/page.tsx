'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import StatusBadge from '@/components/client/StatusBadge';

interface ProjectSummary {
  id: string;
  title: string;
  status: string;
  deadline: string | null;
  total_amount: number | null;
  created_at: string;
  milestones: { count: number }[];
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data } = await supabase
        .from('portal_projects')
        .select(`
          id, title, status, deadline, total_amount, created_at,
          milestones:project_milestones(count)
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      setProjects((data ?? []) as ProjectSummary[]);
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-light sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
        Projects
      </h1>
      <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
        Your active and completed projects.
      </p>

      {projects.length === 0 ? (
        <div
          className="mt-8 flex flex-col items-center justify-center rounded-2xl border py-20"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No projects yet. Once an order is approved, it will appear here.
          </p>
          <Link
            href="/services"
            className="mt-3 rounded-xl px-4 py-2 text-sm font-medium text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}
          >
            Place an Order
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {projects.map((project) => {
            const msCount = project.milestones?.[0]?.count ?? 0;
            return (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
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
                    {project.title}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    {project.total_amount && (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        ${project.total_amount}
                      </span>
                    )}
                    {project.deadline && (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Due: {new Date(project.deadline).toLocaleDateString()}
                      </span>
                    )}
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {msCount} milestone{msCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <StatusBadge status={project.status} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
