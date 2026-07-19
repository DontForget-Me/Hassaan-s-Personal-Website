import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('gigs')
      .select('*, packages:gig_packages(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === '42P01') return NextResponse.json({ error: 'No gigs available' }, { status: 404 });
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (err) {
    console.error('Gig detail error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
