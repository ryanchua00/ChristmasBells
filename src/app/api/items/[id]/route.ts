import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { item_name, link, price_range, image_url } = await request.json();
    const itemId = parseInt(params.id);

    if (!item_name?.trim()) {
      return NextResponse.json({ error: 'Item name is required' }, { status: 400 });
    }

    const { data: item, error } = await supabase
      .from('items')
      .update({
        item_name: item_name.trim(),
        link: link?.trim() || null,
        price_range: price_range?.trim() || null,
        image_url: image_url?.trim() || null,
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
    console.error('Error updating item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const itemId = parseInt(params.id);

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
