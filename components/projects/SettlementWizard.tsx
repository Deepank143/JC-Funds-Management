'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '@/lib/services/financeService';
import { formatINR } from '@/lib/utils';
import {
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  CreditCard,
  Wallet,
  ClipboardCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

interface SettlementWizardProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

export function SettlementWizard({
  isOpen,
  onClose,
  projectId,
  projectName,
}: SettlementWizardProps) {
  const [step, setStep] = useState(1);
  const queryClient = useQueryClient();

  // ISSUE-04 FIX: staleTime:0 ensures fresh data every time wizard opens
  const { data: gaps, isLoading } = useQuery({
    queryKey: ['settlement-gaps', projectId],
    queryFn: () => financeService.getSettlementGaps(projectId),
    enabled: isOpen,
    staleTime: 0,
  });

  const mutation = useMutation({
    mutationFn: (data: any) => financeService.finalizeSettlement(projectId, data),
    onSuccess: () => {
      toast.success('Project settlement finalized. Books are now locked.');
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['settlement-gaps', projectId] });
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to finalize settlement');
    },
  });

  // ISSUE-04 FIX: Reset step to 1 when modal closes
  const handleClose = () => {
    setStep(1);
    onClose();
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 3));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  // BUG-01 FIX: Use the server-computed true totals, not filtered gap arrays
  const totals = gaps?.totals;
  const netProfitColor =
    (totals?.netProfit ?? 0) >= 0 ? 'text-emerald-700' : 'text-red-700';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <DialogTitle>Project Settlement: {projectName}</DialogTitle>
            <span className="text-xs font-medium text-muted-foreground">
              Step {step} of {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="h-1" />
        </DialogHeader>

        <div className="py-6">
          {/* ISSUE-07 FIX: Loading skeleton instead of blank/null render */}
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ) : (
            <>
              {/* ── Step 1: Income Reconciliation ── */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600 font-semibold mb-4">
                    <Wallet className="h-5 w-5" />
                    <h3>Step 1: Income Reconciliation</h3>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Reviewing milestones with missing payments. Ensure all client
                    payments are recorded.
                  </p>

                  {(gaps?.incomeGaps?.length ?? 0) > 0 ? (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      {gaps!.incomeGaps.map((gap: any) => (
                        <div
                          key={gap.id}
                          className="p-3 border rounded-lg bg-emerald-50/50 flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium text-sm">{gap.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Target: {formatINR(gap.target)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-red-600">
                              -{formatINR(gap.gap)}
                            </p>
                            <p className="text-[10px] text-emerald-600">
                              Rec: {formatINR(gap.received)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center bg-emerald-50 rounded-xl border border-emerald-100">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500 mb-2" />
                      <p className="font-medium text-emerald-800">
                        All income accounted for!
                      </p>
                      <p className="text-xs text-emerald-600">
                        No missing payments found across milestones.
                      </p>
                    </div>
                  )}

                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                    <p className="text-xs text-amber-800">
                      <strong>Note:</strong> If payments are missing, use the
                      &quot;Back Entry&quot; feature before finalizing. Finalizing
                      will &quot;Write Off&quot; any remaining gaps to lock the books.
                    </p>
                  </div>
                </div>
              )}

              {/* ── Step 2: Expense Reconciliation ── */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-600 font-semibold mb-4">
                    <CreditCard className="h-5 w-5" />
                    <h3>Step 2: Expense Reconciliation</h3>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Reviewing unpaid or partial expenses. Ensure all vendor dues
                    are cleared.
                  </p>

                  {(gaps?.expenseGaps?.length ?? 0) > 0 ? (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                      {gaps!.expenseGaps.map((gap: any) => (
                        <div
                          key={gap.id}
                          className="p-3 border rounded-lg bg-blue-50/50 flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium text-sm">{gap.description}</p>
                            <p className="text-xs text-muted-foreground">{gap.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-red-600">
                              -{formatINR(gap.gap)}
                            </p>
                            <p className="text-[10px] text-blue-600">
                              Amount: {formatINR(gap.amount)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center bg-blue-50 rounded-xl border border-blue-100">
                      <CheckCircle2 className="h-10 w-10 text-blue-500 mb-2" />
                      <p className="font-medium text-blue-800">No outstanding dues!</p>
                      <p className="text-xs text-blue-600">
                        All recorded expenses are marked as fully paid.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Step 3: Final P&L Lock ── */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-4">
                    <ClipboardCheck className="h-5 w-5" />
                    <h3>Step 3: Final P&amp;L Lock</h3>
                  </div>

                  {/* BUG-01 FIX: Display TRUE totals from server, not filtered gap arrays */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-xl">
                      <p className="text-xs text-muted-foreground mb-1">
                        Total Income Received
                      </p>
                      <p className="text-xl font-bold text-emerald-600">
                        {formatINR(totals?.totalIncomeReceived ?? 0)}
                      </p>
                    </div>
                    <div className="p-4 bg-muted rounded-xl">
                      <p className="text-xs text-muted-foreground mb-1">
                        Total Expenses Paid
                      </p>
                      <p className="text-xl font-bold text-red-600">
                        {formatINR(totals?.totalExpensesPaid ?? 0)}
                      </p>
                    </div>
                  </div>

                  {/* Show outstanding gaps as a warning */}
                  {((gaps?.summary?.totalIncomeGap ?? 0) > 0 ||
                    (gaps?.summary?.totalExpenseGap ?? 0) > 0) && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-800 space-y-1">
                      <p className="font-semibold flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" /> Outstanding Gaps
                        (will be written off)
                      </p>
                      {(gaps?.summary?.totalIncomeGap ?? 0) > 0 && (
                        <p>
                          Income gap:{' '}
                          <span className="font-bold">
                            {formatINR(gaps!.summary.totalIncomeGap)}
                          </span>
                        </p>
                      )}
                      {(gaps?.summary?.totalExpenseGap ?? 0) > 0 && (
                        <p>
                          Unpaid vendor dues:{' '}
                          <span className="font-bold">
                            {formatINR(gaps!.summary.totalExpenseGap)}
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-center">
                    <p className="text-sm text-indigo-700 font-medium mb-1">
                      Project Net Profit (Settled)
                    </p>
                    <p className={`text-3xl font-black ${netProfitColor}`}>
                      {formatINR(totals?.netProfit ?? 0)}
                    </p>
                    {totals && totals.totalExpensesAmount > totals.totalExpensesPaid && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Note: {formatINR(totals.totalExpensesAmount - totals.totalExpensesPaid)} in vendor dues remain unpaid
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-center text-muted-foreground px-8">
                    By clicking &quot;Finalize &amp; Lock&quot;, the project status will
                    change to <strong>Completed</strong>. Financial records will
                    become read-only to prevent drift.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between w-full border-t pt-4">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={step === 1 || mutation.isPending || isLoading}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>

          {step < 3 ? (
            <Button
              onClick={nextStep}
              disabled={isLoading}
              className="flex items-center gap-1"
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={() => mutation.mutate({ status: 'completed' })}
              disabled={mutation.isPending || isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 font-bold"
            >
              {mutation.isPending ? 'Settling...' : 'Finalize & Lock Books'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
