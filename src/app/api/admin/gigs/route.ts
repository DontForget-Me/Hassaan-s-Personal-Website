import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('gigs')
      .select('*, packages:gig_packages(*)')
      .order('sort_order');
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error('Admin gigs error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();

    if (!body.title || !body.slug) {
      return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('gigs')
      .insert({
        title: body.title,
        slug: body.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        description: body.description || '',
        icon: body.icon || '📋',
        is_active: body.is_active ?? true,
        sort_order: body.sort_order || 0,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('Admin gig create error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
