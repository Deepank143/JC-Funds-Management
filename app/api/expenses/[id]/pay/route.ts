export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';

// PATCH /api/expenses/[id]/pay - Canonical endpoint to mark expense as paid
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = getServerClient() as any;
    
    // Auth check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role check - Only owners can mark expenses as paid
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden: Only owners can manage funds' }, { status: 403 });
    }

    const body = await request.json();
    const id = params.id;

    if (!id) {
        return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('expenses')
      .update({
        payment_status: 'paid',
        amount_paid: body.amount,
        payment_mode: body.payment_mode,
        reference_number: body.reference_number,
      } as any)
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
