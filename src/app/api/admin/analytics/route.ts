import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();

    // Revenue
    const { data: paidPayments } = await supabase
      .from('payments')
      .select('amount, paid_at, created_at')
      .eq('status', 'paid');

    const totalRevenue = (paidPayments ?? []).reduce((s, p) => s + (p.amount || 0), 0);

    // Monthly revenue (last 6 months)
    const monthlyRevenue: Record<string, number> = {};
    for (const p of paidPayments ?? []) {
      const d = new Date(p.paid_at || p.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyRevenue[key] = (monthlyRevenue[key] || 0) + (p.amount || 0);
    }

    // Project stats
    const { data: allProjects } = await supabase
      .from('projects')
      .select('status, total_amount, created_at');

    const totalProjects = allProjects?.length ?? 0;
    const activeProjects = allProjects?.filter(p => p.status === 'in_progress').length ?? 0;
    const completedProjects = allProjects?.filter(p => p.status === 'completed').length ?? 0;
    const pausedProjects = allProjects?.filter(p => p.status === 'paused').length ?? 0;

    // Client stats
    const { count: totalClients } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'client');

    const { count: newClientsThisMonth } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'client')
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

    // Order stats
    const { data: allOrders } = await supabase
      .from('client_orders')
      .select('status');

    const pendingOrders = allOrders?.filter(o => o.status === 'pending').length ?? 0;
    const approvedOrders = allOrders?.filter(o => o.status === 'approved').length ?? 0;

    // Milestone stats
    const { data: allMilestones } = await supabase
      .from('project_milestones')
      .select('status');

    const completedMilestones = allMilestones?.filter(m => m.status === 'approved').length ?? 0;
    const totalMilestones = allMilestones?.length ?? 0;

    // Average project value
    const avgProjectValue = allProjects && allProjects.length > 0
      ? allProjects.reduce((s, p) => s + (p.total_amount || 0), 0) / allProjects.length
      : 0;

    return NextResponse.json({
      revenue: {
        total: totalRevenue,
        monthly: Object.entries(monthlyRevenue)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, amount]) => ({ month, amount })),
      },
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        paused: pausedProjects,
      },
      clients: {
        total: totalClients ?? 0,
        newThisMonth: newClientsThisMonth ?? 0,
      },
      orders: {
        pending: pendingOrders,
        approved: approvedOrders,
      },
      milestones: {
        total: totalMilestones,
        completed: completedMilestones,
        completionRate: totalMilestones > 0
          ? Math.round((completedMilestones / totalMilestones) * 100)
          : 0,
      },
      averageProjectValue: avgProjectValue,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
