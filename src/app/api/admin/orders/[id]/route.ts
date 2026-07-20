import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();
    const body = await request.json();

    if (!body.status || !['approved', 'rejected', 'cancelled'].includes(body.status)) {
      return NextResponse.json(
        { error: 'Status must be "approved", "rejected", or "cancelled"' },
        { status: 400 }
      );
    }

    const { data: order, error: fetchError } = await supabase
      .from('client_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order
    const updates: Record<string, unknown> = {
      status: body.status,
      admin_notes: body.admin_notes || '',
      updated_at: new Date().toISOString(),
    };

    const { data: updatedOrder } = await supabase
      .from('client_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    // If approved, create a project
    if (body.status === 'approved' && order.client_id) {
      const { data: project } = await supabase
        .from('portal_projects')
        .insert({
          order_id: id,
          client_id: order.client_id,
          title: order.title || `${order.service_type} Project`,
          description: order.description || '',
          status: 'in_progress',
          total_amount: order.budget_amount || null,
          deadline: body.deadline || null,
        })
        .select()
        .single();

      if (project) {
        // Add timeline event
        await supabase.from('project_timeline_events').insert({
          project_id: project.id,
          event_type: 'project_started',
          description: 'Project started from approved order',
        }).maybeSingle();
      }
    }

    return NextResponse.json(updatedOrder);
  } catch (err) {
    console.error('Admin order update error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
