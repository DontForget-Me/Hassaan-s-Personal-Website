import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();

    if (!body.project_id || !body.title) {
      return NextResponse.json(
        { error: 'Project ID and title are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('project_milestones')
      .insert({
        project_id: body.project_id,
        title: body.title,
        description: body.description || '',
        amount: body.amount || null,
        deadline: body.deadline || null,
        status: body.status || 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Admin milestone create error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
