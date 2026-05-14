import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';
import { checkRole } from '@/lib/auth-utils';

// PUT /api/projects/[id]/milestones - Bulk update/sync milestones
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error: authError, supabase, user } = await checkRole(['owner', 'accountant']);
    if (authError) return authError;

    const projectId = params.id;
    const body = await request.json();
    const { milestones, contractValue } = body;

    if (!milestones || !Array.isArray(milestones)) {
      return NextResponse.json({ error: 'Invalid milestones data' }, { status: 400 });
    }

    // 1. Get existing milestones to check for payments
    const { data: existingMilestones } = await supabase
      .from('milestones')
      .select('id, name')
      .eq('project_id', projectId);

    const { data: linkedPayments } = await supabase
      .from('income')
      .select('milestone_id')
      .eq('project_id', projectId)
      .not('milestone_id', 'is', null);

    const linkedMilestoneIds = new Set((linkedPayments as any)?.map((p: any) => p.milestone_id) || []);

    // 2. Prepare new milestone data
    const milestonesToInsert = milestones.map((m: any, index: number) => ({
      project_id: projectId,
      name: m.name,
      amount: Number(m.amount),
      percentage: (Number(m.amount) / contractValue) * 100,
      due_date: m.due_date || null,
      sort_order: index,
      status: m.status || 'pending',
    }));

    // 3. Perform atomic update using a smarter approach
    // We will separate milestones into those that already have IDs (updates) and those that don't (inserts)
    
    // First, let's identify which ones to keep/update and which to insert
    const milestonesToUpsert = milestones.map((m: any, index: number) => ({
      id: m.id, // If provided from frontend
      project_id: projectId,
      name: m.name,
      amount: Number(m.amount),
      percentage: (Number(m.amount) / (contractValue || 1)) * 100, // Prevent div by 0
      due_date: m.due_date || null,
      sort_order: index,
      status: m.status || 'pending',
    }));

    // Identify milestones to delete: those NOT in the new list AND NOT linked to payments
    const incomingIds = new Set(milestonesToUpsert.map(m => m.id).filter(id => id));
    
    const { error: deleteError } = await (supabase.from('milestones') as any)
      .delete()
      .eq('project_id', projectId)
      .not('id', 'in', Array.from(incomingIds).length > 0 ? `(${Array.from(incomingIds).join(',')})` : '(NULL)')
      .not('id', 'in', Array.from(linkedMilestoneIds).length > 0 ? `(${Array.from(linkedMilestoneIds).join(',')})` : '(NULL)');

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json({ error: 'Failed to clear old milestones. Ensure no active payments are linked to deleted stages.' }, { status: 400 });
    }

    // Upsert the new list
    const { error: upsertError } = await (supabase.from('milestones') as any)
      .upsert(milestonesToUpsert );

    if (upsertError) {
      console.error('Upsert error:', upsertError);
      throw upsertError;
    }

    return NextResponse.json({ message: 'Schedule updated successfully' });
  } catch (error) {
    console.error('Milestone sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync milestones' },
      { status: 500 }
    );
  }
}
