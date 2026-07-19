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
      .from('payments')
      .select('*, milestone:project_milestones(title)')
      .eq('project_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error('Payments list error:', err);
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
    if (!body.amount) {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
    }

    // Verify project
    const { data: project } = await supabase
      .from('projects')
      .select('client_id')
      .eq('id', id)
      .single();

    if (!project || project.client_id !== user.id) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('payments')
      .insert({
        project_id: id,
        milestone_id: body.milestone_id || null,
        client_id: user.id,
        amount: body.amount,
        currency: body.currency || 'USD',
        status: 'pending',
        payment_method: body.payment_method || '',
        transaction_id: body.transaction_id || '',
        proof_url: body.proof_url || '',
        account_details: body.account_details || '',
        notes: body.notes || '',
      })
      .select()
      .single();

    if (error) throw error;

    // Add timeline event
    await supabase.from('project_timeline_events').insert({
      project_id: id,
      event_type: 'payment_made',
      description: `Payment of $${body.amount} submitted (${body.payment_method || 'pending details'})`,
    }).maybeSingle();

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Payment submit error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
