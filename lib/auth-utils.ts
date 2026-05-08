import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export type UserRole = 'owner' | 'accountant' | 'viewer';

/**
 * Checks if the current user has one of the required roles.
 * Returns the profile if authorized, otherwise returns a NextResponse error.
 */
export async function checkRole(allowedRoles: UserRole[]) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (!profile || !allowedRoles.includes(profile.role as UserRole)) {
    return { 
      error: NextResponse.json(
        { error: `Forbidden: Requires one of roles [${allowedRoles.join(', ')}]` }, 
        { status: 403 }
      ) 
    };
  }

  return { profile, session, supabase };
}

/**
 * Specifically checks if the user is an 'owner'.
 */
export async function checkOwner() {
  return checkRole(['owner']);
}
