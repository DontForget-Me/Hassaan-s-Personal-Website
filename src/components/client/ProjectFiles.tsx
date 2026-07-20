'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ProjectFile } from '@/types/database';

interface Props {
  projectId: string;
}

export default function ProjectFiles({ projectId }: Props) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ file_name: '', file_url: '', expires_days: '' });
  const [submitting, setSubmitting] = useState(false);

  async function loadFiles() {
    const supabase = createClient();
    const { data } = await supabase
      .from('project_files')
      .select('*, uploader:profiles(full_name)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (data) setFiles(data as ProjectFile[]);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFiles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.file_name || !form.file_url) return;

    setSubmitting(true);
    const expires_at = form.expires_days
      ? new Date(Date.now() + parseInt(form.expires_days) * 86400000).toISOString()
      : null;

    try {
      const res = await fetch(`/api/client/projects/${projectId}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_name: form.file_name,
          file_url: form.file_url,
          expires_at,
        }),
      });

      if (res.ok) {
        setForm({ file_name: '', file_url: '', expires_days: '' });
        setShowForm(false);
        await loadFiles();
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading files...</div>
      </div>
    );
  }

  return (
    <div>
      {/* File list */}
      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No files shared yet.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between rounded-xl border px-4 py-3"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="min-w-0 flex-1">
                <a
                  href={file.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium transition-colors hover:underline"
                  style={{ color: 'var(--accent)' }}
                >
                  {file.file_name}
                </a>
                <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {file.file_size && (
                    <span>{Math.round(file.file_size / 1024)} KB</span>
                  )}
                  <span>{new Date(file.created_at).toLocaleDateString()}</span>
                  {file.expires_at && (
                    <span>
                      Expires: {new Date(file.expires_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <a
                href={file.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-lg px-3 py-1 text-xs font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--accent-light)',
                  color: 'var(--accent)',
                }}
              >
                Open
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 rounded-xl border px-4 py-2 text-sm transition-all"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)',
            color: 'var(--text-secondary)',
          }}
        >
          + Share File / Link
        </button>
      )}

      {/* Upload form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 rounded-xl border p-4"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
            Paste a Google Drive/Dropbox link or upload URL. For big files, use a shareable link.
          </p>

          <div className="flex flex-col gap-3">
            <input
              value={form.file_name}
              onChange={(e) => setForm((p) => ({ ...p, file_name: e.target.value }))}
              placeholder="File name"
              className="rounded-xl border px-3.5 py-2 text-sm focus:outline-none"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              required
            />
            <input
              value={form.file_url}
              onChange={(e) => setForm((p) => ({ ...p, file_url: e.target.value }))}
              placeholder="File URL or shareable link"
              className="rounded-xl border px-3.5 py-2 text-sm focus:outline-none"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              required
            />
            <input
              value={form.expires_days}
              onChange={(e) => setForm((p) => ({ ...p, expires_days: e.target.value }))}
              placeholder="Auto-delete after (days) — optional"
              type="number"
              min="1"
              className="rounded-xl border px-3.5 py-2 text-sm focus:outline-none"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl px-4 py-2 text-sm font-medium text-white transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}
            >
              {submitting ? 'Sharing...' : 'Share'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border px-4 py-2 text-sm transition-all"
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
