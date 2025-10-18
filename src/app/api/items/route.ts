import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    const { data: items, error } = await supabase
      .from('items')
      .select(`
        *,
        author:users!items_author_id_fkey(id, name),
        gifter:users!items_gifter_id_fkey(id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { item_name, link, price_range, image_url, author_name } = await request.json();

    if (!item_name?.trim() || !author_name?.trim()) {
      return NextResponse.json({ error: 'Item name and author name are required' }, { status: 400 });
    }

    // Validate field lengths to prevent database errors
    if (item_name.trim().length > 255) {
      return NextResponse.json({ error: 'Item name is too long (max 255 characters)' }, { status: 400 });
    }
    if (link && link.trim().length > 500) {
      return NextResponse.json({ error: 'Link is too long (max 500 characters)' }, { status: 400 });
    }
    if (price_range && price_range.trim().length > 100) {
      return NextResponse.json({ error: 'Price range is too long (max 100 characters)' }, { status: 400 });
    }
    if (image_url && image_url.trim().length > 500) {
      return NextResponse.json({ error: 'Image URL is too long (max 500 characters)' }, { status: 400 });
    }

    // Get author ID
    const { data: author, error: authorError } = await supabase
      .from('users')
      .select('id')
      .eq('name', author_name.trim())
      .single();

    if (authorError || !author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }

    const { data: item, error } = await supabase
      .from('items')
      .insert([{
        item_name: item_name.trim(),
        link: link?.trim() || null,
        price_range: price_range?.trim() || null,
        image_url: image_url?.trim() || null,
        author_id: author.id,
      }])
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
    console.error('Error creating item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
