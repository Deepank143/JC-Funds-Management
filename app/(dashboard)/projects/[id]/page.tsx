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
  ArrowLeft, Building2, MapPin, IndianRupee,
  TrendingUp, TrendingDown, Wallet, CheckCircle2, Clock, AlertCircle, EyeOff,
  LayoutList
} from 'lucide-react';
import { MilestoneManager } from '@/components/projects/MilestoneManager';
import { MilestoneInsightCard } from '@/components/projects/MilestoneInsightCard';
import { AdminCorrectionModal } from '@/components/admin/AdminCorrectionModal';
import { SettlementWizard } from '@/components/projects/SettlementWizard';
import { financeService } from '@/lib/services/financeService';
import { IncomeForm } from '@/components/forms/IncomeForm';
import { ProjectDetail, ProjectPnL, MilestoneStats, ProjectInsights } from '@/lib/types';
import { useState } from 'react';

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const [correctionEntry, setCorrectionEntry] = useState<{ type: 'income' | 'expense'; data: any } | null>(null);
  const [isSettlementOpen, setIsSettlementOpen] = useState(false);

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => financeService.getProjectDetail(projectId),
  });

  const { data: pnl, isLoading: pnlLoading } = useQuery({
    queryKey: ['project-pnl', projectId],
    queryFn: () => financeService.getProjectPnL(projectId),
  });

  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['project-insights', projectId],
    queryFn: () => financeService.getProjectInsights(projectId),
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

  const marginColor = getProfitColor(summary.profit_margin);
  
  // Use service to calculate milestone stats
  const milestoneStats = (project && pnl) 
    ? financeService.calculateMilestoneStats(project, pnl)
    : [];

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
              {showSensitiveData && project.status !== 'completed' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-7 px-2 text-[10px] bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 ml-2"
                  onClick={() => setIsSettlementOpen(true)}
                >
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Run Settlement
                </Button>
              )}
              <IncomeForm 
                defaultProjectId={projectId}
                triggerElement={
                  <Button size="sm" className="h-7 px-2 text-[10px] ml-2">
                    <IndianRupee className="mr-1 h-3 w-3" />
                    Record Income
                  </Button>
                }
              />
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                {project.clients?.name}
              </span>
              {project.location && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {project.location}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* P&L Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Total Income
              </span>
              {!showSensitiveData && <EyeOff className="h-3 w-3" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showSensitiveData ? (
              <div className="text-2xl font-bold">{formatINR(summary.total_income)}</div>
            ) : (
              <div className="text-2xl font-bold text-muted-foreground/30 select-none">••••••</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                Total Expenses
              </span>
              {!showSensitiveData && <EyeOff className="h-3 w-3" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showSensitiveData ? (
              <>
                <div className="text-2xl font-bold">{formatINR(summary.total_expenses)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatINR(summary.total_paid)} paid | {formatINR(summary.total_payable)} payable
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-muted-foreground/30 select-none">••••••</div>
                <p className="text-xs text-muted-foreground mt-1">Hidden in Admin Mode</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-blue-500" />
                Project Profit
              </span>
              {!showSensitiveData && <EyeOff className="h-3 w-3" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showSensitiveData ? (
              <>
                <div className={`text-2xl font-bold ${summary.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatINR(summary.profit)}
                </div>
                <Badge variant="outline" className={`${marginColor} border-0 mt-1`}>
                  {summary.profit_margin}% margin
                </Badge>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-muted-foreground/30 select-none">••••••</div>
                <p className="text-xs text-muted-foreground mt-1">Hidden in Admin Mode</p>
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
              {!showSensitiveData && <EyeOff className="h-3 w-3" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {showSensitiveData ? (
              <>
                <div className={`text-2xl font-bold ${summary.realized_profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatINR(summary.realized_profit)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Received minus paid expenses
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold text-muted-foreground/30 select-none">••••••</div>
                <p className="text-xs text-muted-foreground mt-1">Hidden in Admin Mode</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chart + Breakdown */}
      {showSensitiveData ? (
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
      ) : (
        <Card className="p-12 text-center border-dashed">
          <EyeOff className="h-10 w-10 mx-auto text-muted-foreground mb-4 opacity-20" />
          <h3 className="text-lg font-medium text-muted-foreground">Financial Details Hidden</h3>
          <p className="text-sm text-muted-foreground mt-1">Enable Admin Mode to view profit breakdown and charts.</p>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Payment Milestones</CardTitle>
              <MilestoneManager 
                projectId={project.id} 
                contractValue={project.contract_value} 
                existingMilestones={project.milestones}
              />
            </CardHeader>
            <CardContent>
              {!project.milestones || project.milestones.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/30">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <LayoutList className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">No Schedule Defined</h3>
                  <p className="text-sm text-muted-foreground max-w-[280px] mx-auto mt-1 mb-6">
                    Define your payment milestones and amounts to track project receivables.
                  </p>
                  <MilestoneManager 
                    projectId={project.id} 
                    contractValue={project.contract_value} 
                    existingMilestones={[]}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Overall Schedule Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-muted/30 border">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total Schedule</p>
                      <p className="text-sm font-bold mt-0.5">{formatINR(project.milestones.reduce((s, m) => s + m.amount, 0))}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Received</p>
                      <p className="text-sm font-bold mt-0.5 text-emerald-600">
                        {formatINR(milestoneStats.reduce((s, m) => s + m.received, 0))}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Pending</p>
                      <p className="text-sm font-bold mt-0.5 text-amber-600">
                        {formatINR(milestoneStats.reduce((s, m) => s + m.pending, 0))}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Completion</p>
                      <p className="text-sm font-bold mt-0.5">
                        {Math.round((milestoneStats.reduce((s, m) => s + m.received, 0) / project.contract_value) * 100)}%
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {milestoneStats.map((milestone) => (
                      <div 
                        key={milestone.id}
                        className="flex flex-col p-4 rounded-xl border bg-card hover:shadow-sm transition-all gap-4"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 p-1.5 rounded-full ${
                              milestone.progress >= 100 ? 'bg-emerald-100' : 
                              milestone.progress > 0 ? 'bg-amber-100' : 'bg-slate-100'
                            }`}>
                              {milestone.progress >= 100 ? (
                                <CheckCircle2 className={`h-4 w-4 ${milestone.progress >= 100 ? 'text-emerald-600' : 'text-slate-400'}`} />
                              ) : (
                                <Clock className={`h-4 w-4 ${milestone.progress > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-sm leading-tight">{milestone.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted">
                                  {milestone.percentage}%
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  Due: {milestone.due_date ? formatDate(milestone.due_date) : 'Not set'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">{formatINR(milestone.amount)}</p>
                            <Badge variant={
                              milestone.progress >= 100 ? 'default' : 
                              milestone.progress > 0 ? 'secondary' : 'outline'
                            } className="text-[10px] px-1.5 py-0 h-4 mt-1">
                              {milestone.progress >= 100 ? 'Fully Paid' : 
                               milestone.progress > 0 ? 'Partially Paid' : 'Pending'}
                            </Badge>
                            {milestone.progress < 100 && (
                              <div className="mt-2">
                                <IncomeForm 
                                  defaultProjectId={projectId} 
                                  defaultMilestoneId={milestone.id}
                                  triggerElement={
                                    <Button variant="outline" size="sm" className="h-6 px-2 text-[10px] w-full">
                                      Pay Now
                                    </Button>
                                  }
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">Payment Progress</span>
                            <span className="font-medium">{Math.round(milestone.progress)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                milestone.progress >= 100 ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(milestone.progress, 100)}%` }}
                            />
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-muted/20 border border-muted/30 mt-2">
                            <div>
                              <p className="text-[9px] uppercase text-muted-foreground font-medium">Income</p>
                              <p className="text-[11px] font-bold text-emerald-600">{formatINR(milestone.received)}</p>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase text-muted-foreground font-medium">Expenses</p>
                              <p className="text-[11px] font-bold text-red-600">{formatINR(milestone.expended)}</p>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase text-muted-foreground font-medium">Net Stage</p>
                              <p className={`text-[11px] font-bold ${milestone.netPosition >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                                {formatINR(milestone.netPosition)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          {insightsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-[200px]" />
              <Skeleton className="h-[150px]" />
              <Skeleton className="h-[250px]" />
            </div>
          ) : insights ? (
            <MilestoneInsightCard insights={insights} />
          ) : null}
        </div>
      </div>

      {/* Income History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {pnl?.income && pnl.income.length > 0 ? (
            <div className="space-y-3">
              {pnl.income.map((payment, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {payment.milestones?.name || 'Payment'}
                        {payment.milestones?.percentage && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({payment.milestones.percentage}%)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(payment.payment_date)} • {payment.payment_mode.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:text-right sm:flex-col sm:items-end gap-1 border-t sm:border-0 pt-2 sm:pt-0">
                    <p className="font-bold text-emerald-600">{formatINR(payment.amount)}</p>
                    <div className="flex items-center gap-2">
                      {payment.reference_number && (
                        <p className="text-[10px] text-muted-foreground font-mono bg-muted px-1 rounded">
                          Ref: {payment.reference_number}
                        </p>
                      )}
                      {showSensitiveData && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-[10px] text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          onClick={() => setCorrectionEntry({ type: 'income', data: payment })}
                        >
                          Correct
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No payments recorded yet</p>
          )}
        </CardContent>
      </Card>

      {/* Admin Correction Modal */}
      {correctionEntry && (
        <AdminCorrectionModal
          isOpen={!!correctionEntry}
          onClose={() => setCorrectionEntry(null)}
          type={correctionEntry.type}
          entry={correctionEntry.data}
        />
      )}

      {/* Project Settlement Wizard */}
      {project && (
        <SettlementWizard
          isOpen={isSettlementOpen}
          onClose={() => setIsSettlementOpen(false)}
          projectId={projectId}
          projectName={project.name}
        />
      )}
    </div>
  );
}
