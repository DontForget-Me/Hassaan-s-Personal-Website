import AdminNav from '@/components/admin/AdminNav';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

async function getStats() {
  const supabase = createAdminClient();

  const { count: projectCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true });

  const { count: portalProjectCount } = await supabase
    .from('portal_projects')
    .select('*', { count: 'exact', head: true });

  const { count: profileCount } = await supabase
    .from('profile_content')
    .select('*', { count: 'exact', head: true });

  const { count: chatCount } = await supabase
    .from('ai_chat_logs')
    .select('*', { count: 'exact', head: true });

  const { count: pendingOrders } = await supabase
    .from('service_orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  return {
    projects: projectCount ?? 0,
    portalProjects: portalProjectCount ?? 0,
    profileSections: profileCount ?? 0,
    totalChats: chatCount ?? 0,
    pendingOrders: pendingOrders ?? 0,
  };
}

const cards = [
  { key: 'portalProjects', label: 'Portal Projects', href: '/admin/portal-projects' },
  { key: 'projects', label: 'Portfolio Projects', href: '/admin/projects' },
  { key: 'totalChats', label: 'AI Messages Logged', href: '/admin/ai-logs' },
  { key: 'pendingOrders', label: 'Pending Orders', href: '/admin/orders', highlight: true },
] as const;

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AdminNav />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <h1 className="text-xl font-light sm:text-2xl" style={{ color: 'var(--text-primary)' }}>
          Dashboard
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Overview of your portfolio.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => {
            const value = stats[card.key as keyof typeof stats];
            return (
              <a
                key={card.key}
                href={card.href}
                className="rounded-2xl border p-6 transition-all duration-200"
                style={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'highlight' in card && card.highlight && value > 0 ? 'var(--accent)' : 'var(--border)',
                }}
              >
                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {card.label}
                </p>
                <p className="mt-1 text-3xl font-light" style={{
                  color: 'highlight' in card && card.highlight && value > 0 ? 'var(--accent)' : 'var(--text-primary)',
                }}>
                  {value}
                </p>
              </a>
            );
          })}
        </div>
      </main>
    </div>
  );
}
