import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';

// PUT /api/projects/[id]/milestones - Bulk update/sync milestones
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getServerClient() as any;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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

    const linkedMilestoneIds = new Set(linkedPayments?.map((p: any) => p.milestone_id) || []);

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

    // 3. Perform atomic update using a transaction-like approach
    // In Supabase client, we'll delete non-linked ones and upsert new ones
    // Or simpler: delete all except linked, and insert all new.
    // But to keep it simple and safe for now: 
    // We'll delete all existing milestones for this project and insert new ones.
    // WARNING: This will fail if foreign key constraints are violated (i.e. linked payments).
    
    // First, delete milestones that are NOT linked to payments
    const { error: deleteError } = await supabase
      .from('milestones')
      .delete()
      .eq('project_id', projectId)
      .not('id', 'in', `(${Array.from(linkedMilestoneIds).join(',')})`);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json({ error: 'Failed to update schedule. Some milestones have recorded payments.' }, { status: 400 });
    }

    // Insert new milestones
    const { error: insertError } = await supabase
      .from('milestones')
      .insert(milestonesToInsert as any);

    if (insertError) throw insertError;

    return NextResponse.json({ message: 'Schedule updated successfully' });
  } catch (error) {
    console.error('Milestone sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync milestones' },
      { status: 500 }
    );
  }
}
