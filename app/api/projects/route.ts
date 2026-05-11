export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';

// GET /api/projects - List all projects
export async function GET(request: Request) {
  try {
    const supabase = getServerClient() as any;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const clientId = searchParams.get('client_id');

    // Use RPC if we want margins (for dashboard/grid)
    const { data: projectsWithMargins, error: rpcError } = await supabase.rpc('get_projects_with_margins');
    
    if (rpcError) {
      console.warn('RPC margin fetch failed, falling back to basic query:', rpcError);
      // Fallback to basic query if RPC fails (e.g. migration not applied yet)
      let query = supabase
        .from('projects')
        .select(`
          *,
          clients(name),
          milestones(id, name, status, amount)
        `)
        .order('created_at', { ascending: false });

      if (status) query = query.eq('status', status);
      if (clientId) query = query.eq('client_id', clientId);

      const { data, error } = await query;
      if (error) throw error;
      return NextResponse.json(data);
    }

    // Filter RPC results if needed
    let filtered = projectsWithMargins;
    if (status && status !== 'all') {
      filtered = filtered.filter((p: any) => p.status === status);
    }
    if (clientId) {
      filtered = filtered.filter((p: any) => p.client_id === clientId);
    }

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Projects fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create new project
export async function POST(request: Request) {
  try {
    const supabase = getServerClient() as any;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        client_id: body.client_id,
        name: body.name,
        location: body.location,
        description: body.description,
        contract_value: body.contract_value,
        start_date: body.start_date,
        expected_end_date: body.expected_end_date,
        status: 'active',
        created_by: session.user.id,
      } as any)
      .select()
      .single();

    if (projectError) throw projectError;

    // Create default milestones if provided
    if (body.milestones && body.milestones.length > 0) {
      const milestones = body.milestones.map((m: any, index: number) => ({
        project_id: project.id,
        name: m.name,
        percentage: m.percentage,
        amount: Math.round(((body.contract_value * m.percentage) / 100) * 100) / 100,
        due_date: m.due_date,
        sort_order: index,
      }));

      const { error: milestoneError } = await supabase
        .from('milestones')
        .insert(milestones as any);

      if (milestoneError) throw milestoneError;
    }

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Project creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
