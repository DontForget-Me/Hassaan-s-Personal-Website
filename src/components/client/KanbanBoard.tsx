'use client';

import { useState } from 'react';

interface KanbanTask {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
}

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'var(--text-muted)' },
  { id: 'in_progress', label: 'In Progress', color: '#dbeafe' },
  { id: 'review', label: 'In Review', color: '#fef3c7' },
  { id: 'done', label: 'Done', color: '#d1fae5' },
] as const;

interface Props {
  milestones: any[];
  onUpdateStatus: (milestoneId: string, status: string) => Promise<void>;
}

export default function KanbanBoard({ milestones, onUpdateStatus }: Props) {
  const [moving, setMoving] = useState<string | null>(null);

  const getStatus = (ms: any): KanbanTask['status'] => {
    if (ms.status === 'approved') return 'done';
    if (ms.status === 'completed') return 'review';
    if (ms.status === 'in_progress') return 'in_progress';
    return 'todo';
  };

  const tasksByColumn = COLUMNS.map(col => ({
    ...col,
    tasks: milestones.filter(ms => getStatus(ms) === col.id),
  }));

  async function moveTask(msId: string, toStatus: string) {
    setMoving(msId);
    const newStatus = toStatus === 'todo' ? 'pending'
      : toStatus === 'in_progress' ? 'in_progress'
      : toStatus === 'review' ? 'completed'
      : 'approved';
    await onUpdateStatus(msId, newStatus);
    setMoving(null);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-4">
      {tasksByColumn.map(col => (
        <div key={col.id} className="rounded-xl border p-3" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{col.label}</h3>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{col.tasks.length}</span>
          </div>
          <div className="space-y-2 min-h-[100px]">
            {col.tasks.map(ms => (
              <div key={ms.id} className="rounded-lg border p-3 text-sm transition-all cursor-pointer"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  opacity: moving === ms.id ? 0.5 : 1,
                }}
              >
                <p style={{ color: 'var(--text-primary)' }}>{ms.title}</p>
                {ms.amount && <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>${ms.amount}</p>}
                {/* Move buttons */}
                <div className="mt-2 flex gap-1">
                  {col.id !== 'todo' && (
                    <button onClick={() => moveTask(ms.id, 'todo')} className="rounded px-1.5 py-0.5 text-[10px] transition-colors"
                      style={{ color: 'var(--text-muted)' }}>◀</button>
                  )}
                  {col.id !== 'done' && (
                    <button onClick={() => moveTask(ms.id, col.id === 'todo' ? 'in_progress' : col.id === 'in_progress' ? 'review' : 'done')}
                      className="rounded px-1.5 py-0.5 text-[10px] transition-colors" style={{ color: 'var(--accent)' }}>▶</button>
                  )}
                </div>
              </div>
            ))}
            {col.tasks.length === 0 && (
              <div className="flex items-center justify-center py-6">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Empty</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
