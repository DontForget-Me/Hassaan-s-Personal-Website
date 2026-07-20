'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function AdminGigPackagesPage() {
  const { id } = useParams<{ id: string }>();
  const [gig, setGig] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPkg, setEditingPkg] = useState<string | null>(null);
  const [form, setForm] = useState({ name: 'basic', price: '', delivery_days: '', features: '', is_popular: false });

  useEffect(() => { load(); }, [id]);

  async function load() {
    const supabase = createClient();
    const { data: g } = await supabase.from('gigs').select('*').eq('id', id).single();
    const { data: pkgs } = await supabase.from('gig_packages').select('*').eq('gig_id', id).order('sort_order');
    setGig(g);
    setPackages(pkgs ?? []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const features = form.features.split(',').map(f => f.trim()).filter(Boolean);
    const body = { gig_id: id, name: form.name, price: parseFloat(form.price) || 0, delivery_days: form.delivery_days ? parseInt(form.delivery_days) : null, features, is_popular: form.is_popular };

    const url = editingPkg
      ? `/api/admin/gigs/${id}/packages`
      : `/api/admin/gigs/${id}/packages`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    setForm({ name: 'basic', price: '', delivery_days: '', features: '', is_popular: false });
    setShowForm(false);
    setEditingPkg(null);
    await load();
  }

  async function deletePackage(pkgId: string) {
    if (!confirm('Delete this package?')) return;
    const supabase = createClient();
    await supabase.from('gig_packages').delete().eq('id', pkgId);
    await load();
  }

  function editPkg(pkg: any) {
    setForm({ name: pkg.name, price: String(pkg.price), delivery_days: pkg.delivery_days ? String(pkg.delivery_days) : '', features: (pkg.features || []).join(', '), is_popular: pkg.is_popular });
    setEditingPkg(pkg.id);
    setShowForm(true);
  }

  if (loading) {
    return <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AdminNav /><div className="flex items-center justify-center py-24 text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div>
    </div>;
  }

  const nameLabels: Record<string, string> = { basic: 'Basic', standard: 'Standard', premium: 'Premium' };
  const nameColors: Record<string, string> = { basic: '#78716c', standard: '#6366f1', premium: '#f59e0b' };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AdminNav />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link href="/admin/gigs" className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>&larr; Back to Gigs</Link>
        <h1 className="mt-4 text-xl font-light sm:text-2xl" style={{ color: 'var(--text-primary)' }}>
          {gig?.icon} {gig?.title} — Packages
        </h1>

        {!showForm && (
          <button onClick={() => { setShowForm(true); setEditingPkg(null); setForm({ name: 'basic', price: '', delivery_days: '', features: '', is_popular: false }); }}
            className="mt-6 rounded-xl px-4 py-2 text-sm font-medium text-white" style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}>
            + Add Package
          </button>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="mt-4 rounded-2xl border p-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="grid gap-4 sm:grid-cols-2">
              <select value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="rounded-xl border px-3.5 py-2.5 text-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                <option value="basic">Basic</option><option value="standard">Standard</option><option value="premium">Premium</option>
              </select>
              <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="Price ($)" step="0.01" required
                className="rounded-xl border px-3.5 py-2.5 text-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              <input type="number" value={form.delivery_days} onChange={e => setForm(p => ({ ...p, delivery_days: e.target.value }))} placeholder="Delivery days"
                className="rounded-xl border px-3.5 py-2.5 text-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_popular} onChange={e => setForm(p => ({ ...p, is_popular: e.target.checked }))} id="popular" />
                <label htmlFor="popular" className="text-sm" style={{ color: 'var(--text-primary)' }}>Popular / Recommended</label>
              </div>
              <div className="sm:col-span-2">
                <textarea value={form.features} onChange={e => setForm(p => ({ ...p, features: e.target.value }))} placeholder="Features (comma-separated)" rows={2}
                  className="w-full rounded-xl border px-3.5 py-2.5 text-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="submit" className="rounded-xl px-4 py-2 text-sm font-medium text-white" style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}>
                {editingPkg ? 'Update' : 'Add'} Package</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingPkg(null); }}
                className="rounded-xl border px-4 py-2 text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>Cancel</button>
            </div>
          </form>
        )}

        <div className="mt-8 space-y-3">
          {packages.map((pkg, i) => (
            <div key={pkg.id} className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: nameColors[pkg.name] ?? '#78716c' }}>
                      {nameLabels[pkg.name] ?? pkg.name}
                    </span>
                    <span className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>${pkg.price}</span>
                    {pkg.delivery_days && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{pkg.delivery_days} days</span>}
                    {pkg.is_popular && <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>Popular</span>}
                  </div>
                  {pkg.features?.length > 0 && (
                    <ul className="mt-2 space-y-0.5">
                      {pkg.features.map((f: string, fi: number) => (
                        <li key={fi} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          <span style={{ color: 'var(--accent)' }}>▸</span> {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => editPkg(pkg)} className="rounded-lg px-2.5 py-1 text-xs" style={{ color: 'var(--accent)' }}>Edit</button>
                  <button onClick={() => deletePackage(pkg.id)} className="rounded-lg px-2.5 py-1 text-xs" style={{ color: '#ef4444' }}>Delete</button>
                </div>
              </div>
            </div>
          ))}
          {packages.length === 0 && !showForm && (
            <p className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No packages yet. Add your first package above.</p>
          )}
        </div>
      </main>
    </div>
  );
}
