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
      .from('portal_projects')
      .select(`
        *,
        milestones:project_milestones(*),
        timeline:project_timeline_events(*)
      `)
      .eq('id', id)
      .eq('client_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Project detail error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
