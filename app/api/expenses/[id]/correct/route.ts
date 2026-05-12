import { NextResponse } from 'next/server';
import { checkOwner } from '@/lib/auth-utils';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error, supabase, session } = await checkOwner();
    if (error) return error;

    const body = await request.json();
    const expenseId = params.id;

    // BUG-03 FIX: Server-side validation — cannot be bypassed by direct API calls
    if (!body.correction_reason || String(body.correction_reason).trim().length < 10) {
      return NextResponse.json(
        { error: 'correction_reason must be at least 10 characters' },
        { status: 400 }
      );
    }
    if (!body.amount || Number(body.amount) <= 0) {
      return NextResponse.json(
        { error: 'amount must be greater than 0' },
        { status: 400 }
      );
    }

    // 1. Get original data for audit log
    const { data: originalData, error: fetchError } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', expenseId)
      .single();

    if (fetchError || !originalData) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // 2. Perform update
    const { data: updatedData, error: updateError } = await supabase
      .from('expenses')
      .update({
        amount: body.amount,
        expense_date: body.payment_date, // Field name differs in expenses table
        notes: body.notes,
        is_correction: true,
        correction_reason: body.correction_reason,
        original_data: originalData,
      })
      .eq('id', expenseId)
      .select()
      .single();

    if (updateError) throw updateError;

    // 3. Log to audit_logs
    await supabase.from('audit_logs').insert({
      table_name: 'expenses',
      record_id: expenseId,
      action: 'UPDATE',
      old_data: originalData,
      new_data: updatedData,
      reason: body.correction_reason,
      performed_by: session.user.id,
    });

    return NextResponse.json(updatedData);
  } catch (error: any) {
    console.error('Expense correction error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to apply correction' },
      { status: 500 }
    );
  }
}
