export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';

// GET /api/milestones?project_id=xxx - List milestones for project
export async function GET(request: Request) {
  try {
    const supabase = getServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json(
        { error: 'project_id is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Milestones fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch milestones' },
      { status: 500 }
    );
  }
}

// POST /api/milestones - Create milestone
export async function POST(request: Request) {
  try {
    const supabase = getServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();

    // Auto-calculate amount from percentage if contract value provided
    let amount = body.amount;
    if (!amount && body.percentage && body.contract_value) {
      amount = (body.percentage * body.contract_value) / 100;
    }

    const { data, error } = await supabase
      .from('milestones')
      .insert({
        project_id: body.project_id,
        name: body.name,
        percentage: body.percentage,
        amount: amount,
        due_date: body.due_date,
        sort_order: body.sort_order || 0,
        status: 'pending',
      } as any)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Milestone creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create milestone' },
      { status: 500 }
    );
  }
}

