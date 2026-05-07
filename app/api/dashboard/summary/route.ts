export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getServerClient();
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get total receivables (all income)
    const { data: incomeData, error: incomeError } = await supabase
      .from('income')
      .select('amount');

    if (incomeError) throw incomeError;

    // Get total payables (unpaid expenses)
    const { data: expenseData, error: expenseError } = await supabase
      .from('expenses')
      .select('amount, amount_paid, payment_status');

    if (expenseError) throw expenseError;

    // Get project counts
    const { count: totalProjects, error: projectError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    const { count: activeProjects } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Calculate KPIs
    const totalReceivables = (incomeData as any[])?.reduce((sum, i) => sum + (i.amount || 0), 0) || 0;

    const totalPayables = (expenseData as any[])
      ?.filter(e => e.payment_status !== 'paid')
      ?.reduce((sum, e) => sum + ((e.amount || 0) - (e.amount_paid || 0)), 0) || 0;

    const totalPaid = (expenseData as any[])
      ?.reduce((sum, e) => sum + (e.amount_paid || 0), 0) || 0;

    // Get overdue counts
    const { data: overdueIncome } = await supabase
      .from('milestones')
      .select('id')
      .eq('status', 'billed')
      .lt('due_date', new Date().toISOString());

    const { data: overdueExpenses } = await supabase
      .from('expenses')
      .select('id')
      .eq('payment_status', 'unpaid')
      .lt('expense_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    return NextResponse.json({
      totalReceivables,
      totalPayables,
      netPosition: totalReceivables - totalPayables,
      totalPaid,
      totalProjects: totalProjects || 0,
      activeProjects: activeProjects || 0,
      overdueIncomeCount: overdueIncome?.length || 0,
      overdueExpenseCount: overdueExpenses?.length || 0,
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

