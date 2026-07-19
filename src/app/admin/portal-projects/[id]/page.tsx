'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminNav from '@/components/admin/AdminNav';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import StatusBadge from '@/components/client/StatusBadge';
import KanbanBoard from '@/components/client/KanbanBoard';
import TimeTracking from '@/components/client/TimeTracking';

type TabId = 'overview' | 'milestones' | 'kanban' | 'messages' | 'extensions' | 'payments' | 'time';

export default function AdminProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [updating, setUpdating] = useState(false);

  useEffect(() => { load(); }, [id]);

  async function load() {
    const supabase = createAdminClient();
    const { data: project } = await supabase
      .from('projects')
      .select('*, client:profiles(full_name, email), milestones:project_milestones(*), timeline:project_timeline_events(*)')
      .eq('id', id)
      .single();

    if (!project) { setLoading(false); return; }

    const { data: extensions } = await supabase
      .from('extension_requests')
      .select('*, milestone:project_milestones(title)')
      .eq('project_id', id)
      .order('created_at', { ascending: false });

    const { data: payments } = await supabase
      .from('payments')
      .select('*, milestone:project_milestones(title)')
      .eq('project_id', id)
      .order('created_at', { ascending: false });

    const { data: messages } = await supabase
      .from('project_messages')
      .select('*, sender:profiles(full_name)')
      .eq('project_id', id)
      .order('created_at', { ascending: true });

    setData({ ...project, extensions: extensions ?? [], payments: payments ?? [], messages: messages ?? [] });
    setLoading(false);
  }

  async function updateProject(updates: any) {
    setUpdating(true);
    await fetch(`/api/admin/portal-projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    setUpdating(false);
    await load();
  }

  async function createMilestone() {
    const title = prompt('Milestone title:');
    if (!title) return;
    const amount = prompt('Amount (optional):') || undefined;
    const deadline = prompt('Deadline (YYYY-MM-DD, optional):') || undefined;
    await fetch('/api/admin/milestones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: id, title, amount: amount ? parseFloat(amount) : null, deadline: deadline || null }),
    });
    await load();
  }

  async function updateMilestone(msId: string, updates: any) {
    await fetch(`/api/admin/milestones/${msId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    await load();
  }

  async function deleteMilestone(msId: string) {
    if (!confirm('Delete this milestone?')) return;
    await fetch(`/api/admin/milestones/${msId}`, { method: 'DELETE' });
    await load();
  }

  async function handleExtension(extId: string, status: string) {
    const notes = prompt('Response notes (optional):') || '';
    await fetch(`/api/admin/extensions/${extId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, response_notes: notes }),
    });
    await load();
  }

  async function handlePayment(payId: string, status: string) {
    const notes = prompt('Notes (optional):') || '';
    await fetch(`/api/admin/payments/${payId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    });
    await load();
  }

  if (loading) {
    return <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AdminNav />
      <div className="flex items-center justify-center py-24 text-sm" style={{ color: 'var(--text-muted)' }}>Loading...</div>
    </div>;
  }

  if (!data) {
    return <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AdminNav />
      <div className="text-center py-24 text-sm" style={{ color: 'var(--text-muted)' }}>Project not found.</div>
    </div>;
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'milestones', label: `Milestones (${data.milestones?.length ?? 0})` },
    { id: 'kanban', label: 'Kanban' },
    { id: 'messages', label: `Messages (${data.messages?.length ?? 0})` },
    { id: 'extensions', label: `Extensions (${data.extensions?.length ?? 0})` },
    { id: 'payments', label: `Payments (${data.payments?.length ?? 0})` },
    { id: 'time', label: 'Time' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AdminNav />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Link href="/admin/portal-projects" className="text-sm transition-colors" style={{ color: 'var(--text-muted)' }}>
          &larr; Back to Projects
        </Link>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-light sm:text-2xl" style={{ color: 'var(--text-primary)' }}>
              {data.title}
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Client: {data.client?.full_name || 'Unknown'} · {data.client?.email || ''}
            </p>
          </div>
          <StatusBadge status={data.status} />
        </div>

        {/* Status quick change */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Status:</span>
          {['in_progress', 'completed', 'paused', 'cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => updateProject({ status: s })}
              disabled={updating || data.status === s}
              className="rounded-lg px-2.5 py-1 text-xs transition-all disabled:opacity-40 capitalize"
              style={{
                backgroundColor: data.status === s ? 'var(--accent-light)' : 'var(--bg-tertiary)',
                color: data.status === s ? 'var(--accent)' : 'var(--text-muted)',
                border: '1px solid',
                borderColor: data.status === s ? 'var(--accent)' : 'transparent',
              }}
            >
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 border-b" style={{ borderColor: 'var(--border)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2.5 text-sm transition-colors -mb-px"
              style={{
                color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
                fontWeight: activeTab === tab.id ? 500 : 400,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Project Settings</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs" style={{ color: 'var(--text-muted)' }}>Title</label>
                    <input defaultValue={data.title}
                      onBlur={(e) => { if (e.target.value !== data.title) updateProject({ title: e.target.value }); }}
                      className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                      style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs" style={{ color: 'var(--text-muted)' }}>Total Amount</label>
                    <input type="number" defaultValue={data.total_amount ?? ''}
                      onBlur={(e) => updateProject({ total_amount: e.target.value ? parseFloat(e.target.value) : null })}
                      className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                      style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs" style={{ color: 'var(--text-muted)' }}>Deadline</label>
                    <input type="date" defaultValue={data.deadline?.split('T')[0] ?? ''}
                      onBlur={(e) => updateProject({ deadline: e.target.value || null })}
                      className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                      style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs" style={{ color: 'var(--text-muted)' }}>Penalty per day ($)</label>
                    <input type="number" defaultValue={data.penalty_per_day ?? 0}
                      onBlur={(e) => updateProject({ penalty_per_day: parseFloat(e.target.value) || 0 })}
                      className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                      style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs" style={{ color: 'var(--text-muted)' }}>Description</label>
                    <textarea defaultValue={data.description}
                      onBlur={(e) => { if (e.target.value !== data.description) updateProject({ description: e.target.value }); }}
                      className="mt-1 w-full rounded-xl border px-3 py-2 text-sm resize-none"
                      style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Timeline</h3>
                <div className="mt-3 space-y-2">
                  {data.timeline?.slice(0, 10).map((e: any) => (
                    <div key={e.id} className="flex gap-2 text-xs">
                      <span style={{ color: 'var(--text-muted)' }}>{new Date(e.created_at).toLocaleDateString()}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{e.description}</span>
                    </div>
                  ))}
                  {(!data.timeline || data.timeline.length === 0) && (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No timeline events.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MILESTONES TAB */}
          {activeTab === 'milestones' && (
            <div>
              <button onClick={createMilestone}
                className="mb-4 rounded-xl px-4 py-2 text-sm font-medium text-white"
                style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}>
                + Add Milestone
              </button>

              <div className="space-y-2">
                {data.milestones?.map((ms: any) => (
                  <div key={ms.id} className="rounded-xl border p-4"
                    style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{ms.title}</p>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                          {ms.amount && <span>${ms.amount}</span>}
                          {ms.deadline && <span>Due: {new Date(ms.deadline).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={ms.status} />
                        <select
                          value={ms.status}
                          onChange={(e) => updateMilestone(ms.id, { status: e.target.value })}
                          className="rounded-lg border px-2 py-1 text-xs"
                          style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        <button onClick={() => deleteMilestone(ms.id)}
                          className="rounded-lg px-2 py-1 text-xs"
                          style={{ color: '#ef4444' }}>
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {(!data.milestones || data.milestones.length === 0) && (
                  <p className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No milestones yet.</p>
                )}
              </div>
            </div>
          )}

          {/* MESSAGES TAB */}
          {activeTab === 'messages' && (
            <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="max-h-96 space-y-3 overflow-y-auto">
                {data.messages?.map((msg: any) => (
                  <div key={msg.id}>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      {msg.sender?.full_name || 'Unknown'} · {new Date(msg.created_at).toLocaleString()}
                    </p>
                    <p className="mt-0.5 text-sm" style={{ color: 'var(--text-primary)' }}>{msg.content}</p>
                  </div>
                ))}
                {(!data.messages || data.messages.length === 0) && (
                  <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>No messages.</p>
                )}
              </div>
            </div>
          )}

          {/* EXTENSIONS TAB */}
          {activeTab === 'extensions' && (
            <div className="space-y-3">
              {data.extensions?.map((ext: any) => (
                <div key={ext.id} className="rounded-xl border p-4"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{ext.reason}</p>
                      <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {ext.old_deadline ? new Date(ext.old_deadline).toLocaleDateString() : 'N/A'} → {new Date(ext.new_deadline).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={ext.status} />
                      {ext.status === 'pending' && (
                        <>
                          <button onClick={() => handleExtension(ext.id, 'approved')}
                            className="rounded-lg px-3 py-1 text-xs font-medium text-white"
                            style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}>
                            Approve
                          </button>
                          <button onClick={() => handleExtension(ext.id, 'rejected')}
                            className="rounded-lg border px-3 py-1 text-xs"
                            style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  {ext.response_notes && (
                    <p className="mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>Notes: {ext.response_notes}</p>
                  )}
                </div>
              ))}
              {(!data.extensions || data.extensions.length === 0) && (
                <p className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No extension requests.</p>
              )}
            </div>
          )}

          {/* KANBAN TAB */}
          {activeTab === 'kanban' && (
            <KanbanBoard
              milestones={data.milestones ?? []}
              onUpdateStatus={async (msId, status) => { await updateMilestone(msId, { status }); }}
            />
          )}

          {/* TIME TAB */}
          {activeTab === 'time' && (
            <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
              <TimeTracking projectId={id} milestones={data.milestones ?? []} />
            </div>
          )}

          {/* PAYMENTS TAB */}
          {activeTab === 'payments' && (
            <div className="space-y-3">
              {data.payments?.map((pay: any) => (
                <div key={pay.id} className="rounded-xl border p-4"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        ${pay.amount} {pay.currency}
                      </p>
                      <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {pay.payment_method}{pay.transaction_id ? ` · ${pay.transaction_id}` : ''}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(pay.created_at).toLocaleDateString()}
                      </p>
                      {pay.proof_url && (
                        <a href={pay.proof_url} target="_blank" rel="noopener noreferrer"
                          className="mt-1 inline-block text-xs" style={{ color: 'var(--accent)' }}>
                          View proof &nearr;
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge status={pay.status} />
                      {pay.status === 'pending' && (
                        <>
                          <button onClick={() => handlePayment(pay.id, 'paid')}
                            className="rounded-lg px-3 py-1 text-xs font-medium text-white"
                            style={{ background: 'linear-gradient(135deg, var(--accent), #d946ef)' }}>
                            Confirm
                          </button>
                          <button onClick={() => handlePayment(pay.id, 'failed')}
                            className="rounded-lg border px-3 py-1 text-xs"
                            style={{ borderColor: '#ef4444', color: '#ef4444' }}>
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {(!data.payments || data.payments.length === 0) && (
                <p className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No payments recorded.</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
