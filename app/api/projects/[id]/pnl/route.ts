export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { checkOwner } from '@/lib/auth-utils';

// GET /api/projects/[id]/pnl - Project Profit & Loss
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { error, supabase } = await checkOwner();
    if (error) return error;

    // Use the database function for summary
    const { data: summary, error: summaryError } = await (supabase ).rpc('get_project_summary', { project_uuid: id });

    if (summaryError) throw summaryError;

    // Get detailed expense breakdown by category
    const { data: expenses, error: expenseError } = await supabase
      .from('expenses')
      .select(`
        amount, payment_status, amount_paid, milestone_id,
        expense_categories(name),
        expense_subcategories(name),
        vendors(name)
      `)
      .eq('project_id', id);

    if (expenseError) throw expenseError;

    // Get income details
    const { data: income, error: incomeError } = await supabase
      .from('income')
      .select(`
        amount, payment_date, payment_mode, reference_number, milestone_id,
        milestones(name, percentage)
      `)
      .eq('project_id', id)
      .order('payment_date', { ascending: false });

    if (incomeError) throw incomeError;

    // Category breakdown
    const categoryBreakdown = (expenses || []).reduce((acc: any, exp: any) => {
      const catName = exp.expense_categories?.name || 'Uncategorized';
      if (!acc[catName]) {
        acc[catName] = { total: 0, paid: 0, unpaid: 0, items: [] };
      }
      acc[catName].total = Math.round((acc[catName].total + (exp.amount || 0)) * 100) / 100;
      acc[catName].paid = Math.round((acc[catName].paid + (exp.amount_paid || 0)) * 100) / 100;
      acc[catName].unpaid = Math.round((acc[catName].total - acc[catName].paid) * 100) / 100;
      acc[catName].items.push({
        subcategory: exp.expense_subcategories?.name,
        vendor: exp.vendors?.name,
        amount: exp.amount,
        status: exp.payment_status,
      });
      return acc;
    }, {});

    return NextResponse.json({
      summary: summary?.[0] || {
        total_contract_value: 0,
        total_income: 0,
        total_expenses: 0,
        pending_income: 0,
        outstanding_expenses: 0,
        net_profit: 0,
        profit_margin: 0
      },
      income: income || [],
      expenses: expenses || [],
      category_breakdown: categoryBreakdown,
    });
  } catch (error) {
    console.error('Project P&L error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch P&L' },
      { status: 500 }
    );
  }
}
