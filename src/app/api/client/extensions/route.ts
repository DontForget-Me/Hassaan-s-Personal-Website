import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('extension_requests')
      .select('*, project:portal_projects(title, client_id), milestone:project_milestones(title)')
      .order('created_at', { ascending: false });

    // Filter to only the user's projects' extensions
    const filtered = (data ?? []).filter(
      (ext) => ext.project?.client_id === user.id
    );

    if (error) throw error;
    return NextResponse.json(filtered);
  } catch (err) {
    console.error('Extensions list error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
