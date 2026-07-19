'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Gig, Profile } from '@/types/database';

const PACKAGE_LABELS: Record<string, string> = { basic: 'Basic', standard: 'Standard', premium: 'Premium' };

type Step = 'select' | 'package' | 'details' | 'review';

export default function NewOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presetGig = searchParams.get('gig');
  const presetPackage = searchParams.get('package');

  const [gigs, setGigs] = useState<Gig[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState<Step>(presetGig ? 'package' : 'select');
  const [selectedGig, setSelectedGig] = useState<Gig | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string>('basic');
  const [form, setForm] = useState({ title: '', description: '', timeline_days: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }

      // Profile
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(prof as Profile);

      // Gigs (via public API)
      const res = await fetch('/api/gigs');
      if (res.ok) {
        const gigsData = await res.json();
        setGigs(gigsData);
        if (presetGig) {
          const match = gigsData.find((g: Gig) => g.slug === presetGig);
          if (match) {
            setSelectedGig(match);
            if (presetPackage) setSelectedPackage(presetPackage);
          }
        }
      }

      setLoading(false);
    }
    init();
  }, [router, presetGig, presetPackage]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedGig) return;
    setSubmitting(true);

    const pkg = selectedGig.packages?.find(p => p.name === selectedPackage);
    const res = await fetch('/api/client/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_type: selectedGig.slug,
        title: form.title || `${selectedGig.title} — ${PACKAGE_LABELS[selectedPackage]}`,
        description: form.description,
        timeline_days: form.timeline_days ? parseInt(form.timeline_days) : null,
        budget_amount: pkg?.price || null,
        gig_id: selectedGig.id,
        package_name: selectedPackage,
        package_price: pkg?.price || null,
      }),
    });

    if (res.ok) {
      setSuccess(true);
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full mx-auto" style={{ backgroundColor: 'var(--accent-light)' }}>
          <span className="text-2xl" style={{ color: 'var(--accent)' }}>✓</span>
        </div>
        <h2 className="mt-4 text-xl font-light" style={{ color: 'var(--text-primary)' }}>Order Submitted!</h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Your order has been placed. You can track its status in your orders.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/dashboard/orders"
            className="rounded-xl px-5 py-2.5 text-sm font-medium text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}>
            View Orders
          </Link>
          <Link href="/dashboard/orders/new"
            className="rounded-xl border px-5 py-2.5 text-sm font-medium"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
            Order Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/dashboard/orders" className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
        &larr; Back to Orders
      </Link>
      <h1 className="mt-4 text-xl font-light sm:text-2xl" style={{ color: 'var(--text-primary)' }}>
        New Order
      </h1>

      {/* Step indicator */}
      <div className="mt-6 flex items-center gap-2 text-sm">
        {(['select', 'package', 'details', 'review'] as Step[]).map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
              step === s ? 'text-white' : ''
            }`} style={{
              backgroundColor: step === s ? 'var(--accent)' : 'var(--bg-tertiary)',
              color: step === s ? '#fff' : 'var(--text-muted)',
            }}>
              {i + 1}
            </span>
            <span className={step === s ? 'font-medium' : ''} style={{ color: step === s ? 'var(--text-primary)' : 'var(--text-muted)', textTransform: 'capitalize' }}>
              {s === 'select' ? 'Select Gig' : s}
            </span>
            {i < 3 && <span className="h-px w-6" style={{ backgroundColor: 'var(--border)' }} />}
          </span>
        ))}
      </div>

      {/* STEP 1: Select Gig */}
      {step === 'select' && (
        <div className="mt-8 space-y-3">
          {gigs.map(gig => (
            <button key={gig.id} onClick={() => { setSelectedGig(gig); setStep('package'); }}
              className="w-full rounded-2xl border p-5 text-left transition-all"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{gig.icon}</span>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{gig.title}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{gig.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* STEP 2: Select Package */}
      {step === 'package' && selectedGig && (
        <div className="mt-8">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setStep('select')} className="text-xs" style={{ color: 'var(--text-muted)' }}>&larr; Back</button>
            <span className="text-lg">{selectedGig.icon}</span>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{selectedGig.title}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {(['basic', 'standard', 'premium'] as const).map(tier => {
              const pkg = selectedGig.packages?.find(p => p.name === tier);
              if (!pkg) return null;
              const active = selectedPackage === tier;
              return (
                <button key={tier} onClick={() => setSelectedPackage(tier)}
                  className={`rounded-2xl border p-5 text-left transition-all ${active ? 'ring-2' : ''}`}
                  style={{
                    backgroundColor: active ? 'var(--accent-light)' : 'var(--surface)',
                    borderColor: active ? 'var(--accent)' : 'var(--border)',
                    '--tw-ring-color': 'var(--accent)',
                  } as React.CSSProperties}>
                  <span className="text-xs font-semibold uppercase" style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }}>
                    {PACKAGE_LABELS[tier]}
                  </span>
                  <p className="mt-1 text-2xl font-light" style={{ color: 'var(--text-primary)' }}>${pkg.price}</p>
                  {pkg.delivery_days && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{pkg.delivery_days} days</p>}
                  <ul className="mt-3 space-y-1">
                    {(pkg.features || []).map((f, i) => (
                      <li key={i} className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--accent)' }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
          <button onClick={() => setStep('details')}
            className="mt-6 rounded-xl px-6 py-2.5 text-sm font-medium text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}>
            Continue
          </button>
        </div>
      )}

      {/* STEP 3: Details */}
      {step === 'details' && (
        <form onSubmit={(e) => { e.preventDefault(); setStep('review'); }} className="mt-8 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <button type="button" onClick={() => setStep('package')} className="text-xs" style={{ color: 'var(--text-muted)' }}>&larr; Back</button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Your Name</label>
              <input value={profile?.full_name || ''} disabled
                className="rounded-xl border px-3.5 py-2.5 text-sm opacity-60"
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Email</label>
              <input value={profile?.id ? 'Synced to your account' : ''} disabled
                className="rounded-xl border px-3.5 py-2.5 text-sm opacity-60"
                style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Project Title</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder={selectedGig ? `${selectedGig.title} — ${PACKAGE_LABELS[selectedPackage]}` : ''}
              className="rounded-xl border px-3.5 py-2.5 text-sm"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Tell me about your project, goals, and any specific requirements..."
              rows={4}
              className="rounded-xl border px-3.5 py-2.5 text-sm resize-none"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
          </div>

          <div className="flex flex-col gap-1.5 sm:max-w-[200px]">
            <label className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Timeline (days)</label>
            <input type="number" value={form.timeline_days} onChange={e => setForm(p => ({ ...p, timeline_days: e.target.value }))}
              placeholder="Optional"
              className="rounded-xl border px-3.5 py-2.5 text-sm"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }} />
          </div>

          <button type="submit"
            className="rounded-xl px-6 py-2.5 text-sm font-medium text-white"
            style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}>
            Review Order
          </button>
        </form>
      )}

      {/* STEP 4: Review */}
      {step === 'review' && selectedGig && (
        <div className="mt-8">
          <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Order Summary</h3>
            <div className="mt-4 divide-y text-sm" style={{ borderColor: 'var(--border)' }}>
              <div className="flex justify-between py-2.5">
                <span style={{ color: 'var(--text-muted)' }}>Service</span>
                <span style={{ color: 'var(--text-primary)' }}>{selectedGig.icon} {selectedGig.title}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span style={{ color: 'var(--text-muted)' }}>Package</span>
                <span className="capitalize" style={{ color: 'var(--text-primary)' }}>{PACKAGE_LABELS[selectedPackage]}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span style={{ color: 'var(--text-muted)' }}>Price</span>
                <span className="text-lg font-medium" style={{ color: 'var(--accent)' }}>
                  ${selectedGig.packages?.find(p => p.name === selectedPackage)?.price ?? 0}
                </span>
              </div>
              {form.title && (
                <div className="flex justify-between py-2.5">
                  <span style={{ color: 'var(--text-muted)' }}>Title</span>
                  <span style={{ color: 'var(--text-primary)' }}>{form.title}</span>
                </div>
              )}
              {form.timeline_days && (
                <div className="flex justify-between py-2.5">
                  <span style={{ color: 'var(--text-muted)' }}>Timeline</span>
                  <span style={{ color: 'var(--text-primary)' }}>{form.timeline_days} days</span>
                </div>
              )}
            </div>

            {form.description && (
              <div className="mt-4">
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Description</p>
                <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{form.description}</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={handleSubmit} disabled={submitting}
              className="rounded-xl px-6 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}>
              {submitting ? 'Submitting...' : 'Submit Order'}
            </button>
            <button onClick={() => setStep('details')}
              className="rounded-xl border px-6 py-2.5 text-sm font-medium"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              Edit Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
