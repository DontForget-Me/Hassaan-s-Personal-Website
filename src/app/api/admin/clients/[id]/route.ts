import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Orders
    const { data: orders } = await supabase
      .from('client_orders')
      .select('*')
      .eq('client_id', id)
      .order('created_at', { ascending: false });

    // Projects
    const { data: projects } = await supabase
      .from('projects')
      .select('*, milestones:project_milestones(count)')
      .eq('client_id', id)
      .order('created_at', { ascending: false });

    // Payments
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('client_id', id)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      profile,
      orders: orders ?? [],
      projects: projects ?? [],
      payments: payments ?? [],
    });
  } catch (err) {
    console.error('Admin client detail error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
