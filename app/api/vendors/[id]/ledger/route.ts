export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { checkRole } from '@/lib/auth-utils';

// GET /api/vendors/[id]/ledger - Get vendor ledger (expenses and running balance)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ledger contains sensitive payment history - restrict to Owner and Accountant
    const { error, supabase } = await checkRole(['owner', 'accountant']);
    if (error) return error;

    const { id } = params;

    const { data: expenses, error: fetchError } = await supabase
      .from('expenses')
      .select(`
        *,
        projects(name),
        expense_categories(name)
      `)
      .eq('vendor_id', id)
      .order('expense_date', { ascending: true });

    if (fetchError) throw fetchError;

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

    const totalBilled = (expenses || []).reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);
    const totalPaid = (expenses || []).reduce((sum: number, exp: any) => sum + (exp.amount_paid || 0), 0);

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
