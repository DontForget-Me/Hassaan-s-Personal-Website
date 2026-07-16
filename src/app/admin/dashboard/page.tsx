import AdminNav from '@/components/admin/AdminNav';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

async function getStats() {
  const supabase = createAdminClient();

  const { count: projectCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true });

  const { count: profileCount } = await supabase
    .from('profile_content')
    .select('*', { count: 'exact', head: true });

  const { count: chatCount } = await supabase
    .from('ai_chat_logs')
    .select('*', { count: 'exact', head: true });

  return {
    projects: projectCount ?? 0,
    profileSections: profileCount ?? 0,
    totalChats: chatCount ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  return (
    <>
      <AdminNav />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Overview of your portfolio content.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 p-6">
            <p className="text-sm text-zinc-500 font-medium">Projects</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900">{stats.projects}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 p-6">
            <p className="text-sm text-zinc-500 font-medium">Profile Sections</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900">{stats.profileSections}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 p-6">
            <p className="text-sm text-zinc-500 font-medium">AI Messages Logged</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900">{stats.totalChats}</p>
          </div>
        </div>
      </main>
    </>
  );
}
