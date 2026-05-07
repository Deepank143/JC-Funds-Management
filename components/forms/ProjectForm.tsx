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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Loader2, Trash2 } from 'lucide-react';
import { formatINR } from '@/lib/utils';

const milestoneSchema = z.object({
  name: z.string().min(1, 'Milestone name required'),
  percentage: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) <= 100, {
    message: 'Percentage must be between 1 and 100',
  }),
  due_date: z.string().optional(),
});

const projectSchema = z.object({
  client_id: z.string().uuid('Please select a client'),
  name: z.string().min(2, 'Project name required'),
  location: z.string().optional(),
  description: z.string().optional(),
  contract_value: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Contract value must be greater than 0',
  }),
  start_date: z.string().optional(),
  expected_end_date: z.string().optional(),
  milestones: z.array(milestoneSchema).min(1, 'At least one milestone required'),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface Client {
  id: string;
  name: string;
}

const defaultMilestones = [
  { name: 'Advance', percentage: '10' },
  { name: 'Plinth Complete', percentage: '20' },
  { name: 'Slab Complete', percentage: '30' },
  { name: 'Finishing', percentage: '30' },
  { name: 'Handover', percentage: '10' },
];

export function ProjectForm() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      milestones: defaultMilestones,
    },
  });

  const milestones = watch('milestones') || [];
  const contractValue = Number(watch('contract_value')) || 0;

  const { data: clients } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await fetch('/api/clients');
      return res.json();
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ProjectFormData) => {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          contract_value: Number(data.contract_value),
          milestones: data.milestones.map((m, i) => ({
            ...m,
            percentage: Number(m.percentage),
            sort_order: i,
          })),
        }),
      });
      if (!res.ok) throw new Error('Failed to create project');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['active-projects'] });
      toast({ title: 'Project created', description: 'New project added successfully.' });
      reset();
      setOpen(false);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create project.', variant: 'destructive' });
    },
  });

  const addMilestone = () => {
    setValue('milestones', [...milestones, { name: '', percentage: '', due_date: '' }]);
  };

  const removeMilestone = (index: number) => {
    setValue('milestones', milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: string, value: string) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setValue('milestones', updated);
  };

  const onSubmit = (data: ProjectFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client_id">Client *</Label>
            <select
              id="client_id"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...register('client_id')}
            >
              <option value="">Select client</option>
              {clients?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.client_id && <p className="text-sm text-red-500">{errors.client_id.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input id="name" placeholder="e.g., Patel Residence" {...register('name')} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="e.g., Surat, Gujarat" {...register('location')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract_value">Contract Value (₹) *</Label>
            <Input id="contract_value" type="number" placeholder="3200000" {...register('contract_value')} />
            {errors.contract_value && <p className="text-sm text-red-500">{errors.contract_value.message}</p>}
            {contractValue > 0 && <p className="text-xs text-muted-foreground">{formatINR(contractValue)}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input id="start_date" type="date" {...register('start_date')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expected_end_date">Expected End</Label>
              <Input id="expected_end_date" type="date" {...register('expected_end_date')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Project details..." {...register('description')} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Milestones *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addMilestone}>
                <Plus className="mr-1 h-3 w-3" />
                Add
              </Button>
            </div>

            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-end gap-2 rounded-lg border p-3">
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Milestone name"
                    value={milestone.name}
                    onChange={(e) => updateMilestone(index, 'name', e.target.value)}
                  />
                </div>
                <div className="w-24 space-y-2">
                  <Input
                    placeholder="%"
                    value={milestone.percentage}
                    onChange={(e) => updateMilestone(index, 'percentage', e.target.value)}
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Input
                    type="date"
                    value={milestone.due_date || ''}
                    onChange={(e) => updateMilestone(index, 'due_date', e.target.value)}
                  />
                </div>
                {milestones.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeMilestone(index)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}

            {contractValue > 0 && (
              <div className="text-xs text-muted-foreground">
                {milestones.map((m, i) => (
                  <span key={i}>
                    {m.name}: {formatINR((Number(m.percentage) * contractValue) / 100)}
                    {i < milestones.length - 1 ? ' | ' : ''}
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
            ) : (
              'Create Project'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
