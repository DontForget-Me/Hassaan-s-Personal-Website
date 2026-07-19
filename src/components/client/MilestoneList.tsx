'use client';

import { useState } from 'react';
import StatusBadge from './StatusBadge';
import type { ProjectMilestone } from '@/types/database';

interface Props {
  milestones: ProjectMilestone[];
  onApprove?: (id: string) => Promise<void>;
}

export default function MilestoneList({ milestones, onApprove }: Props) {
  const [approving, setApproving] = useState<string | null>(null);

  async function handleApprove(id: string) {
    if (!onApprove) return;
    setApproving(id);
    try {
      await onApprove(id);
    } finally {
      setApproving(null);
    }
  }

  if (milestones.length === 0) {
    return (
      <p className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
        No milestones set yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {milestones.map((ms, i) => (
        <div
          key={ms.id}
          className="rounded-xl border p-4"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {/* Number circle */}
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium"
                style={{
                  backgroundColor: ms.status === 'approved' ? 'var(--accent-light)' : 'var(--bg-tertiary)',
                  color: ms.status === 'approved' ? 'var(--accent)' : 'var(--text-muted)',
                }}
              >
                {ms.status === 'approved' ? '✓' : i + 1}
              </span>

              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {ms.title}
                </p>
                {ms.description && (
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {ms.description}
                  </p>
                )}
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5">
                  {ms.amount && (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      ${ms.amount}
                    </span>
                  )}
                  {ms.deadline && (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Due: {new Date(ms.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <StatusBadge status={ms.status} />

              {ms.status === 'completed' && onApprove && (
                <button
                  onClick={() => handleApprove(ms.id)}
                  disabled={approving === ms.id}
                  className="rounded-lg px-3 py-1 text-xs font-medium text-white transition-all disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}
                >
                  {approving === ms.id ? '...' : 'Approve'}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
