import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('extension_requests')
      .select('*, project:projects(title), milestone:project_milestones(title)')
      .order('created_at', { ascending: false });

    // Filter to only the user's projects' extensions
    const filtered = (data ?? []).filter(
      (ext: any) => ext.project?.client_id === user.id
    );

    if (error) throw error;
    return NextResponse.json(filtered);
  } catch (err) {
    console.error('Extensions list error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
