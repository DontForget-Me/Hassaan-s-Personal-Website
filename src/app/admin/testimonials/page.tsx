'use client';

import { useEffect, useState } from 'react';
import AdminNav from '@/components/admin/AdminNav';
import { createAdminClient } from '@/lib/supabase/admin';

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ client_name: '', client_role: '', content: '', rating: 5, is_visible: false });
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const supabase = createAdminClient();
    const { data } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
    setTestimonials(data ?? []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method = editing ? 'PUT' : 'POST';
    const body = editing ? { ...form, id: editing } : form;

    await fetch('/api/admin/testimonials', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    setForm({ client_name: '', client_role: '', content: '', rating: 5, is_visible: false });
    setShowForm(false);
    setEditing(null);
    await load();
  }

  async function toggleVisibility(t: any) {
    await fetch('/api/admin/testimonials', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: t.id, is_visible: !t.is_visible }),
    });
    await load();
  }

  async function deleteTestimonial(id: string) {
    if (!confirm('Delete this testimonial?')) return;
    await fetch(`/api/admin/testimonials?id=${id}`, { method: 'DELETE' });
    await load();
  }

  function edit(t: any) {
    setForm({ client_name: t.client_name, client_role: t.client_role, content: t.content, rating: t.rating, is_visible: t.is_visible });
    setEditing(t.id);
    setShowForm(true);
  }

  if (loading) {
    return <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AdminNav />
      <div className="flex items-center justify-center py-24 text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AdminNav />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-light sm:text-2xl" style={{ color: 'var(--text-primary)' }}>
              Testimonials
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Client reviews shown on the home page.
            </p>
          </div>
          {!showForm && (
            <button onClick={() => { setShowForm(true); setEditing(null); setForm({ client_name: '', client_role: '', content: '', rating: 5, is_visible: false }); }}
              className="rounded-xl px-4 py-2 text-sm font-medium text-white"
              style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}>
              + Add Testimonial
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border p-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="grid gap-4 sm:grid-cols-2">
              <input value={form.client_name} onChange={e => setForm(p => ({ ...p, client_name: e.target.value }))}
                placeholder="Client name" required
                className="rounded-xl border px-3.5 py-2.5 text-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              <input value={form.client_role} onChange={e => setForm(p => ({ ...p, client_role: e.target.value }))}
                placeholder="Role (e.g. Founder at XYZ)"
                className="rounded-xl border px-3.5 py-2.5 text-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              <div className="sm:col-span-2">
                <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                  placeholder="Testimonial content" rows={3} required
                  className="w-full rounded-xl border px-3.5 py-2.5 text-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Rating (1-5)</label>
                <select value={form.rating} onChange={e => setForm(p => ({ ...p, rating: parseInt(e.target.value) }))}
                  className="rounded-xl border px-3.5 py-2.5 text-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_visible} onChange={e => setForm(p => ({ ...p, is_visible: e.target.checked }))} id="vis" />
                <label htmlFor="vis" className="text-sm" style={{ color: 'var(--text-primary)' }}>Visible on home page</label>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="submit" className="rounded-xl px-4 py-2 text-sm font-medium text-white"
                style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}>
                {editing ? 'Update' : 'Save'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
                className="rounded-xl border px-4 py-2 text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {testimonials.map(t => (
            <div key={t.id} className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t.client_name}</p>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</span>
                    {t.is_visible ? (
                      <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ backgroundColor: '#d1fae5', color: '#065f46' }}>Visible</span>
                    ) : (
                      <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}>Hidden</span>
                    )}
                  </div>
                  {t.client_role && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.client_role}</p>}
                  <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>"{t.content}"</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => toggleVisibility(t)} className="rounded-lg px-2.5 py-1 text-xs transition-colors"
                    style={{ color: 'var(--text-muted)' }}>
                    {t.is_visible ? 'Hide' : 'Show'}
                  </button>
                  <button onClick={() => edit(t)} className="rounded-lg px-2.5 py-1 text-xs" style={{ color: 'var(--accent)' }}>Edit</button>
                  <button onClick={() => deleteTestimonial(t.id)} className="rounded-lg px-2.5 py-1 text-xs" style={{ color: '#ef4444' }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
          {testimonials.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border py-16"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No testimonials yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
