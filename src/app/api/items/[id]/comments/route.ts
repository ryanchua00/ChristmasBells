import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = parseInt(params.id);
    
    if (isNaN(itemId)) {
      return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
    }

    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('item_id', itemId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }

    return NextResponse.json({ comments: comments || [] });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = parseInt(params.id);
    
    if (isNaN(itemId)) {
      return NextResponse.json({ error: 'Invalid item ID' }, { status: 400 });
    }

    const { comment_text, author_name } = await request.json();

    if (!comment_text?.trim() || !author_name?.trim()) {
      return NextResponse.json({ error: 'Comment text and author name are required' }, { status: 400 });
    }

    const normalizedAuthorName = author_name.trim().toLowerCase();

    // Check if the item exists and get the author info
    const { data: itemData, error: itemError } = await supabase
      .from('items')
      .select(`
        *,
        author:users!items_author_id_fkey(id, name)
      `)
      .eq('id', itemId)
      .single();

    if (itemError || !itemData) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Check if user is trying to comment on their own item (case-insensitive)
    if (itemData.author?.name?.toLowerCase() === normalizedAuthorName) {
      return NextResponse.json({ error: 'Cannot comment on your own items' }, { status: 403 });
    }

    // Create the comment with normalized author name
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert({
        item_id: itemId,
        author_name: normalizedAuthorName,
        comment_text: comment_text.trim()
      })
      .select()
      .single();

    if (commentError) {
      console.error('Error creating comment:', commentError);
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }

    return NextResponse.json({ comment });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}
