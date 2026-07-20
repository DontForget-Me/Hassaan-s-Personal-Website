'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import StatusBadge from './StatusBadge';

interface Props {
  projectId: string;
  totalAmount: number | null;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  transaction_id: string;
  proof_url: string;
  account_details: string;
  notes: string;
  paid_at: string | null;
  created_at: string;
  milestone?: { title: string } | null;
}

export default function PaymentSection({ projectId, totalAmount }: Props) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    amount: '',
    payment_method: '',
    transaction_id: '',
    proof_url: '',
    account_details: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function loadPayments() {
    const supabase = createClient();
    const { data } = await supabase
      .from('payments')
      .select('*, milestone:project_milestones(title)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (data) setPayments(data as Payment[]);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount) return;
    setSubmitting(true);

    const res = await fetch(`/api/client/projects/${projectId}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: parseFloat(form.amount),
        payment_method: form.payment_method || 'Bank Transfer',
        transaction_id: form.transaction_id,
        proof_url: form.proof_url,
        account_details: form.account_details,
        notes: form.notes,
      }),
    });

    if (res.ok) {
      setForm({ amount: '', payment_method: '', transaction_id: '', proof_url: '', account_details: '', notes: '' });
      setShowForm(false);
      await loadPayments();
    }
    setSubmitting(false);
  }

  const paidTotal = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const remaining = totalAmount ? totalAmount - paidTotal : null;

  if (loading) {
    return <div className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div>;
  }

  return (
    <div>
      {/* Summary */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {totalAmount && (
          <div className="rounded-xl border p-4 text-center" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-2xl font-light" style={{ color: 'var(--text-primary)' }}>${totalAmount}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total</p>
          </div>
        )}
        <div className="rounded-xl border p-4 text-center" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-2xl font-light" style={{ color: 'var(--accent)' }}>${paidTotal}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Paid</p>
        </div>
        {remaining !== null && (
          <div className="rounded-xl border p-4 text-center" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-2xl font-light" style={{ color: remaining > 0 ? '#ef4444' : 'var(--text-primary)' }}>
              ${remaining}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{remaining > 0 ? 'Remaining' : 'Settled'}</p>
          </div>
        )}
      </div>

      {/* Payment history */}
      {payments.length > 0 && (
        <div className="mb-6 space-y-2">
          <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Payment History</h3>
          {payments.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl border px-4 py-3"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  ${p.amount} {p.currency}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {p.payment_method}{p.transaction_id ? ` · ${p.transaction_id}` : ''}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {new Date(p.created_at).toLocaleDateString()}
                </p>
              </div>
              <StatusBadge status={p.status} />
            </div>
          ))}
        </div>
      )}

      {payments.length === 0 && !showForm && (
        <p className="mb-4 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          No payments recorded yet.
        </p>
      )}

      {/* Account info */}
      {!showForm && (
        <div className="mb-4 rounded-xl border p-4" style={{ backgroundColor: 'var(--accent-light)', borderColor: 'var(--accent)' }}>
          <p className="text-xs font-medium" style={{ color: 'var(--accent)' }}>Payment Options</p>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
            Bank transfer, SadaPay, or Zindagi accepted. Account details will be shared after order approval.
          </p>
        </div>
      )}

      {/* Submit payment button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="rounded-xl border px-4 py-2 text-sm transition-all"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          + Submit Payment Proof
        </button>
      )}

      {/* Payment form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border p-4"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={form.amount}
              onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))}
              placeholder="Amount paid"
              type="number"
              step="0.01"
              className="rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              required
            />
            <input
              value={form.payment_method}
              onChange={(e) => setForm(p => ({ ...p, payment_method: e.target.value }))}
              placeholder="Method (e.g. SadaPay, JazzCash)"
              className="rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
            <input
              value={form.transaction_id}
              onChange={(e) => setForm(p => ({ ...p, transaction_id: e.target.value }))}
              placeholder="Transaction ID"
              className="rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
            <input
              value={form.proof_url}
              onChange={(e) => setForm(p => ({ ...p, proof_url: e.target.value }))}
              placeholder="Screenshot/proof URL"
              className="rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
            <input
              value={form.account_details}
              onChange={(e) => setForm(p => ({ ...p, account_details: e.target.value }))}
              placeholder="Account sent from"
              className="rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none sm:col-span-2"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}
            >
              {submitting ? 'Submitting...' : 'Submit Payment'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border px-4 py-2 text-sm"
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
