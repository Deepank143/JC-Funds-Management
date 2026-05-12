export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getServerClient();
    
    // Add auth check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const alerts: any[] = [];

    // 1. Overdue Income (Milestones billed and past due date)
    const { data: overdueMilestones, error: milestonesError } = await supabase
      .from('milestones')
      .select('id, name, amount, due_date, projects(id, name)')
      .eq('status', 'billed')
      .lt('due_date', new Date().toISOString());

    if (milestonesError) throw milestonesError;

    if (overdueMilestones) {
      overdueMilestones.forEach((m: any) => {
        alerts.push({
          id: `milestone-${m.id}`,
          type: 'overdue_income',
          title: 'Overdue Client Payment',
          description: `Milestone "${m.name}" payment is overdue.`,
          amount: m.amount,
          date: m.due_date,
          project_name: m.projects?.name,
          severity: 'high',
        });
      });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: overdueExpenses, error: expensesError } = await supabase
      .from('expenses')
      .select('id, amount, amount_paid, expense_date, projects(id, name), vendors(id, name)')
      .in('payment_status', ['unpaid', 'partial'])
      .lt('expense_date', thirtyDaysAgo);

    if (expensesError) throw expensesError;

    if (overdueExpenses) {
      overdueExpenses.forEach((e: any) => {
        const pendingAmount = (e.amount || 0) - (e.amount_paid || 0);
        alerts.push({
          id: `expense-${e.id}`,
          type: 'overdue_expense',
          title: 'Overdue Vendor Payment',
          description: `Payment to ${e.vendors?.name || 'vendor'} is overdue.`,
          amount: pendingAmount,
          date: e.expense_date,
          project_name: e.projects?.name,
          severity: 'medium',
        });
      });
    }

    // 3. Budget Thresholds
    // ISSUE-05 FIX: Compare expenses against actual income RECEIVED, not contract_value.
    // Comparing vs contract_value caused false alerts on projects where the client hasn't paid yet.
    // We still alert if expenses exceed contract_value as a hard cap warning.
    const { data: projectsData, error: projectsDataError } = await supabase
      .from('projects')
      .select('id, name, contract_value, expenses(amount), income(amount)')
      .eq('status', 'active');

    if (projectsDataError) throw projectsDataError;

    if (projectsData) {
      projectsData.forEach((p: any) => {
        const totalExpenses = (p.expenses ?? []).reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
        const totalReceived = (p.income ?? []).reduce((sum: number, i: any) => sum + (i.amount || 0), 0);

        // Alert 1: Spending close to or beyond what has been received
        if (totalReceived > 0) {
          const spendRatio = (totalExpenses / totalReceived) * 100;
          if (spendRatio >= 90) {
            alerts.push({
              id: `budget-received-${p.id}`,
              type: 'budget_threshold',
              title: spendRatio >= 100 ? 'Cash Flow Risk' : 'Cash Flow Warning',
              description: `Project "${p.name}" has spent ${spendRatio.toFixed(1)}% of received income.`,
              amount: totalExpenses,
              date: new Date().toISOString(),
              project_name: p.name,
              severity: spendRatio >= 100 ? 'high' : 'medium',
            });
          }
        }

        // Alert 2: Expenses exceed the total contract value (hard cap breach)
        if (p.contract_value && totalExpenses > p.contract_value) {
          alerts.push({
            id: `budget-contract-${p.id}`,
            type: 'budget_threshold',
            title: 'Contract Budget Exceeded',
            description: `Project "${p.name}" expenses (${((totalExpenses / p.contract_value) * 100).toFixed(1)}%) exceed the contract value.`,
            amount: totalExpenses,
            date: new Date().toISOString(),
            project_name: p.name,
            severity: 'high',
          });
        }
      });
    }

    // Sort by date (oldest first, meaning most overdue)
    alerts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Dashboard alerts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard alerts' },
      { status: 500 }
    );
  }
}
