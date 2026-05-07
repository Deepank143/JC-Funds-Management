'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Building2,
  Users,
  FolderKanban,
  IndianRupee,
  Receipt,
  HardHat,
  FileBarChart,
  AlertCircle,
  X,
} from 'lucide-react';

interface SidebarProps {
  overdueCount?: number;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const navItems = [
  { href: '/', label: 'Dashboard', icon: Building2 },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/income', label: 'Income', icon: IndianRupee },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/vendors', label: 'Vendors', icon: HardHat },
  { href: '/reports', label: 'Reports', icon: FileBarChart },
];

export function Sidebar({ overdueCount = 0, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const NavContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4 lg:hidden">
        <span className="font-semibold">Menu</span>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={onMobileClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="grid gap-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                {item.href === '/' && overdueCount > 0 && (
                  <Badge variant={isActive ? 'secondary' : 'destructive'} className="h-5 min-w-[20px] px-1 text-xs">
                    <AlertCircle className="h-3 w-3 mr-0.5" />
                    {overdueCount}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs font-medium text-muted-foreground">Quick Tip</p>
          <p className="text-xs text-muted-foreground mt-1">
            Use the + button to quickly add expenses from any page.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 border-r bg-background">
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={onMobileClose}>
        <SheetContent side="left" className="w-64 p-0">
          <NavContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
