import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { indexProject } from '@/lib/ai/rag';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const { data, error: _err } = await supabase.from('projects').select('*').eq('id', id).single();
      if (_err) return NextResponse.json({ error: _err.message }, { status: 404 });
      return NextResponse.json(data);
    }

    const { data, error: _err } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (_err) return NextResponse.json({ error: _err.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, tech_stack, github_url } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error: _insertErr } = await supabase
      .from('projects')
      .insert({
        title,
        description: description ?? '',
        tech_stack: tech_stack ?? [],
        github_url: github_url ?? '',
      })
      .select()
      .single();

    if (_insertErr) return NextResponse.json({ error: _insertErr.message }, { status: 500 });

    // Generate vector embeddings
    try {
      await indexProject(data.id, title, description ?? '');
    } catch (embedError) {
      console.error('Failed to index project embeddings:', embedError);
      // Don't fail the request — the project was saved
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, tech_stack, github_url } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (tech_stack !== undefined) updates.tech_stack = tech_stack;
    if (github_url !== undefined) updates.github_url = github_url;

    const { data, error: _updateErr } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (_updateErr) return NextResponse.json({ error: _updateErr.message }, { status: 500 });

    // Re-generate vector embeddings if content changed
    if (title !== undefined || description !== undefined) {
      try {
        await indexProject(data.id, data.title, data.description);
      } catch (embedError) {
        console.error('Failed to re-index project embeddings:', embedError);
      }
    }

    return NextResponse.json(data);
  } catch (error) {
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
    // CASCADE delete will handle embeddings
    const { error: _deleteErr } = await supabase.from('projects').delete().eq('id', id);

    if (_deleteErr) return NextResponse.json({ error: _deleteErr.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
