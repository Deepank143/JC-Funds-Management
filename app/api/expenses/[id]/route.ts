export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = getServerClient() as any;
    
    // Add auth check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
