import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { UserRole } from '../auth-utils';
import { NextResponse } from 'next/server';

/**
 * Server-side service for Authentication and RBAC
 */
export class AuthService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Gets the current session and user profile
   */
  async getContext() {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return { session: null, profile: null, user: null };

    const { data: profile } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return { user, profile };
  }

  /**
   * Enforces role requirements. Returns error response if unauthorized.
   */
  async checkRole(allowedRoles: UserRole[]) {
    const { user, profile } = await this.getContext();

    if (!user) {
      return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    }

    if (!profile || !allowedRoles.includes((profile as any).role)) {
      return { 
        error: NextResponse.json(
          { error: `Forbidden: Requires one of [${allowedRoles.join(', ')}]` }, 
          { status: 403 }
        ) 
      };
    }

    return { user, profile, supabase: this.supabase };
  }

  /**
   * Check if user is an owner
   */
  async checkOwner() {
    return this.checkRole(['owner']);
  }

  /**
   * Check if user can manage funds (Owner or Accountant)
   */
  async checkManager() {
    return this.checkRole(['owner', 'accountant']);
  }
}
