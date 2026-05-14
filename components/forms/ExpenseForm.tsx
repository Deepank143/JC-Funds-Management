'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
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
import { Plus, UploadCloud, Loader2 } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';

import { financeService } from '@/lib/services/financeService';

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
  milestone_id: z.string().optional().nullable(),
  amount_paid: z.string().optional(),
  notes: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

export function ExpenseForm() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();
  const supabase = createClientComponentClient();

  const { isAdminMode, canManageFunds } = useAdmin();

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      expense_date: new Date().toISOString().split('T')[0],
      payment_status: 'unpaid',
    },
  });

  const selectedCategory = watch('category_id');
  const selectedProject = watch('project_id');
  const currentStatus = watch('payment_status');

  // Reset milestone when project changes to prevent cross-project linking
  useEffect(() => {
    setValue('milestone_id', null);
  }, [selectedProject, setValue]);

  const { data: projects } = useQuery({
    queryKey: ['projects', 'active'],
    queryFn: () => financeService.getActiveProjects(),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => financeService.getExpenseCategories(),
  });

  const { data: subcategories } = useQuery({
    queryKey: ['subcategories', selectedCategory],
    queryFn: () => financeService.getExpenseSubcategories(selectedCategory),
    enabled: !!selectedCategory,
  });
  
  const { data: projectMilestones } = useQuery({
    queryKey: ['milestones', selectedProject],
    queryFn: async () => {
      const project = await financeService.getProjectDetail(selectedProject);
      return project.milestones || [];
    },
    enabled: !!selectedProject,
  });

  const { data: vendors } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => financeService.getVendors(),
  });

  const mutation = useMutation({
    mutationFn: async (data: ExpenseFormData & { bill_photo_url?: string }) => {
      // Safety check: if user tries to submit 'paid' without permission
      if (!canManageFunds && data.payment_status !== 'unpaid') {
        throw new Error('Unauthorized: Only Admin can authorize payments.');
      }

      return financeService.createExpense({
        ...data,
        amount: Number(data.amount),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      queryClient.invalidateQueries({ queryKey: ['project'] });
      queryClient.invalidateQueries({ queryKey: ['project-pnl'] });
      toast({
        title: 'Expense recorded',
        description: 'The expense has been successfully added.',
      });
      reset();
      setFile(null);
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to record expense. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      let receipt_url = null;
      if (file) {
        setIsUploading(true);
        const fileExt = file.name.split('.').pop();
        // Use timestamp and random string to prevent naming collisions
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('bill-photos')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('bill-photos')
          .getPublicUrl(filePath);

        receipt_url = publicUrlData.publicUrl;
        setIsUploading(false);
      }

      mutation.mutate({ 
        ...data, 
        bill_photo_url: receipt_url || undefined,
        amount_paid: data.payment_status === 'paid' ? data.amount : data.amount_paid
      });
    } catch (error) {
      setIsUploading(false);
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Could not upload the bill photo.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record New Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="milestone_id">Project Milestone (Optional)</Label>
            <Select onValueChange={(value) => setValue('milestone_id', value === 'none' ? null : value)}>
              <SelectTrigger>
                <SelectValue placeholder={selectedProject ? "Link to a milestone" : "Select a project first"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Milestone (General Expense)</SelectItem>
                {Array.isArray(projectMilestones) && projectMilestones.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} (₹{Number(m.amount).toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">
              Linking expenses to milestones helps track construction stage profitability.
            </p>
          </div>

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

          <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="expense_date">Date *</Label>
              <Input
                id="expense_date"
                type="date"
                {...register('expense_date')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Bill Photo / Receipt</Label>
            <div className="flex items-center gap-4">
              <Input
                id="receipt"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
              {file && <span className="text-sm text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis w-32">{file.name}</span>}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="payment_status">Payment Status *</Label>
              {!canManageFunds && (
                <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded border border-amber-100 font-medium">
                  Admin Only
                </span>
              )}
            </div>
            <Select 
              onValueChange={(value: 'paid' | 'unpaid' | 'partial') => setValue('payment_status', value)}
              value={watch('payment_status')}
              disabled={!canManageFunds}
            >
              <SelectTrigger className={!canManageFunds ? "bg-muted" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unpaid">Unpaid (Entry Only)</SelectItem>
                <SelectItem value="paid" disabled={!canManageFunds}>
                  Paid (Authorize Fund Release)
                </SelectItem>
                <SelectItem value="partial" disabled={!canManageFunds}>
                  Partial Payment
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(watch('payment_status') === 'paid' || watch('payment_status') === 'partial') && (
            <div className="space-y-4">
              {watch('payment_status') === 'partial' && (
                <div className="space-y-2">
                  <Label htmlFor="amount_paid">Amount Actually Paid (₹) *</Label>
                  <Input
                    id="amount_paid"
                    type="number"
                    placeholder="e.g. 5000"
                    {...register('amount_paid')}
                  />
                  {errors.amount_paid && (
                    <p className="text-sm text-red-500">{errors.amount_paid.message}</p>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
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

                <div className="space-y-2">
                  <Label htmlFor="reference_number">Reference Number</Label>
                  <Input
                    id="reference_number"
                    placeholder="UTR / Cheque"
                    {...register('reference_number')}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional details..."
              {...register('notes')}
            />
          </div>

          <Button type="submit" className="w-full" disabled={mutation.isPending || isUploading}>
            {(mutation.isPending || isUploading) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploading ? 'Uploading Receipt...' : 'Saving...'}
              </>
            ) : 'Record Expense'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
