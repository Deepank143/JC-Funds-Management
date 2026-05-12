'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Loader2 } from 'lucide-react';

import { financeService } from '@/lib/services/financeService';

const vendorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.enum(['material', 'labour', 'broker', 'other']),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  gstin: z.string().optional(),
  notes: z.string().optional(),
});

type VendorFormData = z.infer<typeof vendorSchema>;

interface VendorFormProps {
  vendor?: {
    id: string;
    name: string;
    type: 'material' | 'labour' | 'broker' | 'other';
    contact_person: string | null;
    phone: string | null;
    email: string | null;
    gstin: string | null;
    notes: string | null;
  };
  onSuccess?: () => void;
}

export function VendorForm({ vendor, onSuccess }: VendorFormProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const isEditing = !!vendor;

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: vendor ? {
      name: vendor.name,
      type: vendor.type,
      contact_person: vendor.contact_person || '',
      phone: vendor.phone || '',
      email: vendor.email || '',
      gstin: vendor.gstin || '',
      notes: vendor.notes || '',
    } : {
      name: '',
      type: 'material',
      contact_person: '',
      phone: '',
      email: '',
      gstin: '',
      notes: '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: VendorFormData) => {
      if (isEditing) {
        return financeService.updateVendor(vendor.id, data);
      } else {
        return financeService.createVendor(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast({
        title: isEditing ? 'Vendor updated' : 'Vendor created',
        description: isEditing ? 'Changes saved successfully.' : 'New vendor added.',
      });
      reset();
      setOpen(false);
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: isEditing ? 'Failed to update vendor.' : 'Failed to create vendor.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: VendorFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button variant="outline" size="sm">Edit</Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Vendor
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Vendor Name *</Label>
              <Input id="name" placeholder="e.g., ABC Steels" {...register('name')} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select onValueChange={(value: any) => setValue('type', value)} defaultValue={watch('type')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="material">Material</SelectItem>
                  <SelectItem value="labour">Labour Contractor</SelectItem>
                  <SelectItem value="broker">Broker</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input id="contact_person" placeholder="Name" {...register('contact_person')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" placeholder="+91 98765 43210" {...register('phone')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="vendor@example.com" {...register('email')} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gstin">GSTIN</Label>
            <Input id="gstin" placeholder="Optional GSTIN" {...register('gstin')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Additional information..." {...register('notes')} />
          </div>

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? 'Saving...' : 'Creating...'}
              </>
            ) : (
              isEditing ? 'Save Changes' : 'Create Vendor'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
