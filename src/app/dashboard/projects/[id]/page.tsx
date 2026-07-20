'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import ProjectHeader from '@/components/client/ProjectHeader';
import MilestoneList from '@/components/client/MilestoneList';
import ProjectMessages from '@/components/client/ProjectMessages';
import ProjectFiles from '@/components/client/ProjectFiles';
import ProjectTimeline from '@/components/client/ProjectTimeline';
import ExtensionRequestSection from '@/components/client/ExtensionRequestSection';
import PaymentSection from '@/components/client/PaymentSection';
import { calculateLateFee } from '@/lib/project-penalties';
import type { PortalProject, ProjectMilestone } from '@/types/database';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'milestones', label: 'Milestones' },
  { id: 'messages', label: 'Messages' },
  { id: 'files', label: 'Files' },
  { id: 'extensions', label: 'Extensions' },
  { id: 'payments', label: 'Payments' },
  { id: 'timeline', label: 'Timeline' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [project, setProject] = useState<PortalProject | null>(null);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      const { data } = await supabase
        .from('portal_projects')
        .select('*')
        .eq('id', id)
        .eq('client_id', user.id)
        .single();

      if (!data) {
        router.push('/dashboard/projects');
        return;
      }

      setProject(data as PortalProject);

      // Load milestones
      const { data: ms } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: true });

      setMilestones((ms ?? []) as ProjectMilestone[]);
      setLoading(false);
    }
    load();
  }, [id, router]);

  const handleApproveMilestone = useCallback(async (milestoneId: string) => {
    const res = await fetch(`/api/client/milestones/${milestoneId}/approve`, { method: 'POST' });
    if (!res.ok) return;

    // Refresh milestones
    const supabase = createClient();
    const { data: ms } = await supabase
      .from('project_milestones')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: true });
    setMilestones((ms ?? []) as ProjectMilestone[]);
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div>
      </div>
    );
  }

  if (!project) return null;

  const completedMilestones = milestones.filter(
    (m) => m.status === 'approved' || m.status === 'completed'
  ).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {/* Back link */}
      <Link
        href="/dashboard/projects"
        className="text-sm transition-colors"
        style={{ color: 'var(--text-muted)' }}
      >
        &larr; Back to Projects
      </Link>

      {/* Header */}
      <div className="mt-6">
        <ProjectHeader
          title={project.title}
          status={project.status}
          deadline={project.deadline}
          totalAmount={project.total_amount}
          milestonesTotal={milestones.length}
          milestonesCompleted={completedMilestones}
        />
      </div>

      {/* Tabs */}
      <div
        className="mt-8 flex gap-1 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2.5 text-sm transition-colors -mb-px"
            style={{
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
              fontWeight: activeTab === tab.id ? 500 : 400,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Description */}
            {project.description && (
              <div
                className="rounded-2xl border p-6"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Description
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {project.description}
                </p>
              </div>
            )}

            {/* Project info */}
            <div
              className="rounded-2xl border p-6"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                Project Info
              </h3>
              <div className="mt-3 divide-y text-sm" style={{ borderColor: 'var(--border)' }}>
                <div className="flex justify-between py-2.5">
                  <span style={{ color: 'var(--text-muted)' }}>Status</span>
                  <span className="capitalize" style={{ color: 'var(--text-primary)' }}>
                    {project.status.replace(/_/g, ' ')}
                  </span>
                </div>
                {project.total_amount && (
                  <div className="flex justify-between py-2.5">
                    <span style={{ color: 'var(--text-muted)' }}>Total Amount</span>
                    <span style={{ color: 'var(--text-primary)' }}>${project.total_amount}</span>
                  </div>
                )}
                {project.deadline && (
                  <div className="flex justify-between py-2.5">
                    <span style={{ color: 'var(--text-muted)' }}>Deadline</span>
                    <span style={{ color: 'var(--text-primary)' }}>
                      {new Date(project.deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {project.penalty_per_day > 0 && (
                  <div className="flex justify-between py-2.5">
                    <span style={{ color: 'var(--text-muted)' }}>Late Penalty</span>
                    <span style={{ color: 'var(--text-primary)' }}>
                      ${project.penalty_per_day}/day
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Late penalty */}
            {(() => {
              const penalty = calculateLateFee(project.deadline, project.penalty_per_day);
              return penalty.daysLate > 0 ? (
                <div
                  className="rounded-xl border p-4"
                  style={{ backgroundColor: '#fef2f2', borderColor: '#ef4444' }}
                >
                  <p className="text-sm font-medium" style={{ color: '#991b1b' }}>
                    ⚠️ {penalty.daysLate} day{penalty.daysLate !== 1 ? 's' : ''} past deadline
                  </p>
                  <p className="mt-0.5 text-xs" style={{ color: '#b91c1c' }}>
                    Late fee accrued: ${penalty.totalFee} (${project.penalty_per_day}/day)
                  </p>
                </div>
              ) : null;
            })()}

            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-4">
              <div
                className="rounded-xl border p-4 text-center"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <p className="text-2xl font-light" style={{ color: 'var(--text-primary)' }}>
                  {milestones.length}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Total Milestones
                </p>
              </div>
              <div
                className="rounded-xl border p-4 text-center"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <p className="text-2xl font-light" style={{ color: 'var(--accent)' }}>
                  {completedMilestones}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Completed
                </p>
              </div>
              <div
                className="rounded-xl border p-4 text-center"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <p className="text-2xl font-light" style={{ color: 'var(--text-primary)' }}>
                  {milestones.length - completedMilestones}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Remaining
                </p>
              </div>
              <div
                className="rounded-xl border p-4 text-center"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <p className="text-2xl font-light" style={{ color: 'var(--text-primary)' }}>
                  ${project.total_amount ?? 0}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Amount
                </p>
              </div>
            </div>

            {/* Renewal button for completed projects */}
            {project.status === 'completed' && (
              <div
                className="rounded-2xl border p-6 text-center"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
              >
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  This project is complete!
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Need ongoing work? Submit a renewal request.
                </p>
                <RenewalButton projectId={project.id} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'milestones' && (
          <MilestoneList
            milestones={milestones}
            onApprove={handleApproveMilestone}
          />
        )}

        {activeTab === 'messages' && (
          <div
            className="rounded-2xl border p-4 sm:p-6"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <ProjectMessages projectId={id} />
          </div>
        )}

        {activeTab === 'files' && (
          <div
            className="rounded-2xl border p-4 sm:p-6"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <ProjectFiles projectId={id} />
          </div>
        )}

        {activeTab === 'extensions' && (
          <div
            className="rounded-2xl border p-4 sm:p-6"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <ExtensionRequestSection
              projectId={id}
              currentDeadline={project.deadline}
            />
          </div>
        )}

        {activeTab === 'payments' && (
          <div
            className="rounded-2xl border p-4 sm:p-6"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <PaymentSection
              projectId={id}
              totalAmount={project.total_amount}
            />
          </div>
        )}

        {activeTab === 'timeline' && (
          <div
            className="rounded-2xl border p-4 sm:p-6"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <ProjectTimeline projectId={id} />
          </div>
        )}
      </div>
    </div>
  );
}

/* Renewal button component */
function RenewalButton({ projectId }: { projectId: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleRenewal() {
    setSubmitting(true);
    const res = await fetch(`/api/client/projects/${projectId}/renewal`, {
      method: 'POST',
    });
    if (res.ok) {
      setDone(true);
    }
    setSubmitting(false);
  }

  if (done) {
    return (
      <p className="mt-2 text-sm" style={{ color: 'var(--accent)' }}>
        Renewal submitted! Check your orders.
      </p>
    );
  }

  return (
    <button
      onClick={handleRenewal}
      disabled={submitting}
      className="mt-3 rounded-xl px-5 py-2 text-sm font-medium text-white transition-all disabled:opacity-50"
      style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}
    >
      {submitting ? 'Submitting...' : 'Request Renewal'}
    </button>
  );
}
