import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { gifter_name } = await request.json();
    const itemId = parseInt(params.id);

    if (!gifter_name?.trim()) {
      return NextResponse.json({ error: 'Gifter name is required' }, { status: 400 });
    }

    // Get gifter ID
    const { data: gifter, error: gifterError } = await supabase
      .from('users')
      .select('id')
      .eq('name', gifter_name.trim())
      .single();

    if (gifterError || !gifter) {
      return NextResponse.json({ error: 'Gifter not found' }, { status: 404 });
    }

    // Reserve the item
    const { data: item, error } = await supabase
      .from('items')
      .update({
        gifter_id: gifter.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId)
      .select(`
        *,
        author:users!items_author_id_fkey(id, name),
        gifter:users!items_gifter_id_fkey(id, name)
      `)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error reserving item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const itemId = parseInt(params.id);

    // Unreserve the item
    const { data: item, error } = await supabase
      .from('items')
      .update({
        gifter_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId)
      .select(`
        *,
        author:users!items_author_id_fkey(id, name),
        gifter:users!items_gifter_id_fkey(id, name)
      `)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error unreserving item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
