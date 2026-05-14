export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';
import { AuthService } from '@/lib/services/authService';
import { ProjectService } from '@/lib/services/projectService';

export async function GET(request: Request) {
  try {
    const supabase = getServerClient();
    const auth = new AuthService(supabase);
    
    // Check for Admin Mode header (Owner Only toggle)
    const adminModeHeader = request.headers.get('x-admin-mode');
    const isAdminModeRequested = adminModeHeader === 'true';

    const projectService = new ProjectService(supabase, { adminMode: isAdminModeRequested });

    const { error: authError, profile } = await auth.checkRole(['owner', 'accountant', 'viewer']);
    if (authError) return authError;

    const isAuthorized = (profile as any)?.role === 'owner' || (profile as any)?.role === 'accountant';

    // Use centralized service for KPI calculation
    const summary = await projectService.getDashboardSummary(isAuthorized);

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
