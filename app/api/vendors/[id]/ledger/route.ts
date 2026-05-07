export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';

// GET /api/vendors/[id]/ledger - Get vendor ledger (expenses and running balance)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getServerClient() as any;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;

    const { data: expenses, error } = await supabase
      .from('expenses')
      .select(`
        *,
        projects(name),
        expense_categories(name)
      `)
      .eq('vendor_id', id)
      .order('expense_date', { ascending: true });

    if (error) throw error;

    let runningBalance = 0;
    const ledger = (expenses || []).map((exp: any) => {
      const billed = exp.amount || 0;
      const paid = exp.amount_paid || 0;
      runningBalance += (billed - paid);

      return {
        ...exp,
        running_balance: runningBalance
      };
    });

    const totalBilled = ledger.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);
    const totalPaid = ledger.reduce((sum: number, exp: any) => sum + (exp.amount_paid || 0), 0);

    return NextResponse.json({
      ledger: ledger.reverse(), // most recent first for UI
      summary: {
        total_billed: totalBilled,
        total_paid: totalPaid,
        current_balance: runningBalance
      }
    });
  } catch (error) {
    console.error('Vendor ledger error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ledger' },
      { status: 500 }
    );
  }
}
