import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const normalizedName = name.trim().toLowerCase();

    // Check if user exists (case-insensitive)
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .ilike('name', normalizedName)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingUser) {
      return NextResponse.json({ user: existingUser });
    }

    // Create new user with normalized name
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{ name: normalizedName }])
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    return NextResponse.json({ user: newUser });
  } catch (error) {
    console.error('Error managing user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
