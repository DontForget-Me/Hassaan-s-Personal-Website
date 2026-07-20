import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // Get the gig to find its service_type (slug)
    const { data: gig, error: gigError } = await supabase
      .from('gigs')
      .select('slug')
      .eq('id', id)
      .single();

    if (gigError || !gig) {
      return NextResponse.json({ error: 'Gig not found' }, { status: 404 });
    }

    // Fetch templates for that service type
    const { data, error } = await supabase
      .from('gig_feature_templates')
      .select('*')
      .eq('service_type', gig.slug)
      .order('sort_order');

    if (error) throw error;

    // Group by tier
    const grouped = { basic: [] as string[], standard: [] as string[], premium: [] as string[] };
    for (const t of data ?? []) {
      const tier = t.tier as keyof typeof grouped;
      if (grouped[tier]) grouped[tier].push(t.feature);
    }

    return NextResponse.json(grouped);
  } catch (err) {
    console.error('Templates error:', err);
    return NextResponse.json({ error: 'Failed to load templates' }, { status: 500 });
  }
}
