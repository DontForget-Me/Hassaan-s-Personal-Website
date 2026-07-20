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
      .from('gig_packages')
      .select('*')
      .eq('gig_id', id)
      .order('sort_order');
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error('Packages list error:', err);
    return NextResponse.json({ error: 'Failed to load packages' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('gig_packages')
      .insert({
        gig_id: id,
        name: body.name || 'basic',
        price: body.price || 0,
        delivery_days: body.delivery_days || null,
        features: body.features || [],
        is_popular: body.is_popular || false,
        sort_order: body.sort_order || 0,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Package create error:', err);
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 });
  }
}
