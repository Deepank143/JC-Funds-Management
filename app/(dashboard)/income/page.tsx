'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAdmin } from '@/contexts/AdminContext';
import { IncomeForm } from '@/components/forms/IncomeForm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function IncomePage() {
  const { canWrite } = useAdmin();

  const { data: income, isLoading } = useQuery({
    queryKey: ['income'],
    queryFn: async () => {
      const res = await fetch('/api/income');
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Income</h1>
          <p className="text-muted-foreground">Manage client payments and receipts.</p>
        </div>
        {canWrite && <IncomeForm />}
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Client / Project</TableHead>
              <TableHead>Milestone</TableHead>
              <TableHead>Mode / Ref</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : !income?.length ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No income records found.
                </TableCell>
              </TableRow>
            ) : (
              income.map((record: any) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {format(new Date(record.payment_date), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{record.clients?.name}</div>
                    <div className="text-sm text-muted-foreground">{record.projects?.name}</div>
                  </TableCell>
                  <TableCell>
                    {record.milestones ? (
                      <Badge variant="outline">{record.milestones.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">Advance / Direct</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="capitalize">{record.payment_mode.replace('_', ' ')}</div>
                    {record.reference_number && (
                      <div className="text-sm text-muted-foreground">{record.reference_number}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium text-green-600">
                    ₹{record.amount?.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
