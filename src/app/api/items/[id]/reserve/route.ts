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

    // First, check if the item is already reserved
    const { data: existingItem, error: checkError } = await supabase
      .from('items')
      .select(`
        *,
        author:users!items_author_id_fkey(id, name),
        gifter:users!items_gifter_id_fkey(id, name)
      `)
      .eq('id', itemId)
      .single();

    if (checkError) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Check if already reserved
    if (existingItem.gifter_id) {
      return NextResponse.json({ 
        error: 'This gift has already been reserved by someone else! 🎅',
        item: existingItem,
        alreadyReserved: true
      }, { status: 409 }); // 409 Conflict
    }

    // Reserve the item (only if not already reserved)
    const { data: item, error } = await supabase
      .from('items')
      .update({
        gifter_id: gifter.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId)
      .is('gifter_id', null) // Additional safety check
      .select(`
        *,
        author:users!items_author_id_fkey(id, name),
        gifter:users!items_gifter_id_fkey(id, name)
      `)
      .single();

    if (error) {
      // If the update failed (likely due to race condition), check again
      const { data: reCheckItem } = await supabase
        .from('items')
        .select(`
          *,
          author:users!items_author_id_fkey(id, name),
          gifter:users!items_gifter_id_fkey(id, name)
        `)
        .eq('id', itemId)
        .single();

      if (reCheckItem?.gifter_id) {
        return NextResponse.json({ 
          error: 'This gift was just reserved by someone else! 🎅',
          item: reCheckItem,
          alreadyReserved: true
        }, { status: 409 });
      }
      
      throw error;
    }

    // Double-check that the reservation was successful
    if (!item || !item.gifter_id) {
      return NextResponse.json({ 
        error: 'Failed to reserve the gift. It may have been reserved by someone else.',
        alreadyReserved: true
      }, { status: 409 });
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
