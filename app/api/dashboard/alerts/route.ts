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

    // 3. Budget Thresholds (Projects where expenses >= 90% of contract_value)
    const { data: projectsData, error: projectsDataError } = await supabase
      .from('projects')
      .select('id, name, contract_value, expenses(amount)')
      .eq('status', 'active');

    if (projectsDataError) throw projectsDataError;

    if (projectsData) {
      projectsData.forEach((p: any) => {
        if (!p.contract_value) return; // Skip if no contract value set
        
        const totalExpenses = p.expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
        const percentage = (totalExpenses / p.contract_value) * 100;

        if (percentage >= 90) {
          alerts.push({
            id: `budget-${p.id}`,
            type: 'budget_threshold',
            title: percentage >= 100 ? 'Budget Exceeded' : 'Budget Warning',
            description: `Project "${p.name}" has used ${percentage.toFixed(1)}% of its contract value.`,
            amount: totalExpenses,
            date: new Date().toISOString(),
            project_name: p.name,
            severity: percentage >= 100 ? 'high' : 'medium',
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
