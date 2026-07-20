import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { indexProfileContent } from '@/lib/ai/rag';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const { data, error: _error } = await supabase.from('profile_content').select('*').eq('id', id).single();
      if (_error) return NextResponse.json({ error: _error.message }, { status: 404 });
      return NextResponse.json(data);
    }

    const { data, error: _error } = await supabase.from('profile_content').select('*').order('section_name');
    if (_error) return NextResponse.json({ error: _error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { section_name, content } = body;

    if (!section_name || typeof section_name !== 'string') {
      return NextResponse.json({ error: 'section_name is required' }, { status: 400 });
    }
    if (content === undefined || typeof content !== 'string') {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error: _insertError } = await supabase
      .from('profile_content')
      .insert({ section_name, content })
      .select()
      .single();

    if (_insertError) return NextResponse.json({ error: _insertError.message }, { status: 500 });

    // Generate vector embeddings
    try {
      await indexProfileContent(data.id, content);
    } catch (embedError) {
      console.error('Failed to index profile embeddings:', embedError);
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, section_name, content } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const updates: Record<string, unknown> = {};
    if (section_name !== undefined) updates.section_name = section_name;
    if (content !== undefined) updates.content = content;

    const { data, error: _updateError } = await supabase
      .from('profile_content')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (_updateError) return NextResponse.json({ error: _updateError.message }, { status: 500 });

    // Re-generate vector embeddings if content changed
    if (content !== undefined) {
      try {
        await indexProfileContent(data.id, data.content);
      } catch (embedError) {
        console.error('Failed to re-index profile embeddings:', embedError);
      }
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error: _deleteError } = await supabase.from('profile_content').delete().eq('id', id);

    if (_deleteError) return NextResponse.json({ error: _deleteError.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
