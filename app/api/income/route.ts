export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { checkOwner, checkRole } from '@/lib/auth-utils';

// GET /api/income - List income with filters
export async function GET(request: Request) {
  try {
    // Both owners and accountants can view income history
    const { error, supabase } = await checkRole(['owner', 'accountant']);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const clientId = searchParams.get('client_id');

    let query = supabase
      .from('income')
      .select(`
        *,
        projects(name),
        clients(name),
        milestones(name, percentage)
      `)
      .order('payment_date', { ascending: false });

    if (projectId) query = query.eq('project_id', projectId);
    if (clientId) query = query.eq('client_id', clientId);

    const { data, error: fetchError } = await query;
    if (fetchError) throw fetchError;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Income fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch income' },
      { status: 500 }
    );
  }
}

// POST /api/income - Record new payment
export async function POST(request: Request) {
  try {
    // ONLY Owners can record income (Money In is a sensitive operation)
    const { error, supabase, session } = await checkOwner();
    if (error) return error;

    const body = await request.json();

    const { data, error: insertError } = await supabase
      .from('income')
      .insert({
        project_id: body.project_id,
        client_id: body.client_id,
        milestone_id: body.milestone_id,
        amount: body.amount,
        payment_date: body.payment_date,
        payment_mode: body.payment_mode || 'bank_transfer',
        reference_number: body.reference_number,
        notes: body.notes,
        created_by: session.user.id,
      } as any)
      .select()
      .single();

    if (insertError) throw insertError;

    // Update milestone status if milestone_id provided
    if (body.milestone_id) {
      await supabase
        .from('milestones')
        .update({ status: 'paid' } as any)
        .eq('id', body.milestone_id);
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Income creation error:', error);
    return NextResponse.json(
      { error: 'Failed to record income' },
      { status: 500 }
    );
  }
}
