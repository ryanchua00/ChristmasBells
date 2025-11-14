import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { itemIds } = await request.json();

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json({ 
        error: 'Item IDs array is required' 
      }, { status: 400 });
    }

    // Fetch all comments for the provided item IDs in a single query
    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .in('item_id', itemIds)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching batch comments:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch comments' 
      }, { status: 500 });
    }

    // Group comments by item_id for easier consumption
    const commentsByItem = comments?.reduce((acc, comment) => {
      if (!acc[comment.item_id]) {
        acc[comment.item_id] = [];
      }
      acc[comment.item_id].push(comment);
      return acc;
    }, {} as Record<number, any[]>) || {};

    // Create comment counts for each item
    const commentCounts = itemIds.reduce((acc, itemId) => {
      acc[itemId] = commentsByItem[itemId]?.length || 0;
      return acc;
    }, {} as Record<number, number>);

    return NextResponse.json({ 
      success: true,
      commentsByItem,
      commentCounts
    });

  } catch (error) {
    console.error('Error in batch comments endpoint:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
