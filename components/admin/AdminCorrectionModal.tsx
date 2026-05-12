'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService } from '@/lib/services/financeService';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

const correctionSchema = z.object({
  amount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  payment_date: z.string().min(1, 'Date is required'),
  correction_reason: z.string().min(10, 'Reason must be at least 10 characters'),
  notes: z.string().optional(),
});

interface AdminCorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'income' | 'expense';
  entry: any;
}

export function AdminCorrectionModal({ isOpen, onClose, type, entry }: AdminCorrectionModalProps) {
  const queryClient = useQueryClient();
  
  const form = useForm<z.infer<typeof correctionSchema>>({
    resolver: zodResolver(correctionSchema),
    defaultValues: {
      amount: entry?.amount || 0,
      payment_date: entry?.payment_date || entry?.expense_date || new Date().toISOString().split('T')[0],
      correction_reason: '',
      notes: entry?.notes || '',
    },
  });

  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof correctionSchema>) => {
      const { correction_reason, ...data } = values;
      if (type === 'income') {
        return financeService.correctIncome(entry.id, data, correction_reason);
      } else {
        return financeService.correctExpense(entry.id, data, correction_reason);
      }
    },
    onSuccess: () => {
      toast.success(`${type === 'income' ? 'Income' : 'Expense'} entry corrected`);
      queryClient.invalidateQueries({ queryKey: ['project-pnl'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to apply correction');
    },
  });

  function onSubmit(values: z.infer<typeof correctionSchema>) {
    mutation.mutate(values);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            Financial Amendment
          </DialogTitle>
          <DialogDescription>
            You are correcting a {type} entry. This action will be logged for audit purposes.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Corrected Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="payment_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Corrected Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="correction_reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Amendment</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., Original entry was partial, missed GST, etc."
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending} className="bg-amber-600 hover:bg-amber-700">
                {mutation.isPending ? 'Applying...' : 'Apply Correction'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
