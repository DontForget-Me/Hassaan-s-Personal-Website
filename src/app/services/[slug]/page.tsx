'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import type { Gig } from '@/types/database';

const PACKAGE_LABELS: Record<string, string> = { basic: 'Basic', standard: 'Standard', premium: 'Premium' };
const PACKAGE_COLORS: Record<string, string> = { basic: '#78716c', standard: '#6366f1', premium: '#f59e0b' };

export default function GigDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [gig, setGig] = useState<Gig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/gigs/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { setGig(data as Gig); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  function handleOrder(pkg: string) {
    router.push(`/login?redirect=/dashboard/orders/new?gig=${slug}&package=${pkg}`);
  }

  if (loading) {
    return <><Nav /><div className="flex min-h-screen items-center justify-center"><div className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div></div><Footer /></>;
  }

  if (!gig) {
    return <><Nav /><div className="flex min-h-screen items-center justify-center"><div className="text-sm" style={{ color: 'var(--text-muted)' }}>Gig not found.</div></div><Footer /></>;
  }

  return (
    <>
      <Nav />
      <main className="flex-1">
        <section className="relative px-4 pt-28 pb-20 sm:pt-36 sm:pb-28">
          <div className="pointer-events-none absolute inset-0" style={{ background: 'var(--glow)' }} />
          <div className="relative mx-auto max-w-4xl">
            {/* Header */}
            <div className="text-center">
              <span className="text-4xl">{gig.icon}</span>
              <h1 className="mt-4 text-3xl font-light sm:text-4xl" style={{ color: 'var(--text-primary)' }}>{gig.title}</h1>
              <p className="mt-3 mx-auto max-w-lg text-base" style={{ color: 'var(--text-secondary)' }}>{gig.description}</p>
            </div>

            {/* Package comparison */}
            <div className="mt-12 grid gap-5 sm:grid-cols-3">
              {(['basic', 'standard', 'premium'] as const).map((tier) => {
                const pkg = gig.packages?.find(p => p.name === tier);
                if (!pkg) return null;
                return (
                  <div key={tier} className={`relative rounded-2xl border p-6 ${pkg.is_popular ? 'ring-2' : ''}`}
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderColor: pkg.is_popular ? 'var(--accent)' : 'var(--border)',
                      '--tw-ring-color': 'var(--accent)',
                    } as React.CSSProperties}
                  >
                    {pkg.is_popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-medium text-white whitespace-nowrap"
                        style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}>
                        Most Popular
                      </span>
                    )}
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: PACKAGE_COLORS[tier] }}>
                      {PACKAGE_LABELS[tier]}
                    </span>
                    <p className="mt-2 text-3xl font-light" style={{ color: 'var(--text-primary)' }}>${pkg.price}</p>
                    {pkg.delivery_days && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Up to {pkg.delivery_days} days</p>}

                    <ul className="mt-5 space-y-2.5">
                      {(pkg.features || []).map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          <span className="mt-0.5" style={{ color: 'var(--accent)' }}>✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>

                    <button onClick={() => handleOrder(tier)}
                      className="mt-6 w-full rounded-xl py-2.5 text-sm font-medium text-white transition-all"
                      style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}>
                      Order Now — ${pkg.price}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
