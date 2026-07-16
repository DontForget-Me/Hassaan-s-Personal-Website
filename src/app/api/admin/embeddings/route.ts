import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { indexProject, indexProfileContent } from '@/lib/ai/rag';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id } = body;

    if (!type || !id) {
      return NextResponse.json({ error: 'type and id are required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    if (type === 'project') {
      const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
      if (error || !data) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

      await indexProject(data.id, data.title, data.description);
      return NextResponse.json({ success: true, message: 'Project embeddings regenerated' });
    }

    if (type === 'profile') {
      const { data, error } = await supabase.from('profile_content').select('*').eq('id', id).single();
      if (error || !data) return NextResponse.json({ error: 'Profile content not found' }, { status: 404 });

      await indexProfileContent(data.id, data.content);
      return NextResponse.json({ success: true, message: 'Profile embeddings regenerated' });
    }

    return NextResponse.json({ error: 'Invalid type. Use "project" or "profile".' }, { status: 400 });
  } catch (error) {
    console.error('Embedding generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
