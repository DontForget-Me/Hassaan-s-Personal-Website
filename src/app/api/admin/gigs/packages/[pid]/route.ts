import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ pid: string }> }
) {
  try {
    const { pid } = await params;
    const supabase = createAdminClient();
    const body = await request.json();

    const updates: any = {};
    const allowed = ['name', 'price', 'delivery_days', 'features', 'is_popular', 'sort_order'];
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    const { data, error } = await supabase
      .from('gig_packages')
      .update(updates)
      .eq('id', pid)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('Package update error:', err);
    return NextResponse.json({ error: 'Failed to update package' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ pid: string }> }
) {
  try {
    const { pid } = await params;
    const supabase = createAdminClient();
    const { error } = await supabase.from('gig_packages').delete().eq('id', pid);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Package delete error:', err);
    return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 });
  }
}
