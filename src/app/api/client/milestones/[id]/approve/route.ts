import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

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

    // Get milestone with project
    const { data: milestone, error: mError } = await supabase
      .from('project_milestones')
      .select('*, project:projects(client_id, title)')
      .eq('id', id)
      .single();

    if (mError || !milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    if (milestone.project.client_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (milestone.status !== 'completed') {
      return NextResponse.json(
        { error: 'Only completed milestones can be approved' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('project_milestones')
      .update({ status: 'approved', completed_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Add timeline event
    await supabase.from('project_timeline_events').insert({
      project_id: milestone.project_id,
      event_type: 'milestone_approved',
      description: `Milestone "${milestone.title}" approved`,
    }).maybeSingle();

    return NextResponse.json(data);
  } catch (err) {
    console.error('Milestone approve error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
