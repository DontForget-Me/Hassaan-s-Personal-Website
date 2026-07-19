'use client';

import { useState } from 'react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ai/ChatWidget';
import { SERVICES } from '@/lib/services';

type FormData = {
  client_name: string;
  email: string;
  service_type: string;
  budget: string;
  description: string;
};

const initialForm: FormData = {
  client_name: '',
  email: '',
  service_type: '',
  budget: '',
  description: '',
};

const BUDGET_OPTIONS = [
  'Under $500',
  '$500 – $1,500',
  '$1,500 – $5,000',
  '$5,000 – $15,000',
  '$15,000+',
  'Not sure',
];

export default function ServicesPage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [selectedService, setSelectedService] = useState<string | null>(null);

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/services/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.');
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setForm(initialForm);
      setSubmitting(false);
    } catch {
      setError('Failed to submit. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <>
      <Nav />
      <main className="flex-1">
        {/* HERO */}
        <section className="relative pt-28 pb-8 sm:pt-36 sm:pb-12">
          <div className="pointer-events-none absolute inset-0" style={{ background: 'var(--glow)' }} />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
              style={{ borderColor: 'var(--accent)', color: 'var(--accent)', backgroundColor: 'var(--accent-light)' }}
            >
              Services
            </span>
            <h1 className="mt-4 text-3xl font-light tracking-tight sm:text-4xl lg:text-5xl" style={{ color: 'var(--text-primary)' }}>
              What I Can Build{' '}
              <span className="gradient-text">For You</span>
            </h1>
            <p className="mt-3 mx-auto max-w-lg text-base" style={{ color: 'var(--text-secondary)' }}>
              From full-stack web apps to AI-powered features — pick the service that fits your project.
            </p>
          </div>
        </section>

        {/* SERVICE CARDS */}
        <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
          <div className="grid gap-5 sm:grid-cols-2">
            {SERVICES.map((service) => {
              const active = selectedService === service.id;
              return (
                <div
                  key={service.id}
                  className="group relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 cursor-pointer sm:p-7"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: active ? 'var(--accent)' : 'var(--border)',
                    boxShadow: active ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  }}
                  onClick={() => {
                    setSelectedService(active ? null : service.id);
                    update('service_type', service.id);
                    window.scrollTo({ top: document.getElementById('order-form')?.offsetTop! - 120, behavior: 'smooth' });
                  }}
                >
                  {/* Hover gradient line */}
                  <div
                    className="absolute top-0 left-0 h-0.5 transition-all duration-300"
                    style={{
                      width: active ? '100%' : '0%',
                      background: 'linear-gradient(90deg, var(--accent), #d946ef)',
                    }}
                  />

                  <div className="flex items-start justify-between">
                    <span className="text-2xl">{service.icon}</span>
                    {active && (
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white"
                        style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}>
                        Selected
                      </span>
                    )}
                  </div>

                  <h2 className="mt-4 text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                    {service.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {service.description}
                  </p>

                  <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
                    {service.features.map((f) => (
                      <li key={f} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <span style={{ color: 'var(--accent)' }}>▸</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* ORDER FORM + CHAT SIDE-BY-SIDE */}
        <section
          id="order-form"
          className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 sm:pb-32"
        >
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-light" style={{ color: 'var(--text-primary)' }}>
              Let&apos;s Start Your{' '}
              <span className="gradient-text">Project</span>
            </h2>
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              Fill out the form or ask the AI assistant for help choosing the right service.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* FORM */}
            <div>
              {success ? (
                <div
                  className="flex flex-col items-center justify-center rounded-2xl border py-16 text-center"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div
                    className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                    style={{ backgroundColor: 'var(--accent-light)' }}
                  >
                    <span className="text-2xl" style={{ color: 'var(--accent)' }}>✓</span>
                  </div>
                  <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                    Order Submitted!
                  </h3>
                  <p className="mt-2 max-w-sm text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Thank you! I&apos;ll review your request and get back to you at{' '}
                    <strong>{form.email}</strong> within 24 hours.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="mt-6 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-opacity"
                    style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}
                  >
                    Submit Another
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="rounded-2xl border p-6 sm:p-8"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                  }}
                >
                  {error && (
                    <div className="mb-4 rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
                      {error}
                    </div>
                  )}

                  <div className="grid gap-5 sm:grid-cols-2">
                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        Name <span style={{ color: 'var(--accent)' }}>*</span>
                      </label>
                      <input
                        value={form.client_name}
                        onChange={(e) => update('client_name', e.target.value)}
                        className="rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: 'var(--bg-primary)',
                          borderColor: 'var(--border)',
                          color: 'var(--text-primary)',
                          '--tw-ring-color': 'var(--accent)',
                        } as React.CSSProperties}
                        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                        required
                        maxLength={100}
                      />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        Email <span style={{ color: 'var(--accent)' }}>*</span>
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                        className="rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: 'var(--bg-primary)',
                          borderColor: 'var(--border)',
                          color: 'var(--text-primary)',
                          '--tw-ring-color': 'var(--accent)',
                        } as React.CSSProperties}
                        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                        required
                      />
                    </div>
                  </div>

                  {/* Service Type */}
                  <div className="mt-5 flex flex-col gap-1.5">
                    <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Service Type <span style={{ color: 'var(--accent)' }}>*</span>
                    </label>
                    <select
                      value={form.service_type}
                      onChange={(e) => update('service_type', e.target.value)}
                      className="rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        borderColor: 'var(--border)',
                        color: form.service_type ? 'var(--text-primary)' : 'var(--text-muted)',
                        '--tw-ring-color': 'var(--accent)',
                      } as React.CSSProperties}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                      required
                    >
                      <option value="">Select a service...</option>
                      {SERVICES.map((s) => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Budget */}
                  <div className="mt-5 flex flex-col gap-1.5">
                    <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Budget Range
                    </label>
                    <select
                      value={form.budget}
                      onChange={(e) => update('budget', e.target.value)}
                      className="rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        borderColor: 'var(--border)',
                        color: form.budget ? 'var(--text-primary)' : 'var(--text-muted)',
                        '--tw-ring-color': 'var(--accent)',
                      } as React.CSSProperties}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                    >
                      <option value="">Select a range...</option>
                      {BUDGET_OPTIONS.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div className="mt-5 flex flex-col gap-1.5">
                    <label className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      Project Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => update('description', e.target.value)}
                      rows={4}
                      placeholder="Tell me about your project, goals, timeline..."
                      className="rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 resize-vertical min-h-[100px]"
                      style={{
                        backgroundColor: 'var(--bg-primary)',
                        borderColor: 'var(--border)',
                        color: 'var(--text-primary)',
                        '--tw-ring-color': 'var(--accent)',
                      } as React.CSSProperties}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                      maxLength={5000}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-6 w-full rounded-xl py-3 text-sm font-medium text-white transition-all duration-200 disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, var(--accent), #d946ef)',
                    }}
                  >
                    {submitting ? 'Submitting...' : 'Submit Order Request'}
                  </button>
                </form>
              )}
            </div>

            {/* CHAT */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Need help choosing?
                </p>
                <ChatWidget autoOpenSuggestions />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
