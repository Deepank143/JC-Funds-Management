'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

import { financeService } from '@/lib/services/financeService';

const incomeSchema = z.object({
  project_id: z.string().uuid('Please select a project'),
  milestone_id: z.string().optional(),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be greater than 0',
  }),
  payment_date: z.string().min(1, 'Date is required'),
  payment_mode: z.string().min(1, 'Mode is required'),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});

type IncomeFormData = z.infer<typeof incomeSchema>;

interface IncomeFormProps {
  defaultProjectId?: string;
  defaultMilestoneId?: string;
  triggerElement?: React.ReactNode;
}

export function IncomeForm({ defaultProjectId, defaultMilestoneId, triggerElement }: IncomeFormProps = {}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      project_id: defaultProjectId || undefined,
      milestone_id: defaultMilestoneId || undefined,
      payment_date: new Date().toISOString().split('T')[0],
      payment_mode: 'bank_transfer',
    },
  });

  const selectedProject = watch('project_id');

  // Fetch projects with their clients
  const { data: projects } = useQuery({
    queryKey: ['projects', 'active'],
    queryFn: () => financeService.getActiveProjects(),
  });

  // Fetch milestones for selected project
  const { data: milestones } = useQuery({
    queryKey: ['milestones', selectedProject],
    queryFn: () => financeService.getMilestones(selectedProject),
    enabled: !!selectedProject,
  });

  const mutation = useMutation({
    mutationFn: async (data: IncomeFormData) => {
      // Find client_id from selected project
      const project = projects?.find((p: any) => p.id === data.project_id);
      
      return financeService.createIncome({
        ...data,
        client_id: project?.client_id,
        amount: Number(data.amount),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['project-pnl'] });
      toast({
        title: 'Income recorded',
        description: 'The payment has been successfully recorded.',
      });
      reset();
      setOpen(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to record income. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: IncomeFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerElement || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Record Income
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Payment Received</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project_id">Project *</Label>
            <Select onValueChange={(value) => setValue('project_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(projects) && projects.map((project: any) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.project_id && <p className="text-sm text-red-500">{errors.project_id.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="milestone_id">Against Milestone</Label>
            <Select onValueChange={(value) => {
              setValue('milestone_id', value);
              const milestone = milestones?.find((m: any) => m.id === value);
              const currentAmount = watch('amount');
              // Only auto-fill if the amount is currently empty or 0 to avoid overwriting manual input
              if (milestone && (!currentAmount || currentAmount === '0' || currentAmount === '')) {
                setValue('amount', milestone.amount.toString());
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select milestone (optional)" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(milestones) && milestones.map((milestone: any) => (
                  <SelectItem key={milestone.id} value={milestone.id}>
                    {milestone.name} - ₹{milestone.amount?.toLocaleString()} ({milestone.status})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹) *</Label>
            <Input id="amount" type="number" placeholder="Enter amount" {...register('amount')} />
            {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_date">Date *</Label>
            <Input id="payment_date" type="date" {...register('payment_date')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_mode">Payment Mode *</Label>
            <Select onValueChange={(value) => setValue('payment_mode', value)} defaultValue="bank_transfer">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference_number">Reference Number</Label>
            <Input id="reference_number" placeholder="UTR / Cheque number" {...register('reference_number')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Additional details..." {...register('notes')} />
          </div>

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Record Payment'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
