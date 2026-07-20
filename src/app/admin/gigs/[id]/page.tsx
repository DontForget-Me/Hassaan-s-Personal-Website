'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';
import Link from 'next/link';
import FeatureTemplatePicker from '@/components/admin/FeatureTemplatePicker';
import type { Gig, GigPackage } from '@/types/database';

export default function AdminGigPackagesPage() {
  const { id } = useParams<{ id: string }>();
  const [gig, setGig] = useState<Gig | null>(null);
  const [packages, setPackages] = useState<GigPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPkg, setEditingPkg] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Record<string, string[]>>({});
  const [form, setForm] = useState({ name: 'basic', price: '', delivery_days: '', features: '', is_popular: false });

  useEffect(() => { load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    try {
      const [gigRes, pkgRes] = await Promise.all([
        fetch(`/api/admin/gigs/${id}`),
        fetch(`/api/admin/gigs/${id}/packages`),
      ]);
      if (gigRes.ok) setGig(await gigRes.json());
      if (pkgRes.ok) setPackages((await pkgRes.json()) ?? []);
    } catch { setError('Failed to load'); }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const features = form.features.split(',').map((f: string) => f.trim()).filter(Boolean);

    try {
      const url = editingPkg ? `/api/admin/gigs/packages/${editingPkg}` : `/api/admin/gigs/${id}/packages`;
      const res = await fetch(url, {
        method: editingPkg ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          price: parseFloat(form.price) || 0,
          delivery_days: form.delivery_days ? parseInt(form.delivery_days) : null,
          features,
          is_popular: form.is_popular,
        }),
      });

      if (!res.ok) { const err = await res.json(); setError(err.error || 'Failed'); return; }

      setForm({ name: 'basic', price: '', delivery_days: '', features: '', is_popular: false });
      setShowForm(false);
      setEditingPkg(null);
      await load();
    } catch { setError('Failed to save'); }
  }

  async function openAddForm(tier: string) {
    setEditingPkg(null);
    setShowForm(true);
    setForm({ name: tier, price: '', delivery_days: '', features: '', is_popular: false });

    // Load templates and set features after they arrive
    try {
      const res = await fetch(`/api/admin/gigs/${id}/templates`);
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
        const tierFeatures = (data[tier] || []).join(', ');
        setForm({ name: tier, price: '', delivery_days: '', features: tierFeatures, is_popular: false });
      }
    } catch {}
  }

  function openEditForm(pkg: GigPackage) {
    setEditingPkg(pkg.id);
    setForm({
      name: pkg.name,
      price: String(pkg.price),
      delivery_days: pkg.delivery_days ? String(pkg.delivery_days) : '',
      features: (pkg.features || []).join(', '),
      is_popular: pkg.is_popular,
    });
    setShowForm(true);
  }

  async function deletePackage(pkgId: string) {
    if (!confirm('Delete this package?')) return;
    try { await fetch(`/api/admin/gigs/packages/${pkgId}`, { method: 'DELETE' }); await load(); }
    catch { setError('Failed to delete'); }
  }

  function handleToggleFeature(feature: string) {
    const current = form.features.split(',').map(f => f.trim()).filter(Boolean);
    const idx = current.indexOf(feature);
    if (idx >= 0) current.splice(idx, 1);
    else current.push(feature);
    setForm(p => ({ ...p, features: current.join(', ') }));
  }

  function handleAddCustom(feature: string) {
    const current = form.features.split(',').map(f => f.trim()).filter(Boolean);
    current.push(feature);
    setForm(p => ({ ...p, features: current.join(', ') }));
  }

  if (loading) {
    return <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AdminNav /><div className="flex items-center justify-center py-24 text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div>
    </div>;
  }

  const nameLabels: Record<string, string> = { basic: 'Basic', standard: 'Standard', premium: 'Premium' };
  const nameColors: Record<string, string> = { basic: '#78716c', standard: '#6366f1', premium: '#f59e0b' };
  const currentFeatures = form.features.split(',').map(f => f.trim()).filter(Boolean);
  const tierSuggestions = templates[form.name] || [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AdminNav />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Link href="/admin/gigs" className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>&larr; Back to Gigs</Link>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-light sm:text-2xl" style={{ color: 'var(--text-primary)' }}>
              {gig?.icon} {gig?.title} — Packages
            </h1>
            {!showForm && (
              <div className="mt-3 flex gap-2">
                {['basic', 'standard', 'premium'].map(tier => (
                  <button key={tier} onClick={() => openAddForm(tier)}
                    className="rounded-xl px-4 py-2 text-sm font-medium text-white"
                    style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}>
                    + {nameLabels[tier]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && <p className="mt-2 text-xs" style={{ color: '#ef4444' }}>{error}</p>}

        {gig && showForm && (
          <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border p-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Tier</label>
                <select value={form.name} onChange={e => {
                  const newTier = e.target.value;
                  const templateFeatures = templates[newTier];
                  if (templateFeatures && !editingPkg) {
                    setForm(p => ({ ...p, name: newTier, features: templateFeatures.join(', ') }));
                  } else {
                    setForm(p => ({ ...p, name: newTier }));
                  }
                }}
                  className="w-full rounded-xl border px-3.5 py-2.5 text-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Price ($)</label>
                <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} step="0.01" required
                  className="w-full rounded-xl border px-3.5 py-2.5 text-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Delivery (days)</label>
                <input type="number" value={form.delivery_days} onChange={e => setForm(p => ({ ...p, delivery_days: e.target.value }))}
                  className="w-full rounded-xl border px-3.5 py-2.5 text-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input type="checkbox" checked={form.is_popular} onChange={e => setForm(p => ({ ...p, is_popular: e.target.checked }))} id="popular" />
                <label htmlFor="popular" className="text-sm" style={{ color: 'var(--text-primary)' }}>Popular / Recommended</label>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Features (comma-separated)</label>
                <textarea value={form.features} onChange={e => setForm(p => ({ ...p, features: e.target.value }))} rows={3}
                  className="w-full rounded-xl border px-3.5 py-2.5 text-sm font-mono" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
              </div>
            </div>

            {/* Feature template picker */}
            <div className="mt-4">
              <FeatureTemplatePicker
                suggestedFeatures={tierSuggestions}
                selectedFeatures={currentFeatures}
                onToggleFeature={handleToggleFeature}
                onAddCustom={handleAddCustom}
              />
            </div>

            {/* Current features preview */}
            {currentFeatures.length > 0 && (
              <div className="mt-3 rounded-xl border p-3" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                <p className="mb-1.5 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Preview ({currentFeatures.length} features):</p>
                <ul className="space-y-0.5">
                  {currentFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--accent)' }}>▸</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button type="submit" className="rounded-xl px-4 py-2 text-sm font-medium text-white" style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}>
                {editingPkg ? 'Update' : 'Add'} Package
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingPkg(null); }}
                className="rounded-xl border px-4 py-2 text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>Cancel</button>
            </div>
          </form>
        )}

        {gig && !showForm && (
          <div className="mt-6 space-y-3">
            {packages.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border py-16"
                style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No packages yet. Click a tier button above to add one.</p>
              </div>
            )}
            {packages.map((pkg) => (
              <div key={pkg.id} className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-medium text-white" style={{ backgroundColor: nameColors[pkg.name] ?? '#78716c' }}>
                        {nameLabels[pkg.name] ?? pkg.name}
                      </span>
                      <span className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>${pkg.price}</span>
                      {pkg.delivery_days && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{pkg.delivery_days} days</span>}
                      {pkg.is_popular && <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>Popular</span>}
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
                    <button onClick={() => openEditForm(pkg)} className="rounded-lg px-2.5 py-1 text-xs" style={{ color: 'var(--accent)' }}>Edit</button>
                    <button onClick={() => deletePackage(pkg.id)} className="rounded-lg px-2.5 py-1 text-xs" style={{ color: '#ef4444' }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!gig && !loading && (
          <div className="flex flex-col items-center justify-center rounded-2xl border py-20 mt-8"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Gig not found.</p>
            <Link href="/admin/gigs" className="mt-3 text-sm" style={{ color: 'var(--accent)' }}>Back to Gigs</Link>
          </div>
        )}
      </main>
    </div>
  );
}
