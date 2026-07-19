'use client';

import { useEffect, useState } from 'react';
import AdminNav from '@/components/admin/AdminNav';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';

export default function AdminGigsPage() {
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', slug: '', description: '', icon: '' });
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const supabase = createAdminClient();
    const { data } = await supabase.from('gigs').select('*, packages:gig_packages(*)').order('sort_order');
    setGigs(data ?? []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/admin/gigs/${editing}` : '/api/admin/gigs';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setForm({ title: '', slug: '', description: '', icon: '' });
    setShowForm(false);
    setEditing(null);
    await load();
  }

  async function toggleActive(gig: any) {
    await fetch(`/api/admin/gigs/${gig.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !gig.is_active }),
    });
    await load();
  }

  function edit(gig: any) {
    setForm({ title: gig.title, slug: gig.slug, description: gig.description, icon: gig.icon });
    setEditing(gig.id);
    setShowForm(true);
  }

  async function deleteGig(id: string) {
    if (!confirm('Delete this gig and all its packages?')) return;
    await fetch(`/api/admin/gigs/${id}`, { method: 'DELETE' });
    await load();
  }

  if (loading) {
    return <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AdminNav /><div className="flex items-center justify-center py-24 text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AdminNav />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-light sm:text-2xl" style={{ color: 'var(--text-primary)' }}>Gigs</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Service offerings with package tiers.</p>
          </div>
          {!showForm && <button onClick={() => { setShowForm(true); setEditing(null); setForm({ title: '', slug: '', description: '', icon: '' }); }}
            className="rounded-xl px-4 py-2 text-sm font-medium text-white" style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}>
            + New Gig
          </button>}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border p-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="grid gap-4 sm:grid-cols-2">
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Gig title" required
                className="rounded-xl border px-3.5 py-2.5 text-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))} placeholder="slug-name"
                className="rounded-xl border px-3.5 py-2.5 text-sm font-mono" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              <input value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} placeholder="Icon (emoji)"
                className="rounded-xl border px-3.5 py-2.5 text-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              <div className="sm:col-span-2">
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" rows={2}
                  className="w-full rounded-xl border px-3.5 py-2.5 text-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="submit" className="rounded-xl px-4 py-2 text-sm font-medium text-white"
                style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}>{editing ? 'Update' : 'Create'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
                className="rounded-xl border px-4 py-2 text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>Cancel</button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {gigs.map(gig => (
            <div key={gig.id} className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{gig.icon}</span>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{gig.title}</p>
                    <span className="rounded-full px-2 py-0.5 text-[10px]" style={{
                      backgroundColor: gig.is_active ? '#d1fae5' : '#f3f4f6',
                      color: gig.is_active ? '#065f46' : '#6b7280',
                    }}>{gig.is_active ? 'Active' : 'Inactive'}</span>
                    <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>/{gig.slug}</span>
                  </div>
                  <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{gig.description}</p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {gig.packages?.length ?? 0} packages · Sort: {gig.sort_order}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link href={`/admin/gigs/${gig.id}`} className="rounded-lg px-2.5 py-1 text-xs" style={{ color: 'var(--accent)' }}>
                    Packages
                  </Link>
                  <button onClick={() => toggleActive(gig)} className="rounded-lg px-2.5 py-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {gig.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => edit(gig)} className="rounded-lg px-2.5 py-1 text-xs" style={{ color: 'var(--accent)' }}>Edit</button>
                  <button onClick={() => deleteGig(gig.id)} className="rounded-lg px-2.5 py-1 text-xs" style={{ color: '#ef4444' }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
          {gigs.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl border py-20"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No gigs created yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
