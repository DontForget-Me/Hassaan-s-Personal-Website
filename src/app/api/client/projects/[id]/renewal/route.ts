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

    // Get original project
    const { data: project } = await supabase
      .from('portal_projects')
      .select('client_id, title, description')
      .eq('id', id)
      .single();

    if (!project || project.client_id !== user.id) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Create a new order referencing this project
    const { data, error } = await supabase
      .from('client_orders')
      .insert({
        client_id: user.id,
        service_type: 'renewal',
        title: `Renewal: ${project.title}`,
        description: `Renewal of existing project. Original description: ${project.description || ''}`,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Add timeline event
    await supabase.from('project_timeline_events').insert({
      project_id: id,
      event_type: 'project_completed',
      description: 'Renewal requested — new order created',
    }).maybeSingle();

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Renewal error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
