'use client';

import { useEffect, useState } from 'react';
import { createAdminClient } from '@/lib/supabase/admin';

interface Props {
  projectId: string;
  milestones: any[];
}

export default function TimeTracking({ projectId, milestones }: Props) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ milestone_id: '', description: '', hours: '', log_date: new Date().toISOString().split('T')[0] });

  useEffect(() => { load(); }, [projectId]);

  async function load() {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('time_logs')
      .select('*, milestone:project_milestones(title)')
      .eq('project_id', projectId)
      .order('log_date', { ascending: false });
    setLogs(data ?? []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.hours) return;

    await fetch('/api/admin/time-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: projectId,
        milestone_id: form.milestone_id || null,
        hours: parseFloat(form.hours),
        description: form.description,
        log_date: form.log_date,
      }),
    });

    setForm({ milestone_id: '', description: '', hours: '', log_date: new Date().toISOString().split('T')[0] });
    setShowForm(false);
    await load();
  }

  const totalHours = logs.reduce((s, l) => s + l.hours, 0);

  if (loading) {
    return <div className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div>;
  }

  return (
    <div>
      {/* Total */}
      <div className="mb-4 rounded-xl border p-4 text-center" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        <p className="text-2xl font-light" style={{ color: 'var(--accent)' }}>{totalHours}h</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Hours Logged</p>
      </div>

      {/* Logs */}
      <div className="mb-4 space-y-2">
        {logs.map((log) => (
          <div key={log.id} className="flex items-center justify-between rounded-xl border px-4 py-2.5"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {log.description || (log.milestone?.title || 'General')}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {log.log_date} · {log.milestone?.title || '—'}
              </p>
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{log.hours}h</span>
          </div>
        ))}
        {logs.length === 0 && (
          <p className="py-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No time logged yet.</p>
        )}
      </div>

      {!showForm && (
        <button onClick={() => setShowForm(true)}
          className="rounded-xl border px-4 py-2 text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
          + Log Time
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border p-4" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <div className="flex flex-col gap-3">
            <select value={form.milestone_id} onChange={e => setForm(p => ({ ...p, milestone_id: e.target.value }))}
              className="rounded-xl border px-3.5 py-2 text-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
              <option value="">General (no milestone)</option>
              {milestones.map(ms => <option key={ms.id} value={ms.id}>{ms.title}</option>)}
            </select>
            <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="What did you work on?"
              className="rounded-xl border px-3.5 py-2 text-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
            <div className="grid grid-cols-2 gap-3">
              <input type="number" value={form.hours} onChange={e => setForm(p => ({ ...p, hours: e.target.value }))}
                placeholder="Hours" step="0.5" required
                className="rounded-xl border px-3.5 py-2 text-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              <input type="date" value={form.log_date} onChange={e => setForm(p => ({ ...p, log_date: e.target.value }))}
                className="rounded-xl border px-3.5 py-2 text-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button type="submit" className="rounded-xl px-4 py-2 text-sm font-medium text-white"
              style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}>Log Time</button>
            <button type="button" onClick={() => setShowForm(false)}
              className="rounded-xl border px-4 py-2 text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
