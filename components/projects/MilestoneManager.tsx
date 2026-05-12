'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, Loader2, Calculator, Info } from 'lucide-react';
import { formatINR } from '@/lib/utils';

import { financeService } from '@/lib/services/financeService';

const milestoneSchema = z.object({
  name: z.string().min(1, 'Name required'),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount > 0',
  }),
  due_date: z.string().optional(),
});

const scheduleSchema = z.object({
  milestones: z.array(milestoneSchema).min(4, 'Minimum 4 milestones').max(20, 'Maximum 20 milestones'),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

interface MilestoneManagerProps {
  projectId: string;
  contractValue: number;
  existingMilestones?: any[];
}

export function MilestoneManager({ projectId, contractValue, existingMilestones = [] }: MilestoneManagerProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      milestones: existingMilestones.length > 0 
        ? existingMilestones.map(m => ({
            name: m.name,
            amount: m.amount.toString(),
            due_date: m.due_date || '',
          }))
        : Array(4).fill({ name: '', amount: '', due_date: '' }),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "milestones"
  });

  const watchedMilestones = watch('milestones');
  const totalAllocated = watchedMilestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
  const remaining = contractValue - totalAllocated;
  const isBalanced = Math.abs(remaining) < 0.01;

  const handleAutoBalance = () => {
    if (fields.length === 0) return;
    const lastIndex = fields.length - 1;
    const currentLastAmount = Number(watchedMilestones[lastIndex].amount) || 0;
    const newAmount = Math.max(0, currentLastAmount + remaining);
    setValue(`milestones.${lastIndex}.amount`, newAmount.toString());
    toast({ 
      title: 'Auto-Balanced', 
      description: `Added ₹${remaining.toLocaleString()} to the last milestone.` 
    });
  };

  const handleSplitEqually = () => {
    const splitAmount = (contractValue / fields.length).toFixed(2);
    fields.forEach((_, index) => {
      setValue(`milestones.${index}.amount`, splitAmount);
    });
    toast({ 
      title: 'Split Equally', 
      description: `Divided ${formatINR(contractValue)} into ${fields.length} equal parts.` 
    });
  };

  const mutation = useMutation({
    mutationFn: (data: ScheduleFormData) => 
      financeService.updateMilestones(projectId, data.milestones, contractValue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-pnl', projectId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      toast({ title: 'Schedule Updated', description: 'Payment milestones saved successfully.' });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const onSubmit = (data: ScheduleFormData) => {
    if (!isBalanced) {
      toast({ 
        title: 'Imbalance detected', 
        description: `Total milestones (₹${totalAllocated.toLocaleString()}) must match contract value (₹${contractValue.toLocaleString()}).`,
        variant: 'destructive'
      });
      return;
    }
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {existingMilestones.length > 0 ? 'Edit Schedule' : 'Setup Schedule'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Payment Schedule</DialogTitle>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              Define 4 to 20 milestones. Total must equal {formatINR(contractValue)}.
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold text-primary" onClick={handleSplitEqually}>
                Split Equally
              </Button>
              <Button type="button" variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold text-emerald-600" onClick={handleAutoBalance} disabled={isBalanced}>
                Auto-Balance
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="bg-muted/50 p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isBalanced ? 'bg-emerald-100' : 'bg-amber-100'}`}>
              <Calculator className={`h-5 w-5 ${isBalanced ? 'text-emerald-600' : 'text-amber-600'}`} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Allocated</p>
              <p className="text-lg font-bold">{formatINR(totalAllocated)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Remaining</p>
            <p className={`text-lg font-bold ${isBalanced ? 'text-emerald-600' : 'text-red-600'}`}>
              {remaining > 0 ? `+${formatINR(remaining)}` : remaining < 0 ? formatINR(remaining) : 'Balanced'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-col sm:flex-row gap-2 items-start sm:items-end p-3 border rounded-lg bg-background relative group">
                <div className="flex-1 w-full space-y-1.5">
                  <Label className="text-[10px] uppercase text-muted-foreground">Milestone Name</Label>
                  <Input 
                    placeholder="e.g. Foundation Complete"
                    {...register(`milestones.${index}.name`)}
                  />
                </div>
                <div className="w-full sm:w-40 space-y-1.5">
                  <Label className="text-[10px] uppercase text-muted-foreground">Amount (₹)</Label>
                  <Input 
                    type="number"
                    placeholder="0"
                    {...register(`milestones.${index}.amount`)}
                  />
                </div>
                <div className="w-full sm:w-40 space-y-1.5">
                  <Label className="text-[10px] uppercase text-muted-foreground">Due Date</Label>
                  <Input 
                    type="date"
                    {...register(`milestones.${index}.due_date`)}
                  />
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background border rounded-full h-7 w-7 text-red-500 shadow-sm"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 4}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center py-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => append({ name: '', amount: '', due_date: '' })}
              disabled={fields.length >= 20}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Milestone ({fields.length}/20)
            </Button>
            
            {!isBalanced && (
              <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                <Info className="h-3 w-3" />
                Amounts must sum to {formatINR(contractValue)}
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button type="submit" className="w-full sm:w-auto" disabled={mutation.isPending || !isBalanced}>
              {mutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                'Save Payment Schedule'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
