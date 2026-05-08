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
import { Loader2, TrendingUp, Building, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Income</h1>
          <p className="text-muted-foreground">Manage client payments and receipts.</p>
        </div>
        {canWrite && <IncomeForm />}
      </div>

      {/* Mobile View: Cards */}
      <div className="grid gap-4 md:hidden">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !income?.length ? (
          <p className="text-center py-8 text-muted-foreground">No records found.</p>
        ) : (
          income.map((record: any) => (
            <Card key={record.id} className="overflow-hidden border-l-4 border-l-emerald-500">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      {format(new Date(record.payment_date), 'dd MMM yyyy')}
                    </p>
                    <div className="font-bold text-lg text-emerald-700">
                      ₹{record.amount?.toLocaleString()}
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                    Received
                  </Badge>
                </div>

                <div className="space-y-2 pt-2 border-t text-sm">
                  <div className="flex items-center gap-2">
                    <Building className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">{record.clients?.name}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{record.projects?.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CreditCard className="h-3.5 w-3.5" />
                    <span className="capitalize">{record.payment_mode.replace('_', ' ')}</span>
                    {record.reference_number && (
                      <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                        {record.reference_number}
                      </span>
                    )}
                  </div>
                </div>

                {record.milestones && (
                  <div className="pt-2 flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-xs font-medium text-blue-600">
                      Milestone: {record.milestones.name}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block rounded-md border bg-card overflow-x-auto">
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
