'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import StatusBadge from './StatusBadge';

interface Props {
  projectId: string;
  currentDeadline: string | null;
}

interface Extension {
  id: string;
  reason: string;
  old_deadline: string;
  new_deadline: string;
  status: string;
  response_notes: string;
  created_at: string;
  milestone?: { title: string } | null;
}

export default function ExtensionRequestSection({ projectId, currentDeadline }: Props) {
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadExtensions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function loadExtensions() {
    const supabase = createClient();
    const { data } = await supabase
      .from('extension_requests')
      .select('*, milestone:project_milestones(title)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (data) setExtensions(data as Extension[]);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason || !newDeadline) return;
    setSubmitting(true);

    const res = await fetch(`/api/client/projects/${projectId}/extensions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reason,
        new_deadline: newDeadline,
        old_deadline: currentDeadline,
      }),
    });

    if (res.ok) {
      setReason('');
      setNewDeadline('');
      setShowForm(false);
      await loadExtensions();
    }
    setSubmitting(false);
  }

  if (loading) {
    return <div className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div>;
  }

  return (
    <div>
      {/* Existing extensions */}
      {extensions.length > 0 && (
        <div className="mb-6 space-y-3">
          {extensions.map((ext) => (
            <div
              key={ext.id}
              className="rounded-xl border p-4"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    {ext.reason}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span>
                      {ext.old_deadline ? new Date(ext.old_deadline).toLocaleDateString() : 'N/A'} →{' '}
                      {new Date(ext.new_deadline).toLocaleDateString()}
                    </span>
                    <span>{new Date(ext.created_at).toLocaleDateString()}</span>
                  </div>
                  {ext.response_notes && (
                    <p className="mt-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      Response: {ext.response_notes}
                    </p>
                  )}
                </div>
                <StatusBadge status={ext.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      {extensions.length === 0 && !showForm && (
        <p className="mb-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          No extension requests yet.
        </p>
      )}

      {/* Request button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="rounded-xl border px-4 py-2 text-sm transition-all"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          + Request Extension
        </button>
      )}

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border p-4"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          <div className="flex flex-col gap-3">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for extension..."
              rows={2}
              className="rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none resize-none"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              required
            />
            <div>
              <label className="mb-1 block text-xs" style={{ color: 'var(--text-muted)' }}>
                New deadline
              </label>
              <input
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                className="w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                required
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border px-4 py-2 text-sm"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
