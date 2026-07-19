'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import type { Gig } from '@/types/database';

const PACKAGE_LABELS: Record<string, string> = { basic: 'Basic', standard: 'Standard', premium: 'Premium' };
const PACKAGE_COLORS: Record<string, string> = { basic: '#78716c', standard: '#6366f1', premium: '#f59e0b' };

function GigCard({ gig, onOrder }: { gig: Gig; onOrder: (slug: string, pkg: string) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border overflow-hidden transition-all duration-200"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      {/* Header */}
      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between">
          <span className="text-2xl">{gig.icon}</span>
        </div>
        <h2 className="mt-3 text-xl font-medium" style={{ color: 'var(--text-primary)' }}>{gig.title}</h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{gig.description}</p>
      </div>

      {/* Package tiers */}
      <div className={`grid transition-all duration-300 ${expanded ? 'sm:grid-cols-3' : 'sm:grid-cols-3'}`}
        style={{ borderTop: '1px solid var(--border)' }}>
        {(['basic', 'standard', 'premium'] as const).map((tier) => {
          const pkg = gig.packages?.find(p => p.name === tier);
          const isPopular = pkg?.is_popular;

          return (
            <div key={tier} className={`relative p-5 ${tier !== 'premium' ? 'border-r' : ''}`}
              style={{ borderColor: 'var(--border)', backgroundColor: isPopular ? 'var(--accent-light)' : 'transparent' }}>
              {isPopular && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[10px] font-medium text-white"
                  style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}>
                  Recommended
                </span>
              )}
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: PACKAGE_COLORS[tier] }}>
                {PACKAGE_LABELS[tier]}
              </span>
              <p className="mt-1.5 text-2xl font-light" style={{ color: 'var(--text-primary)' }}>
                {pkg ? `$${pkg.price}` : '—'}
              </p>
              {pkg?.delivery_days && (
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Up to {pkg.delivery_days} days</p>
              )}
              {pkg && (
                <button
                  onClick={() => onOrder(gig.slug, tier)}
                  className="mt-4 w-full rounded-xl py-2 text-xs font-medium text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}
                >
                  Order Now
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const router = useRouter();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/gigs')
      .then(r => r.json())
      .then(data => { setGigs(data as Gig[]); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function handleOrder(slug: string, pkg: string) {
    router.push(`/login?redirect=/dashboard/orders/new?gig=${slug}&package=${pkg}`);
  }

  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="relative px-4 pt-28 pb-20 sm:pt-36 sm:pb-28">
          <div className="pointer-events-none absolute inset-0" style={{ background: 'var(--glow)' }} />
          <div className="relative mx-auto max-w-5xl">
            <div className="mx-auto mb-14 max-w-xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
                style={{ borderColor: 'var(--accent)', color: 'var(--accent)', backgroundColor: 'var(--accent-light)' }}>
                Services & Gigs
              </span>
              <h1 className="mt-4 text-3xl font-light tracking-tight sm:text-4xl lg:text-5xl" style={{ color: 'var(--text-primary)' }}>
                Choose a <span className="gradient-text">Package</span>
              </h1>
              <p className="mt-3 mx-auto max-w-md text-base" style={{ color: 'var(--text-secondary)' }}>
                Pick a service and package tier that fits your needs. Quick, professional, and transparent pricing.
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16"><div className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div></div>
            ) : (
              <div className="space-y-8">
                {gigs.map(gig => (
                  <GigCard key={gig.id} gig={gig} onOrder={handleOrder} />
                ))}
                {gigs.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-2xl border py-20"
                    style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Services coming soon.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
