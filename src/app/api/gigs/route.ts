import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('gigs')
      .select('*, packages:gig_packages(*)')
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      console.error('Gigs query error:', error.message);
      return NextResponse.json([]);
    }
    return NextResponse.json(data ?? []);
  } catch (err: any) {
    console.error('Gigs catch error:', err?.message || err);
    return NextResponse.json([]);
  }
}
