'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { formatINR, formatDate, daysBetween } from '@/lib/utils';

interface Alert {
  id: string;
  type: 'overdue_income' | 'overdue_expense' | 'budget_warning' | 'milestone_due';
  title: string;
  description: string;
  amount?: number;
  date: string;
  project_name?: string;
  severity: 'high' | 'medium' | 'low';
}

async function fetchAlerts(): Promise<Alert[]> {
  const res = await fetch('/api/dashboard/alerts');
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export function AlertFeed() {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['dashboard-alerts'],
    queryFn: fetchAlerts,
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-[120px]" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            All Clear
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No overdue payments or alerts at the moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-50 border-red-200 text-red-800';
      case 'medium': return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'low': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'overdue_income': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'overdue_expense': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'milestone_due': return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            Alerts & Reminders
          </span>
          <Badge variant="destructive" className="text-xs">
            {alerts.length} pending
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-3 rounded-lg border p-3 ${getSeverityColor(alert.severity)}`}
          >
            <div className="mt-0.5">{getIcon(alert.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{alert.title}</p>
              <p className="text-xs mt-0.5 opacity-90">{alert.description}</p>
              {alert.amount && (
                <p className="text-xs font-semibold mt-1">
                  {formatINR(alert.amount)}
                </p>
              )}
              {alert.project_name && (
                <p className="text-xs mt-0.5 opacity-75">
                  Project: {alert.project_name}
                </p>
              )}
            </div>
            <span className="text-xs whitespace-nowrap opacity-75">
              {daysBetween(alert.date, new Date())}d ago
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
