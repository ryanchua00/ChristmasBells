import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { generateGiftAssignments, getUserAssignments } from '../../../lib/assignmentGenerator';

export async function POST(request: NextRequest) {
  try {
    // Generate new assignments
    const assignments = generateGiftAssignments();
    const userAssignments = getUserAssignments(assignments);
    
    // Update each user's assigned_users column
    const updatePromises = userAssignments.map(async (userAssignment) => {
      const { error } = await supabase
        .from('users')
        .update({ assigned_users: userAssignment.givesTo })
        .eq('id', userAssignment.userId);
      
      if (error) {
        throw error;
      }
      
      return userAssignment;
    });
    
    const updatedAssignments = await Promise.all(updatePromises);
    
    return NextResponse.json({ 
      success: true, 
      assignments: updatedAssignments,
      message: 'Gift assignments generated and saved successfully'
    });
  } catch (error) {
    console.error('Error generating assignments:', error);
    return NextResponse.json({ 
      error: 'Failed to generate assignments',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Fetch current assignments from users table
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, assigned_users')
      .order('id');
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ 
      success: true, 
      users: users || [],
      message: 'Current assignments retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch assignments',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
