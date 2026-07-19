'use client';

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#92400e' },
  in_progress: { bg: '#dbeafe', text: '#1e40af' },
  completed: { bg: '#d1fae5', text: '#065f46' },
  approved: { bg: '#d1fae5', text: '#065f46' },
  rejected: { bg: '#fee2e2', text: '#991b1b' },
  cancelled: { bg: '#f3f4f6', text: '#6b7280' },
  paused: { bg: '#fdf6b2', text: '#854d0e' },
  paid: { bg: '#d1fae5', text: '#065f46' },
  failed: { bg: '#fee2e2', text: '#991b1b' },
  refunded: { bg: '#f3f4f6', text: '#6b7280' },
  contacted: { bg: '#dbeafe', text: '#1e40af' },
};

export default function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? { bg: '#f3f4f6', text: '#6b7280' };

  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
