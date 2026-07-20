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
      .from('project_files')
      .select('*, uploader:profiles(full_name)')
      .eq('project_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error('Files list error:', err);
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
    if (!body.file_name || !body.file_url) {
      return NextResponse.json(
        { error: 'File name and URL are required' },
        { status: 400 }
      );
    }

    // Verify project access
    const { data: project } = await supabase
      .from('portal_projects')
      .select('client_id')
      .eq('id', id)
      .single();

    if (!project || project.client_id !== user.id) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('project_files')
      .insert({
        project_id: id,
        uploader_id: user.id,
        file_name: body.file_name,
        file_url: body.file_url,
        file_size: body.file_size || null,
        mime_type: body.mime_type || '',
        expires_at: body.expires_at || null,
      })
      .select('*, uploader:profiles(full_name)')
      .single();

    if (error) throw error;

    // Add timeline event
    await supabase.from('project_timeline_events').insert({
      project_id: id,
      event_type: 'file_upload',
      description: `File uploaded: ${body.file_name}`,
    }).maybeSingle();

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('File upload error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
