import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { checkOwner } from '@/lib/auth-utils';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error, supabase } = await checkOwner();
    if (error) return error;

    const projectId = params.id;

    // 1. Fetch Milestones and their Income
    const { data: milestones, error: mError } = await supabase
      .from('milestones')
      .select(`
        id,
        name,
        amount,
        income(amount)
      `)
      .eq('project_id', projectId);

    if (mError) throw mError;

    // 2. Fetch Unpaid/Partial Expenses
    const { data: expenses, error: eError } = await supabase
      .from('expenses')
      .select(`
        id,
        amount,
        amount_paid,
        payment_status,
        expense_date,
        vendors(name),
        expense_categories(name)
      `)
      .eq('project_id', projectId)
      .neq('payment_status', 'paid');

    if (eError) throw eError;

    // 3. Process Income Gaps
    const incomeGaps = milestones
      .map((m: any) => {
        const received = m.income?.reduce((sum: number, inc: any) => sum + Number(inc.amount), 0) || 0;
        const gap = Number(m.amount) - received;
        return {
          id: m.id,
          name: m.name,
          target: Number(m.amount),
          received,
          gap: Math.max(0, gap)
        };
      })
      .filter(m => m.gap > 0);

    // 4. Process Expense Gaps
    const expenseGaps = expenses.map((e: any) => ({
      id: e.id,
      description: `${e.vendors?.name || 'Unknown Vendor'} (${e.expense_categories?.name || 'Expense'})`,
      amount: Number(e.amount),
      paid: Number(e.amount_paid || 0),
      gap: Number(e.amount) - Number(e.amount_paid || 0),
      status: e.payment_status,
      date: e.expense_date
    }));

    return NextResponse.json({
      incomeGaps,
      expenseGaps,
      summary: {
        totalIncomeGap: incomeGaps.reduce((sum, g) => sum + g.gap, 0),
        totalExpenseGap: expenseGaps.reduce((sum, g) => sum + g.gap, 0),
      }
    });
  } catch (error: any) {
    console.error('Settlement gaps error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch settlement gaps' },
      { status: 500 }
    );
  }
}
