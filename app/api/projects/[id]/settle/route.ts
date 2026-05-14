import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';
import { AuthService } from '@/lib/services/authService';
import { AuditService } from '@/lib/services/auditService';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getServerClient();
    const authService = new AuthService(supabase);
    const auditService = new AuditService(supabase);

    const { error: authError, user } = await authService.checkOwner();
    if (authError) return authError;

    const projectId = params.id;
    const body = await request.json();

    // 1. Mark project as completed with actual end date
    const { error: projectError } = await (supabase.from('projects') as any)
      .update({
        status: 'completed',
        actual_end_date: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (projectError) throw projectError;

    // ISSUE-06 FIX: Mark all non-paid milestones as 'paid' (write-off on settlement).
    // Without this, dashboard alerts keep firing for milestones on a closed project.
    const { error: milestoneError } = await (supabase.from('milestones') as any)
      .update({ status: 'paid' })
      .eq('project_id', projectId)
      .neq('status', 'paid'); // Only update the ones that aren't already paid

    if (milestoneError) {
      // Non-fatal: log but don't fail the settlement — project is already marked complete
      console.warn('Could not update milestone statuses during settlement:', milestoneError.message);
    }

    // 2. Mark all outstanding expenses as written off (partial -> paid with write-off note)
    await (supabase.from('expenses') as any)
      .update({
        payment_status: 'paid',
        notes: 'Written off during project settlement',
      })
      .eq('project_id', projectId)
      .in('payment_status', ['unpaid', 'partial']);

    // 3. Log settlement event in audit trail
    await auditService.logAction({
      table_name: 'projects',
      record_id: projectId,
      action: 'SETTLEMENT',
      new_data: {
        status: 'completed',
        settled_at: new Date().toISOString(),
        write_off_reason: body.write_off_reason ?? 'Project finalized via Settlement Wizard',
      },
      reason: 'Project finalized via Settlement Wizard',
      performed_by: user!.id,
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
