export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';
import { checkRole } from '@/lib/auth-utils';
import { checkOwner } from '@/lib/auth-utils';

// PATCH /api/expenses/[id]/pay - Canonical endpoint to mark expense as paid
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { error: authError, supabase } = await checkOwner();
    if (authError) return authError;

    const body = await request.json();
    const id = params.id;

    if (!id) {
        return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
    }

    const { data, error } = await (supabase.from('expenses') as any)
      .update({
        payment_status: 'paid',
        amount_paid: body.amount,
        payment_mode: body.payment_mode,
        reference_number: body.reference_number,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Expense payment error:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}
