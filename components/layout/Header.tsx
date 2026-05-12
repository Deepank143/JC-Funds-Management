'use client';

import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { Building2, LogOut, Menu, Shield, ShieldOff } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { isOwner, isAdminMode, toggleAdminMode, userRole, userName } = useAdmin();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.',
      });
      router.replace('/login');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAdminToggle = () => {
    toggleAdminMode();
    toast({
      title: isAdminMode ? 'Admin Mode Off' : 'Admin Mode On',
      description: isAdminMode
        ? 'Sensitive financial data is now hidden.'
        : 'Full fund management access enabled.',
    });
  };

  const roleLabel = userRole === 'owner' ? 'Owner' : userRole === 'accountant' ? 'Accountant' : 'Viewer';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="Apex Buildcon Logo" 
              width={120} 
              height={120} 
              className="h-12 w-auto object-contain" 
              priority
              quality={100}
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold leading-none">Apex Buildcon</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Funds Management</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Admin Mode Toggle — Only visible to owner */}
          {isOwner && (
            <Button
              variant={isAdminMode ? 'default' : 'outline'}
              size="sm"
              onClick={handleAdminToggle}
              className={`gap-2 transition-all ${
                isAdminMode
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'border-dashed'
              }`}
            >
              {isAdminMode ? (
                <>
                  <span className="relative flex h-2 w-2 mr-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Shield className="h-4 w-4" />
                </>
              ) : (
                <ShieldOff className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {isAdminMode ? 'Admin Mode' : 'Admin Off'}
              </span>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">{roleLabel}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
