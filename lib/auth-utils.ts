import { NextResponse } from 'next/server';
import { createClient } from './supabase/server';

export type UserRole = 'owner' | 'accountant' | 'viewer';

/**
 * Checks if the current user has one of the required roles.
 * Returns the profile if authorized, otherwise returns a NextResponse error.
 * @deprecated Use AuthService for new logic.
 */
export async function checkRole(allowedRoles: UserRole[]) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !allowedRoles.includes((profile as any).role as UserRole)) {
    return { 
      error: NextResponse.json(
        { error: `Forbidden: Requires one of roles [${allowedRoles.join(', ')}]` }, 
        { status: 403 }
      ) 
    };
  }

  return { profile, user, supabase };
}

/**
 * Specifically checks if the user is an 'owner'.
 * @deprecated Use AuthService for new logic.
 */
export async function checkOwner() {
  return checkRole(['owner']);
}
