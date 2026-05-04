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

const expenseSchema = z.object({
  project_id: z.string().uuid('Please select a project'),
  category_id: z.string().uuid('Please select a category'),
  subcategory_id: z.string().uuid('Please select a sub-category'),
  vendor_id: z.string().optional(),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be greater than 0',
  }),
  expense_date: z.string().min(1, 'Date is required'),
  payment_status: z.enum(['paid', 'unpaid', 'partial']),
  payment_mode: z.string().optional(),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface Project {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface SubCategory {
  id: string;
  name: string;
  category_id: string;
}

interface Vendor {
  id: string;
  name: string;
  type: string;
}

export function ExpenseForm() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      expense_date: new Date().toISOString().split('T')[0],
      payment_status: 'unpaid',
    },
  });

  const selectedCategory = watch('category_id');

  // Fetch projects
  const { data: projects } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects?status=active');
      return res.json();
    },
  });

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await fetch('/api/expenses/categories');
      return res.json();
    },
  });

  // Fetch sub-categories
  const { data: subcategories } = useQuery<SubCategory[]>({
    queryKey: ['subcategories', selectedCategory],
    queryFn: async () => {
      if (!selectedCategory) return [];
      const res = await fetch(`/api/expenses/subcategories?category_id=${selectedCategory}`);
      return res.json();
    },
    enabled: !!selectedCategory,
  });

  // Fetch vendors
  const { data: vendors } = useQuery<Vendor[]>({
    queryKey: ['vendors'],
    queryFn: async () => {
      const res = await fetch('/api/vendors');
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ExpenseFormData) => {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          amount: Number(data.amount),
        }),
      });
      if (!res.ok) throw new Error('Failed to create expense');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      toast({
        title: 'Expense recorded',
        description: 'The expense has been successfully added.',
      });
      reset();
      setOpen(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to record expense. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ExpenseFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record New Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Project */}
          <div className="space-y-2">
            <Label htmlFor="project_id">Project *</Label>
            <Select onValueChange={(value) => setValue('project_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(projects) && projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.project_id && (
              <p className="text-sm text-red-500">{errors.project_id.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category_id">Category *</Label>
            <Select onValueChange={(value) => setValue('category_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(categories) && categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-sm text-red-500">{errors.category_id.message}</p>
            )}
          </div>

          {/* Sub-category */}
          <div className="space-y-2">
            <Label htmlFor="subcategory_id">Sub-Category *</Label>
            <Select onValueChange={(value) => setValue('subcategory_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select sub-category" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(subcategories) && subcategories.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.subcategory_id && (
              <p className="text-sm text-red-500">{errors.subcategory_id.message}</p>
            )}
          </div>

          {/* Vendor */}
          <div className="space-y-2">
            <Label htmlFor="vendor_id">Vendor / Labour</Label>
            <Select onValueChange={(value) => setValue('vendor_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select vendor (optional)" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(vendors) && vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name} ({vendor.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹) *</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              {...register('amount')}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="expense_date">Date *</Label>
            <Input
              id="expense_date"
              type="date"
              {...register('expense_date')}
            />
          </div>

          {/* Payment Status */}
          <div className="space-y-2">
            <Label htmlFor="payment_status">Payment Status *</Label>
            <Select 
              onValueChange={(value: 'paid' | 'unpaid' | 'partial') => setValue('payment_status', value)}
              defaultValue="unpaid"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Mode (conditional) */}
          {watch('payment_status') === 'paid' && (
            <div className="space-y-2">
              <Label htmlFor="payment_mode">Payment Mode</Label>
              <Select onValueChange={(value) => setValue('payment_mode', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Reference Number */}
          <div className="space-y-2">
            <Label htmlFor="reference_number">Reference Number</Label>
            <Input
              id="reference_number"
              placeholder="Invoice / UTR / Cheque number"
              {...register('reference_number')}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional details..."
              {...register('notes')}
            />
          </div>

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Record Expense'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
