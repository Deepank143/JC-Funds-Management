export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';
import { AuthService } from '@/lib/services/authService';
import { ProjectService } from '@/lib/services/projectService';

// GET /api/projects/[id] - Full project detail
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = getServerClient();
    const auth = new AuthService(supabase);
    const projectService = new ProjectService(supabase);

    const { error: authError } = await auth.checkRole(['owner', 'accountant', 'viewer']);
    if (authError) return authError;

    const project = await projectService.getProjectDetail(id);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Project detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}
