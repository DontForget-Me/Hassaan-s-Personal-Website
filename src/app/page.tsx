'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ai/ChatWidget';
import { SERVICES } from '@/lib/services';

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        {/* ===== HERO ===== */}
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 pt-12">
          <div className="pointer-events-none absolute inset-0" style={{ background: 'var(--glow)' }} />
          <div className="pointer-events-none absolute -top-40 right-0 h-80 w-80 rounded-full opacity-30 blur-3xl" style={{ backgroundColor: 'var(--accent)' }} />

          <div className="relative mx-auto max-w-2xl text-center">
            <div
              className="mx-auto mb-6 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
              style={{ borderColor: 'var(--accent)', color: 'var(--accent)', backgroundColor: 'var(--accent-light)' }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
              Full-Stack Developer & AI Engineer
            </div>

            <h1 className="text-4xl font-light leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl" style={{ color: 'var(--text-primary)' }}>
              Muhammad<br/>
              <span className="gradient-text">Hassaan Khan</span>
            </h1>

            <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed sm:text-xl" style={{ color: 'var(--text-secondary)' }}>
              I build modern web applications with clean architecture and intelligent features that make a difference.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {['React', 'Next.js', 'TypeScript', 'AI / RAG', 'Supabase', 'Node.js'].map((skill) => (
                <span
                  key={skill}
                  className="rounded-full px-4 py-1.5 text-sm transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--accent-light)',
                    color: 'var(--accent)',
                    border: '1px solid',
                    borderColor: 'var(--accent)',
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="mt-16 flex items-center justify-center gap-4">
              <Link
                href="/services"
                className="rounded-xl px-6 py-2.5 text-sm font-medium text-white transition-all duration-200"
                style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}
              >
                Hire Me
              </Link>
              <Link
                href="/projects"
                className="rounded-xl border px-6 py-2.5 text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                View Projects
              </Link>
            </div>

            <div className="mt-20 flex flex-col items-center gap-2">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Scroll to explore</span>
              <div className="h-8 w-[1px] animate-pulse" style={{ backgroundColor: 'var(--text-muted)' }} />
            </div>
          </div>
        </section>

        {/* ===== WHAT I DO ===== */}
        <section className="relative px-4 pb-24 sm:pb-32">
          <div className="pointer-events-none absolute inset-0" style={{ background: 'var(--glow)' }} />

          <div className="relative mx-auto max-w-5xl">
            <div className="mx-auto mb-14 max-w-lg text-center">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
                style={{ borderColor: 'var(--accent)', color: 'var(--accent)', backgroundColor: 'var(--accent-light)' }}
              >
                What I Do
              </span>
              <h2 className="mt-4 text-2xl font-light sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
                Services I <span className="gradient-text">Offer</span>
              </h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {SERVICES.map((service) => (
                <Link
                  key={service.id}
                  href="/services"
                  className="group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span className="text-2xl">{service.icon}</span>
                  <h3 className="mt-3 text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                    {service.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
                    {service.description}
                  </p>
                </Link>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/services"
                className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
                style={{ color: 'var(--accent)' }}
              >
                View all services & details &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* ===== STATS ===== */}
        <section className="relative border-t border-b px-4 py-20 sm:py-24"
          style={{ borderColor: 'var(--border)' }}>
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-2 gap-8 text-center sm:grid-cols-4">
              {[
                { value: '3+', label: 'Years Experience' },
                { value: '20+', label: 'Projects Built' },
                { value: '4', label: 'Service Types' },
                { value: '10+', label: 'Happy Clients' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-3xl font-light sm:text-4xl gradient-text">{stat.value}</div>
                  <div className="mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== WHY ME ===== */}
        <section className="relative px-4 py-24 sm:py-32">
          <div className="pointer-events-none absolute inset-0" style={{ background: 'var(--glow)' }} />

          <div className="relative mx-auto max-w-4xl">
            <div className="mx-auto max-w-lg text-center">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
                style={{ borderColor: 'var(--accent)', color: 'var(--accent)', backgroundColor: 'var(--accent-light)' }}
              >
                Why Work With Me
              </span>
              <h2 className="mt-4 text-2xl font-light sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
                Quality & <span className="gradient-text">Attention to Detail</span>
              </h2>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {[
                { title: 'Clean Architecture', desc: 'Well-structured, maintainable code that scales. Every project is built with best practices from day one.' },
                { title: 'Modern Stack', desc: 'React, Next.js, TypeScript, Supabase — the tools that power today\'s best web applications.' },
                { title: 'AI-Ready', desc: 'I integrate LLMs, RAG pipelines, and smart features so your app stays ahead of the curve.' },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border p-6 transition-all duration-200"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                >
                  <h3 className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== TESTIMONIALS ===== */}
        <TestimonialsSection />

        {/* ===== CTA ===== */}
        <section className="relative px-4 pb-24 sm:pb-32">
          <div className="relative mx-auto max-w-2xl overflow-hidden rounded-3xl border px-8 py-16 text-center"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="pointer-events-none absolute inset-0 opacity-30"
              style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, var(--accent), transparent)' }} />

            <div className="relative">
              <h2 className="text-2xl font-light sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
                Let&apos;s Build Something <span className="gradient-text">Great</span>
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: 'var(--text-secondary)' }}>
                Have a project in mind? I&apos;d love to hear about it. Let&apos;s turn your ideas into reality.
              </p>
              <div className="mt-8 flex items-center justify-center gap-4">
                <Link
                  href="/services"
                  className="rounded-xl px-6 py-2.5 text-sm font-medium text-white transition-all duration-200"
                  style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}
                >
                  Start a Project
                </Link>
                <Link
                  href="/about"
                  className="rounded-xl border px-6 py-2.5 text-sm font-medium transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ===== AI CHAT ===== */}
        <section className="relative px-4 pb-24 sm:pb-32">
          <div className="pointer-events-none absolute inset-0" style={{ background: 'var(--glow)' }} />

          <div className="relative mx-auto max-w-4xl">
            <div className="mx-auto mb-10 max-w-lg text-center">
              <h2 className="text-2xl font-light" style={{ color: 'var(--text-primary)' }}>
                Ask the <span className="gradient-text">AI Assistant</span>
              </h2>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                Curious about my skills, projects, or services? I&apos;m here to help.
              </p>
            </div>
            <div className="mx-auto max-w-lg">
              <ChatWidget />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

/* Testimonials section */
function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/gigs').then(() => {}); // warm-up
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient();
      supabase.from('testimonials').select('*').eq('is_visible', true).order('created_at', { ascending: false })
        .then(({ data }) => setTestimonials(data ?? []));
    });
  }, []);

  if (testimonials.length === 0) return null;

  return (
    <section className="relative px-4 py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'var(--glow)' }} />
      <div className="relative mx-auto max-w-4xl">
        <div className="mx-auto max-w-lg text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
            style={{ borderColor: 'var(--accent)', color: 'var(--accent)', backgroundColor: 'var(--accent-light)' }}>
            Testimonials
          </span>
          <h2 className="mt-4 text-2xl font-light sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
            What Clients <span className="gradient-text">Say</span>
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {testimonials.map((t) => (
            <div key={t.id} className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-1 text-sm" style={{ color: '#f59e0b' }}>
                {Array.from({ length: t.rating }, (_, i) => <span key={i}>★</span>)}
                {Array.from({ length: 5 - t.rating }, (_, i) => <span key={i} style={{ color: 'var(--text-muted)' }}>★</span>)}
              </div>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                &ldquo;{t.content}&rdquo;
              </p>
              <div className="mt-4">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t.client_name}</p>
                {t.client_role && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.client_role}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
