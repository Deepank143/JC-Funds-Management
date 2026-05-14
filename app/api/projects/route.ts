export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';
import { AuthService } from '@/lib/services/authService';
import { ProjectService } from '@/lib/services/projectService';

// GET /api/projects - List all projects
export async function GET(request: Request) {
  try {
    const supabase = getServerClient();
    const auth = new AuthService(supabase);
    
    // Check for Admin Mode header (Owner Only toggle)
    const adminModeHeader = request.headers.get('x-admin-mode');
    const isAdminModeRequested = adminModeHeader === 'true';

    const projectService = new ProjectService(supabase, { adminMode: isAdminModeRequested });

    const { error: authError } = await auth.checkRole(['owner', 'accountant', 'viewer']);
    if (authError) return authError;
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const clientId = searchParams.get('client_id') || undefined;

    const projects = await projectService.listProjects({ status, clientId });

    return NextResponse.json(projects);
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
    const supabase = getServerClient();
    const auth = new AuthService(supabase);
    const projectService = new ProjectService(supabase);

    const { error: authError, user } = await auth.checkRole(['owner', 'accountant']);
    if (authError) return authError;

    const body = await request.json();
    const project = await projectService.createProject(body, user!.id);

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Project creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
