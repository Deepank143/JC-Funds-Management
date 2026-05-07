export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';

// GET /api/projects/[id] - Full project detail
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = params;

    const { data: rawProject, error } = await supabase
      .from('projects')
      .select(`
        *,
        clients(id, name, phone, email),
        milestones(id, name, percentage, amount, due_date, status, sort_order),
        income(id, amount, payment_date, payment_mode, reference_number, milestone_id)
      `)
      .eq('id', id)
      .single();

    const project = rawProject as any;

    if (error) throw error;
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Sort milestones by sort_order
    project.milestones = (project.milestones || []).sort(
      (a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)
    );

    return NextResponse.json(project);
  } catch (error) {
    console.error('Project detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}
