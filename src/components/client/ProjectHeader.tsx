'use client';

import StatusBadge from './StatusBadge';

interface Props {
  title: string;
  status: string;
  deadline: string | null;
  totalAmount: number | null;
  milestonesTotal: number;
  milestonesCompleted: number;
}

export default function ProjectHeader({
  title,
  status,
  deadline,
  totalAmount,
  milestonesTotal,
  milestonesCompleted,
}: Props) {
  const progress = milestonesTotal > 0
    ? Math.round((milestonesCompleted / milestonesTotal) * 100)
    : 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-light sm:text-2xl" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h1>
        <StatusBadge status={status} />
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
          <span>{progress}% complete</span>
          <span>{milestonesCompleted}/{milestonesTotal} milestones</span>
        </div>
        <div
          className="mt-1.5 h-2 w-full overflow-hidden rounded-full"
          style={{ backgroundColor: 'var(--bg-tertiary)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, var(--accent), #d946ef)',
            }}
          />
        </div>
      </div>

      {/* Meta info */}
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
        {totalAmount && (
          <span>Amount: <strong>${totalAmount}</strong></span>
        )}
        {deadline && (
          <span>Deadline: <strong>{new Date(deadline).toLocaleDateString()}</strong></span>
        )}
      </div>
    </div>
  );
}
