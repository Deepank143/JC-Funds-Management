'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';
import { 
  Calendar as CalendarIcon, 
  IndianRupee, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  History,
  TrendingUp,
  TrendingDown,
  Loader2,
  Trash2
} from 'lucide-react';
import { formatINR, formatDate } from '@/lib/utils';
import { financeService } from '@/lib/services/financeService';
import { MilestoneStats } from '@/lib/types';

const editMilestoneSchema = z.object({
  name: z.string().min(1, 'Name required'),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Amount must be a positive number',
  }),
  due_date: z.string().optional(),
  status: z.string().min(1, 'Status required'),
});

type EditMilestoneFormData = z.infer<typeof editMilestoneSchema>;

interface MilestoneDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: MilestoneStats | null;
  projectId: string;
  contractValue: number;
}

export function MilestoneDrawer({ isOpen, onClose, milestone, projectId, contractValue }: MilestoneDrawerProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<EditMilestoneFormData>({
    resolver: zodResolver(editMilestoneSchema),
  });

  // Update form when milestone changes
  useEffect(() => {
    if (milestone && isOpen) {
      reset({
        name: milestone.name,
        amount: milestone.amount.toString(),
        due_date: milestone.due_date ? milestone.due_date.split('T')[0] : '',
        status: milestone.status || 'pending',
      });
      setIsEditing(false);
    }
  }, [milestone, isOpen, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: EditMilestoneFormData) => 
      financeService.updateMilestone(milestone!.id, {
        ...data,
        amount: Number(data.amount),
        percentage: (Number(data.amount) / contractValue) * 100
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-pnl', projectId] });
      toast({ title: 'Success', description: 'Milestone updated successfully' });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.error || 'Failed to update milestone', 
        variant: 'destructive' 
      });
    },
  });

  const onSubmit = (data: EditMilestoneFormData) => {
    updateMutation.mutate(data);
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-slate-100 text-slate-700 border-slate-200',
    due: 'bg-amber-100 text-amber-700 border-amber-200',
    paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    delayed: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); setIsEditing(false); } }}>
      <SheetContent className="sm:max-w-md w-full p-0 flex flex-col">
        {milestone ? (
          <>
            <SheetHeader className="p-6 pb-0">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className={statusColors[milestone.status || 'pending']}>
                  {milestone.status?.toUpperCase() || 'PENDING'}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  ID: {milestone.id.split('-')[0]}
                </span>
              </div>
              <SheetTitle className="text-2xl font-bold">{milestone.name}</SheetTitle>
              <SheetDescription>
                Payment Stage for {Math.round(milestone.percentage || 0)}% of contract value
              </SheetDescription>
            </SheetHeader>

            <ScrollArea className="flex-1 px-6 mt-6">
              {!isEditing ? (
                <div className="space-y-8 pb-8">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-muted/30 border border-muted/50">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Target Amount</p>
                      <p className="text-lg font-bold">{formatINR(milestone.amount)}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/30 border border-muted/50">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Due Date</p>
                      <p className="text-lg font-bold">
                        {milestone.due_date ? formatDate(milestone.due_date) : 'No Date'}
                      </p>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-muted-foreground">Settlement Progress</span>
                      <span className="font-bold text-emerald-600">{Math.round(milestone.progress)}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          milestone.progress >= 100 ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(milestone.progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Financial Position */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-primary" />
                      Financial Position
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 rounded-lg border bg-emerald-50/30 border-emerald-100">
                        <span className="text-sm flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-emerald-500" />
                          Received Income
                        </span>
                        <span className="font-bold text-emerald-700">{formatINR(milestone.received)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg border bg-red-50/30 border-red-100">
                        <span className="text-sm flex items-center gap-2">
                          <TrendingDown className="h-4 w-4 text-red-500" />
                          Allocated Expenses
                        </span>
                        <span className="font-bold text-red-700">{formatINR(milestone.expended)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center p-3 rounded-lg border bg-muted/30">
                        <span className="text-sm font-semibold">Net Position</span>
                        <span className={`font-bold ${milestone.netPosition >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                          {formatINR(milestone.netPosition)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setIsEditing(true)}>
                      Edit Details
                    </Button>
                    <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50" disabled>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Milestone Name</Label>
                      <Input id="name" {...register('name')} />
                      {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (₹)</Label>
                      <Input id="amount" type="number" {...register('amount')} />
                      {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="due_date">Due Date</Label>
                      <Input id="due_date" type="date" {...register('due_date')} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select 
                        defaultValue={milestone.status || 'pending'} 
                        onValueChange={(val) => setValue('status', val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="due">Due</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="delayed">Delayed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="flex-1" 
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1" 
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </ScrollArea>

            <SheetFooter className="p-6 pt-2 border-t bg-muted/10">
              <p className="text-[10px] text-muted-foreground text-center w-full">
                Any changes to the amount will adjust the percentage calculation for this milestone. 
                Ensure the total schedule matches the contract value in the bulk manager.
              </p>
            </SheetFooter>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
