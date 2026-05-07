'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { ProjectProfitChart } from '@/components/charts/ProjectProfitChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { formatINR, formatDate, getProfitColor } from '@/lib/utils';
import { useAdmin } from '@/contexts/AdminContext';
import { 
  ArrowLeft, Building2, MapPin, Calendar, IndianRupee,
  TrendingUp, TrendingDown, Wallet, CheckCircle2, Clock, AlertCircle, EyeOff
} from 'lucide-react';

interface ProjectPnL {
  summary: {
    total_income: number;
    total_expenses: number;
    total_paid: number;
    total_payable: number;
    profit: number;
    profit_margin: number;
    realized_profit: number;
  };
  income: Array<{
    amount: number;
    payment_date: string;
    payment_mode: string;
    reference_number: string;
    milestones: { name: string; percentage: number } | null;
  }>;
  category_breakdown: Record<string, {
    total: number;
    paid: number;
    unpaid: number;
    items: Array<any>;
  }>;
}

interface ProjectDetail {
  id: string;
  name: string;
  location: string | null;
  description: string | null;
  contract_value: number;
  status: string;
  start_date: string | null;
  expected_end_date: string | null;
  clients: { id: string; name: string; phone: string; email: string } | null;
  milestones: Array<{
    id: string;
    name: string;
    percentage: number;
    amount: number;
    status: string;
    due_date: string;
  }>;
}

async function fetchProjectDetail(id: string): Promise<ProjectDetail> {
  const res = await fetch(`/api/projects/${id}`);
  if (!res.ok) throw new Error('Failed to fetch project');
  return res.json();
}

async function fetchProjectPnL(id: string): Promise<ProjectPnL> {
  const res = await fetch(`/api/projects/${id}/pnl`);
  if (!res.ok) throw new Error('Failed to fetch P&L');
  return res.json();
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => fetchProjectDetail(projectId),
  });

  const { data: pnl, isLoading: pnlLoading } = useQuery({
    queryKey: ['project-pnl', projectId],
    queryFn: () => fetchProjectPnL(projectId),
  });

  const { isOwner, isAdminMode } = useAdmin();
  const showSensitiveData = isOwner ? isAdminMode : false;

  const isLoading = projectLoading || pnlLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Project not found</p>
        <Button className="mt-4" onClick={() => router.push('/projects')}>
          Back to Projects
        </Button>
      </Card>
    );
  }

  const summary = pnl?.summary || {
    total_income: 0, total_expenses: 0, total_paid: 0,
    total_payable: 0, profit: 0, profit_margin: 0, realized_profit: 0
  };

  const chartData = Object.entries(pnl?.category_breakdown || {}).map(([category, data]: [string, any]) => ({
    category,
    amount: data.total,
    color: category === 'Vendors' ? '#8b5cf6' : category === 'Raw Material' ? '#f59e0b' : '#10b981',
  }));

  const profitColorClass = getProfitColor(summary.profit_margin);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/projects')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{project.name}</h2>
              <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                {project.status}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span>{project.clients?.name}</span>
              {project.location && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {project.location}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* P&L Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(summary.total_income)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatINR(summary.total_expenses)}</div>
            <p className="text-xs text-muted-foreground">
              {formatINR(summary.total_paid)} paid | {formatINR(summary.total_payable)} payable
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-blue-500" />
                Project Profit
              </span>
              {!showSensitiveData && <EyeOff className="h-4 w-4 text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showSensitiveData ? (
              <>
                <div className={`text-2xl font-bold ${summary.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatINR(summary.profit)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {summary.profit_margin}% margin
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-muted-foreground select-none">••••••</div>
                <p className="text-xs text-muted-foreground">Hidden in Admin Mode</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-violet-500" />
                Realized Profit
              </span>
              {!showSensitiveData && <EyeOff className="h-4 w-4 text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showSensitiveData ? (
              <>
                <div className={`text-2xl font-bold ${summary.realized_profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatINR(summary.realized_profit)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Received minus paid expenses
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-muted-foreground select-none">••••••</div>
                <p className="text-xs text-muted-foreground">Hidden in Admin Mode</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chart + Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ProjectProfitChart data={chartData} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No expenses recorded yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Details */}
        <Card>
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(pnl?.category_breakdown || {}).length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No expenses yet</p>
            ) : (
              Object.entries(pnl?.category_breakdown || {}).map(([category, data]: [string, any]) => (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{category}</span>
                    <span className="font-semibold">{formatINR(data.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Paid: {formatINR(data.paid)}</span>
                    <span>Unpaid: {formatINR(data.unpaid)}</span>
                  </div>
                  <Separator />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {project.milestones?.map((milestone) => (
              <div 
                key={milestone.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  {milestone.status === 'paid' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : milestone.status === 'billed' ? (
                    <Clock className="h-5 w-5 text-amber-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">{milestone.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {milestone.percentage}% • Due: {milestone.due_date ? formatDate(milestone.due_date) : 'Not set'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatINR(milestone.amount)}</p>
                  <Badge variant={
                    milestone.status === 'paid' ? 'default' : 
                    milestone.status === 'billed' ? 'secondary' : 'outline'
                  }>
                    {milestone.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Income History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {pnl?.income && pnl.income.length > 0 ? (
            <div className="space-y-3">
              {pnl.income.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">
                      {payment.milestones?.name || 'Payment'}
                      {payment.milestones?.percentage && (
                        <span className="text-sm text-muted-foreground ml-2">
                          ({payment.milestones.percentage}%)
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(payment.payment_date)} • {payment.payment_mode}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">{formatINR(payment.amount)}</p>
                    {payment.reference_number && (
                      <p className="text-xs text-muted-foreground">Ref: {payment.reference_number}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No payments recorded yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
