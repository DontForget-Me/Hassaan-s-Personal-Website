import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id, full_name, role, created_at,
        projects:projects(count),
        orders:client_orders(count)
      `)
      .eq('role', 'client')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error('Admin clients error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
