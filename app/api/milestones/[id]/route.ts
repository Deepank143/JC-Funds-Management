export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';
import { checkRole } from '@/lib/auth-utils';

// PATCH /api/milestones/[id] - Update milestone status
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error: authError, supabase, user } = await checkRole(['owner', 'accountant']);
    if (authError) return authError;

    const { id } = params;
    const body = await request.json();

    const updateData: any = {};
    if (body.status) updateData.status = body.status;
    if (body.name) updateData.name = body.name;
    if (body.percentage !== undefined) updateData.percentage = body.percentage;
    if (body.amount !== undefined) updateData.amount = body.amount;
    if (body.due_date !== undefined) updateData.due_date = body.due_date;

    const { data, error } = await (supabase.from('milestones') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Milestone update error:', error);
    return NextResponse.json(
      { error: 'Failed to update milestone' },
      { status: 500 }
    );
  }
}
