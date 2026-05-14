'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';

type UserRole = 'owner' | 'accountant' | 'viewer';

interface AdminContextType {
  /** The user's role from the profiles table */
  userRole: UserRole;
  /** Whether admin mode is currently toggled on (only available to 'owner') */
  isAdminMode: boolean;
  /** Toggle admin mode on/off (only works for 'owner' role) */
  toggleAdminMode: () => void;
  /** Whether the current user is the owner */
  isOwner: boolean;
  /** Whether the user can create/edit records (owner or accountant) */
  canWrite: boolean;
  /** Whether the user can approve payments / delete records (owner + admin mode on) */
  canManageFunds: boolean;
  /** Loading state while fetching profile */
  isLoading: boolean;
  /** Logged in user's display name */
  userName: string;
  /** Logged in user's email */
  userEmail: string;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [userRole, setUserRole] = useState<UserRole>('viewer');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setIsLoading(false);
        setUserRole('viewer');
        setUserName('User');
        setUserEmail('');
        return;
      }

      // Set user metadata from session
      setUserEmail(session.user.email || '');
      const fullName = session.user.user_metadata?.full_name;
      setUserName(fullName || session.user.email?.split('@')[0] || 'User');

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role) {
        const role = profile.role as UserRole;
        setUserRole(role);
        
        // Auto-enable or restore admin mode for owner
        if (role === 'owner') {
          const savedMode = typeof window !== 'undefined' ? sessionStorage.getItem('adminMode') : null;
          setIsAdminMode(savedMode === null ? true : savedMode === 'on');
        } else {
          setIsAdminMode(false);
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchProfile();

    // Real-time RBAC via auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchProfile();
      } else if (event === 'SIGNED_OUT') {
        setUserRole('viewer');
        setIsAdminMode(false);
        setUserName('User');
        setUserEmail('');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, supabase]);

  const toggleAdminMode = () => {
    if (userRole === 'owner') {
      setIsAdminMode((prev) => {
        const next = !prev;
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('adminMode', next ? 'on' : 'off');
        }
        return next;
      });
    }
  };

  const isOwner = userRole === 'owner';
  const canWrite = userRole === 'owner' || userRole === 'accountant';
  const canManageFunds = isOwner && isAdminMode;

  return (
    <AdminContext.Provider
      value={{
        userRole,
        isAdminMode,
        toggleAdminMode,
        isOwner,
        canWrite,
        canManageFunds,
        isLoading,
        userName,
        userEmail,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
