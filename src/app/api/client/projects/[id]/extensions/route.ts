import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('extension_requests')
      .select('*, milestone:project_milestones(title)')
      .eq('project_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error('Extensions list error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.reason || !body.new_deadline) {
      return NextResponse.json(
        { error: 'Reason and new deadline are required' },
        { status: 400 }
      );
    }

    // Get project to verify ownership and current deadline
    const { data: project } = await supabase
      .from('portal_projects')
      .select('deadline, client_id')
      .eq('id', id)
      .single();

    if (!project || project.client_id !== user.id) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('extension_requests')
      .insert({
        project_id: id,
        milestone_id: body.milestone_id || null,
        requested_by: user.id,
        reason: body.reason,
        old_deadline: body.old_deadline || project.deadline,
        new_deadline: body.new_deadline,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Add timeline event
    await supabase.from('project_timeline_events').insert({
      project_id: id,
      event_type: 'extension_requested',
      description: `Extension requested to ${new Date(body.new_deadline).toLocaleDateString()}: ${body.reason}`,
    }).maybeSingle();

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Extension request error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
