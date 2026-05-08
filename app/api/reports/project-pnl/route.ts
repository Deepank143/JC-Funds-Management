export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';

// GET /api/reports/project-pnl
export async function GET(request: Request) {
  try {
    const supabase = getServerClient() as any;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';

    // Fetch projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, contract_value, status, client_id, clients(name)')
      .eq('status', status);

    if (projectsError) throw projectsError;

    // Fetch all income
    const { data: income, error: incomeError } = await supabase
      .from('income')
      .select('project_id, amount');

    if (incomeError) throw incomeError;

    // Fetch all expenses
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('project_id, amount');

    if (expensesError) throw expensesError;

    const report = projects.map((project: any) => {
      const projectIncome = income
        .filter((i: any) => i.project_id === project.id)
        .reduce((sum: number, i: any) => sum + (i.amount || 0), 0);

      const projectExpenses = expenses
        .filter((e: any) => e.project_id === project.id)
        .reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

      const profit = projectIncome - projectExpenses;
      const profitMargin = projectIncome > 0 ? (profit / projectIncome) * 100 : 0;

      return {
        ...project,
        client_name: project.clients?.name,
        total_income: projectIncome,
        total_expense: projectExpenses,
        profit,
        profit_margin: profitMargin
      };
    });

    // Calculate totals
    const total_income = report.reduce((sum: number, p: any) => sum + p.total_income, 0);
    const total_expense = report.reduce((sum: number, p: any) => sum + p.total_expense, 0);
    const total_profit = total_income - total_expense;
    const overall_margin = total_income > 0 ? (total_profit / total_income) * 100 : 0;

    return NextResponse.json({
      projects: report,
      summary: {
        total_income,
        total_expense,
        total_profit,
        overall_margin
      }
    });
  } catch (error) {
    console.error('Reports P&L error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

