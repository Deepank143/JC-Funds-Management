'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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
}

const AdminContext = createContext<AdminContextType>({
  userRole: 'viewer',
  isAdminMode: false,
  toggleAdminMode: () => {},
  isOwner: false,
  canWrite: false,
  canManageFunds: false,
  isLoading: true,
});

export function AdminProvider({ children }: { children: ReactNode }) {
  const supabase = createClientComponentClient();
  const [userRole, setUserRole] = useState<UserRole>('viewer');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setIsLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile?.role) {
          setUserRole(profile.role as UserRole);
          // Auto-enable admin mode for owner on login
          if (profile.role === 'owner') {
            setIsAdminMode(true);
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const toggleAdminMode = () => {
    // Only owners can toggle admin mode
    if (userRole === 'owner') {
      setIsAdminMode((prev) => !prev);
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
