import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('client_orders')
      .select('*')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error('Orders list error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.service_type) {
      return NextResponse.json(
        { error: 'Service type is required.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('client_orders')
      .insert({
        client_id: user.id,
        service_type: body.service_type,
        title: body.title || '',
        description: body.description || '',
        budget_amount: body.budget_amount || null,
        budget_currency: body.budget_currency || 'USD',
        timeline_days: body.timeline_days || null,
        gig_id: body.gig_id || null,
        package_name: body.package_name || null,
        package_price: body.package_price || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Order create error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
