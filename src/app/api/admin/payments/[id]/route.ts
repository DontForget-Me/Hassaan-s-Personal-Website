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

    if (!body.status || !['paid', 'failed', 'refunded'].includes(body.status)) {
      return NextResponse.json(
        { error: 'Status must be "paid", "failed", or "refunded"' },
        { status: 400 }
      );
    }

    const updateData: any = { status: body.status };
    if (body.status === 'paid') {
      updateData.paid_at = new Date().toISOString();
    }
    if (body.notes) {
      updateData.notes = body.notes;
    }

    const { data, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Add timeline event
    const text = body.status === 'paid'
      ? `Payment of $${data.amount} confirmed`
      : `Payment of $${data.amount} marked as ${body.status}`;

    await supabase.from('project_timeline_events').insert({
      project_id: data.project_id,
      event_type: 'payment_made',
      description: text,
    }).maybeSingle();

    return NextResponse.json(data);
  } catch (err) {
    console.error('Payment update error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
