'use client';

import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, Wallet, AlertCircle, Building2, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatINR } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdmin } from '@/contexts/AdminContext';
import { financeService } from '@/lib/services/financeService';

export function KpiCards() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: () => financeService.getDashboardKPIs(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { isAdminMode, userRole } = useAdmin();
  const showData = isAdminMode || userRole === 'accountant';

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpis = data || {
    totalReceivables: 0,
    totalPayables: 0,
    netPosition: 0,
    totalPaid: 0,
    totalProjects: 0,
    activeProjects: 0,
    overdueIncomeCount: 0,
    overdueExpenseCount: 0,
  };

  const cards = [
    {
      title: 'Total Receivables',
      value: kpis.totalReceivables,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'From all clients',
      isSensitive: true,
    },
    {
      title: 'Total Payables',
      value: kpis.totalPayables,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Unpaid expenses',
      isSensitive: true,
    },
    {
      title: 'Net Position',
      value: kpis.netPosition,
      icon: Wallet,
      color: kpis.netPosition >= 0 ? 'text-blue-600' : 'text-amber-600',
      bgColor: kpis.netPosition >= 0 ? 'bg-blue-50' : 'bg-amber-50',
      description: 'Working capital',
      isSensitive: true,
    },
    {
      title: 'Active Projects',
      value: kpis.activeProjects,
      icon: Building2,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      description: `${kpis.totalProjects} total projects`,
      isSensitive: false,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`${card.bgColor} p-2 rounded-lg`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {card.isSensitive && !showData ? (
                <span className="text-muted-foreground/30 font-mono tracking-tighter">
                  ••••••
                </span>
              ) : (
                card.title === 'Active Projects' 
                  ? card.value 
                  : formatINR(card.value)
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {card.description}
            </p>
          </CardContent>

          {/* Alert badges */}
          {card.title === 'Total Receivables' && kpis.overdueIncomeCount > 0 && (
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                <AlertCircle className="mr-1 h-3 w-3" />
                {kpis.overdueIncomeCount} overdue
              </span>
            </div>
          )}

          {card.title === 'Total Payables' && kpis.overdueExpenseCount > 0 && (
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                <AlertCircle className="mr-1 h-3 w-3" />
                {kpis.overdueExpenseCount} overdue
              </span>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
