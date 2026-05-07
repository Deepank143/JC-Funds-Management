export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';

// GET /api/clients/[id]/statement - Full payment statement
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = params;

    // Get client with all projects and income
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select(`
        name, phone, email, address, gstin
      `)
      .eq('id', id)
      .single();

    if (clientError) throw clientError;

    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select(`
        id, name, contract_value, status,
        milestones(id, name, percentage, amount, status, due_date),
        income(id, amount, payment_date, payment_mode, reference_number)
      `)
      .eq('client_id', id)
      .order('created_at', { ascending: false });

    if (projectsError) throw projectsError;

    // Build statement
    const projectStatements = (projects || []).map((project: any) => {
      const milestones = project.milestones || [];
      const income = project.income || [];

      const totalReceived = income.reduce((sum: number, i: any) => sum + (i.amount || 0), 0);
      const totalPending = milestones
        .filter((m: any) => m.status !== 'paid')
        .reduce((sum: number, m: any) => sum + (m.amount || 0), 0);

      return {
        project_name: project.name,
        contract_value: project.contract_value,
        status: project.status,
        milestones: milestones.map((m: any) => ({
          name: m.name,
          percentage: m.percentage,
          amount: m.amount,
          status: m.status,
          due_date: m.due_date,
        })),
        payments: income.map((i: any) => ({
          date: i.payment_date,
          amount: i.amount,
          mode: i.payment_mode,
          reference: i.reference_number,
        })),
        total_received: totalReceived,
        total_pending: totalPending,
      };
    });

    const grandTotalReceived = projectStatements.reduce((sum: number, p: any) => sum + p.total_received, 0);
    const grandTotalPending = projectStatements.reduce((sum: number, p: any) => sum + p.total_pending, 0);
    const grandTotalContract = projectStatements.reduce((sum: number, p: any) => sum + p.contract_value, 0);

    return NextResponse.json({
      client,
      projects: projectStatements,
      summary: {
        total_contract_value: grandTotalContract,
        total_received: grandTotalReceived,
        total_pending: grandTotalPending,
        total_projects: projectStatements.length,
      },
    });
  } catch (error) {
    console.error('Client statement error:', error);
    return NextResponse.json(
      { error: 'Failed to generate statement' },
      { status: 500 }
    );
  }
}
