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

    if (!body.status || !['approved', 'rejected'].includes(body.status)) {
      return NextResponse.json(
        { error: 'Status must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    const { data: ext, error: fetchError } = await supabase
      .from('extension_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !ext) {
      return NextResponse.json({ error: 'Extension request not found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('extension_requests')
      .update({
        status: body.status,
        response_notes: body.response_notes || '',
        responded_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // If approved, update the project deadline
    if (body.status === 'approved') {
      await supabase
        .from('portal_projects')
        .update({ deadline: ext.new_deadline })
        .eq('id', ext.project_id);
    }

    // Add timeline event
    await supabase.from('project_timeline_events').insert({
      project_id: ext.project_id,
      event_type: body.status === 'approved' ? 'extension_approved' : 'extension_requested',
      description: body.status === 'approved'
        ? `Extension approved — new deadline: ${new Date(ext.new_deadline).toLocaleDateString()}`
        : `Extension rejected: ${body.response_notes || 'No reason given'}`,
    }).maybeSingle();

    return NextResponse.json(data);
  } catch (err) {
    console.error('Extension update error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
