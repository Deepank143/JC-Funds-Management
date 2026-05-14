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
    const adminModeHeader = request.headers.get('x-admin-mode');
    const isAdminMode = adminModeHeader === 'true';

    let query = supabase
      .from('income')
      .select(`
        *,
        projects(name),
        clients(name),
        milestones(name, percentage, status, due_date)
      `)
      .order('payment_date', { ascending: false });

    if (projectId) query = query.eq('project_id', projectId);
    if (clientId) query = query.eq('client_id', clientId);

    const { data, error: fetchError } = await query;
    if (fetchError) throw fetchError;

    let result = data;
    if (!isAdminMode) {
      result = (data || []).map(item => ({
        ...item,
        amount: 0,
        notes: null
      }));
    }

    return NextResponse.json(result);
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
    const { error, supabase, user } = await checkOwner();
    if (error) return error;

    const body = await request.json();

    // Use atomic RPC to handle income insert and milestone status update in one transaction
    const { data, error: rpcError } = await (supabase as any).rpc('record_income_with_milestone_update', {
      p_project_id: body.project_id,
      p_client_id: body.client_id,
      p_milestone_id: body.milestone_id,
      p_amount: body.amount,
      p_payment_date: body.payment_date,
      p_payment_mode: body.payment_mode || 'bank_transfer',
      p_reference_number: body.reference_number,
      p_notes: body.notes,
      p_created_by: user.id,
    });

    if (rpcError) {
      console.error('RPC Error:', rpcError);
      throw new Error(rpcError.message || 'Failed to record income');
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Income creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to record income' },
      { status: 500 }
    );
  }
}
