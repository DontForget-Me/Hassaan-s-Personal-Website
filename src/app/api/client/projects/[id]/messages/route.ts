import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('project_messages')
      .select('*, sender:profiles(full_name, avatar_url)')
      .eq('project_id', id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error('Messages list error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.content?.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // Verify user is a participant
    const { data: project } = await supabase
      .from('projects')
      .select('client_id')
      .eq('id', id)
      .single();

    if (!project || project.client_id !== user.id) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('project_messages')
      .insert({
        project_id: id,
        sender_id: user.id,
        content: body.content,
        file_attachments: body.file_attachments ?? [],
      })
      .select('*, sender:profiles(full_name, avatar_url)')
      .single();

    if (error) throw error;

    // Add timeline event
    await supabase.from('project_timeline_events').insert({
      project_id: id,
      event_type: 'message',
      description: 'New message sent',
    }).maybeSingle();

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Message send error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
