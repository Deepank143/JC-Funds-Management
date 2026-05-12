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

    // 1. Fetch Milestones and their linked Income
    const { data: milestones, error: mError } = await supabase
      .from('milestones')
      .select(`
        id,
        name,
        amount,
        status,
        income(amount)
      `)
      .eq('project_id', projectId);

    if (mError) throw mError;

    // 2. Fetch ALL project income (including entries not tied to a specific milestone)
    // ISSUE-08 FIX: Include project-level income (milestone_id = null)
    const { data: allIncome, error: allIncomeError } = await supabase
      .from('income')
      .select('amount')
      .eq('project_id', projectId);

    if (allIncomeError) throw allIncomeError;

    // 3. Fetch ALL expenses to get true totals
    const { data: allExpenses, error: allExpensesError } = await supabase
      .from('expenses')
      .select('amount, amount_paid, payment_status')
      .eq('project_id', projectId);

    if (allExpensesError) throw allExpensesError;

    // 4. Fetch Unpaid/Partial Expenses for gap display
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

    // 5. Process Income Gaps (milestones with outstanding payments)
    const incomeGaps = (milestones ?? [])
      .map((m: any) => {
        const received = (m.income ?? []).reduce((sum: number, inc: any) => sum + Number(inc.amount), 0);
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

    // 6. Process Expense Gaps
    const expenseGaps = (expenses ?? []).map((e: any) => ({
      id: e.id,
      description: `${e.vendors?.name || 'Unknown Vendor'} (${e.expense_categories?.name || 'Expense'})`,
      amount: Number(e.amount),
      paid: Number(e.amount_paid || 0),
      gap: Number(e.amount) - Number(e.amount_paid || 0),
      status: e.payment_status,
      date: e.expense_date
    }));

    // BUG-01 FIX: Compute TRUE totals from the full dataset, not the filtered gap arrays
    const totalIncomeReceived = (allIncome ?? []).reduce((sum, i: any) => sum + Number(i.amount), 0);
    const totalExpensesAmount = (allExpenses ?? []).reduce((sum, e: any) => sum + Number(e.amount), 0);
    const totalExpensesPaid = (allExpenses ?? []).reduce((sum, e: any) => sum + Number(e.amount_paid || 0), 0);

    return NextResponse.json({
      incomeGaps,
      expenseGaps,
      // Accurate totals for the P&L Step 3 display
      totals: {
        totalIncomeReceived,
        totalExpensesAmount,
        totalExpensesPaid,
        netProfit: totalIncomeReceived - totalExpensesPaid,
      },
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
