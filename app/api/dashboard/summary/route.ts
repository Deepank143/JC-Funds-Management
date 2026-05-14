export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';
import { checkRole } from '@/lib/auth-utils';

export async function GET() {
  try {
    const { error: authError, supabase, profile } = await checkRole(['owner', 'accountant', 'viewer']);
    if (authError) return authError;

    const isAuthorized = (profile )?.role === 'owner' || (profile )?.role === 'accountant';

    // Call the database function for consistent KPIs
    const { data: kpis, error: kpiError } = await supabase.rpc('get_dashboard_kpis');
    if (kpiError) throw kpiError;

    const summary = (kpis )?.[0] || {};

    // Filter sensitive data based on role
    return NextResponse.json({
      totalReceivables: isAuthorized ? (summary.total_receivables || 0) : 0,
      totalPayables: isAuthorized ? (summary.total_payables || 0) : 0,
      netPosition: isAuthorized ? (summary.net_position || 0) : 0,
      totalIncome: isAuthorized ? (summary.total_income || 0) : 0,
      totalProjects: summary.total_projects || 0,
      activeProjects: summary.active_projects || 0,
      overdueIncomeCount: isAuthorized ? (summary.overdue_income_count || 0) : 0,
      overdueExpenseCount: isAuthorized ? (summary.overdue_expense_count || 0) : 0,
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
