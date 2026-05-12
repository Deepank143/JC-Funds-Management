import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { checkOwner } from '@/lib/auth-utils';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error, supabase, session } = await checkOwner();
    if (error) return error;

    const projectId = params.id;
    const body = await request.json();

    // 1. Mark project as completed
    const { error: projectError } = await supabase
      .from('projects')
      .update({ 
        status: 'completed',
        actual_end_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    if (projectError) throw projectError;

    // 2. Mark all remaining milestones as 'billed' or 'paid' (logic could vary, here we just settle)
    // Actually, we'll just log this in audit log as a settlement event
    
    // 3. Log settlement event
    await supabase.from('audit_logs').insert({
      table_name: 'projects',
      record_id: projectId,
      action: 'SETTLEMENT',
      new_data: { status: 'completed', settled_at: new Date().toISOString() },
      reason: 'Project finalized via Settlement Wizard',
      performed_by: session.user.id,
    });

    return NextResponse.json({ success: true, status: 'completed' });
  } catch (error: any) {
    console.error('Project settlement error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to settle project' },
      { status: 500 }
    );
  }
}
