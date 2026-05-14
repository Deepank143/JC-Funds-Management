export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';
import { checkRole } from '@/lib/auth-utils';

// GET /api/clients/[id] - Get client detail with projects
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error: authError, supabase, session } = await checkRole(['owner', 'accountant', 'viewer']);
    if (authError) return authError;
    const { id } = params;

    const { data: rawClient, error: clientError } = await supabase
      .from('clients')
      .select(`
        *,
        projects(
          id, name, location, contract_value, status,
          start_date, expected_end_date,
          milestones(id, name, status, amount, due_date)
        )
      `)
      .eq('id', id)
      .single();

    const client = rawClient ;

    if (clientError) throw clientError;
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Calculate totals
    const projects = client.projects || [];
    const totalIncome = projects.reduce((sum: number, p: any) => {
      const paidMilestones = p.milestones?.filter((m: any) => m.status === 'paid') || [];
      return sum + paidMilestones.reduce((s: number, m: any) => s + (m.amount || 0), 0);
    }, 0);

    const totalPending = projects.reduce((sum: number, p: any) => {
      const pendingMilestones = p.milestones?.filter((m: any) => m.status !== 'paid') || [];
      return sum + pendingMilestones.reduce((s: number, m: any) => s + (m.amount || 0), 0);
    }, 0);

    return NextResponse.json({
      ...client,
      total_income: totalIncome,
      total_pending: totalPending,
      total_projects: projects.length,
      active_projects: projects.filter((p: any) => p.status === 'active').length,
    });
  } catch (error) {
    console.error('Client detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

// PATCH /api/clients/[id] - Update client
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error: authError, supabase, session } = await checkRole(['owner', 'accountant']);
    if (authError) return authError;
    const { id } = params;
    const body = await request.json();

    const { data, error } = await (supabase.from('clients') )
      .update({
        name: body.name,
        contact_person: body.contact_person,
        phone: body.phone,
        email: body.email,
        address: body.address,
        gstin: body.gstin,
        notes: body.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Client update error:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}
