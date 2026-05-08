export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    const isOwner = profile?.role === 'owner';

    // Call the database function for consistent KPIs
    const { data: kpis, error: kpiError } = await (supabase as any).rpc('get_dashboard_kpis');
    if (kpiError) throw kpiError;

    const summary = kpis?.[0] || {};

    // Filter sensitive data based on role
    return NextResponse.json({
      totalReceivables: isOwner ? (summary.total_receivables || 0) : 0,
      totalPayables: isOwner ? (summary.total_payables || 0) : 0,
      netPosition: isOwner ? (summary.net_position || 0) : 0,
      totalIncome: isOwner ? (summary.total_income || 0) : 0,
      totalProjects: summary.total_projects || 0,
      activeProjects: summary.active_projects || 0,
      overdueIncomeCount: isOwner ? (summary.overdue_income_count || 0) : 0,
      overdueExpenseCount: isOwner ? (summary.overdue_expense_count || 0) : 0,
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
