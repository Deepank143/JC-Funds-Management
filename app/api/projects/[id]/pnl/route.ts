export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase';
import { AuthService } from '@/lib/services/authService';
import { ProjectService } from '@/lib/services/projectService';

// GET /api/projects/[id]/pnl - Project Profit & Loss
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = getServerClient();
    const auth = new AuthService(supabase);
    
    // Check for Admin Mode header (Owner Only toggle)
    const adminModeHeader = request.headers.get('x-admin-mode');
    const isAdminModeRequested = adminModeHeader === 'true';

    const projectService = new ProjectService(supabase, { adminMode: isAdminModeRequested });

    const { error: authError } = await auth.checkRole(['owner', 'accountant']);
    if (authError) return authError;

    // Use centralized service for P&L calculation
    const pnlData = await projectService.getProjectPnL(id);

    return NextResponse.json(pnlData);
  } catch (error) {
    console.error('Project P&L error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch P&L' },
      { status: 500 }
    );
  }
}
