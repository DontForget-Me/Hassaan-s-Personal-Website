import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('projects')
      .select('*, client:profiles(full_name, email), milestones:project_milestones(*), timeline:project_timeline_events(*)')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { data: extensions } = await supabase
      .from('extension_requests')
      .select('*, milestone:project_milestones(title)')
      .eq('project_id', id)
      .order('created_at', { ascending: false });

    const { data: payments } = await supabase
      .from('payments')
      .select('*, milestone:project_milestones(title)')
      .eq('project_id', id)
      .order('created_at', { ascending: false });

    const { data: messages } = await supabase
      .from('project_messages')
      .select('*, sender:profiles(full_name)')
      .eq('project_id', id)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      ...data,
      extensions: extensions ?? [],
      payments: payments ?? [],
      messages: messages ?? [],
    });
  } catch (err) {
    console.error('Admin portal-project detail error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();
    const body = await request.json();

    const updates: any = {};
    const allowed = ['title', 'description', 'status', 'deadline', 'total_amount', 'penalty_per_day'];
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('Admin portal-project update error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
