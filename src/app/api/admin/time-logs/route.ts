import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    let query = supabase
      .from('time_logs')
      .select('*, milestone:project_milestones(title)')
      .order('log_date', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error('Time logs error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    if (!body.project_id || !body.hours) {
      return NextResponse.json({ error: 'Project ID and hours are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('time_logs')
      .insert({
        project_id: body.project_id,
        milestone_id: body.milestone_id || null,
        user_id: user?.id || body.user_id,
        description: body.description || '',
        hours: parseFloat(body.hours),
        log_date: body.log_date || new Date().toISOString().split('T')[0],
      })
      .select('*, milestone:project_milestones(title)')
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Time log create error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
