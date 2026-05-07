'use client';

import { useQuery } from '@tanstack/react-query';
import { useAdmin } from '@/contexts/AdminContext';
import { VendorForm } from '@/components/forms/VendorForm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Receipt, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';

export default function VendorLedgerPage({ params }: { params: { id: string } }) {
  const { canWrite } = useAdmin();
  const vendorId = params.id;

  const { data: vendor, isLoading: vendorLoading } = useQuery({
    queryKey: ['vendors', vendorId],
    queryFn: async () => {
      const res = await fetch(`/api/vendors/${vendorId}`);
      if (!res.ok) throw new Error('Vendor not found');
      return res.json();
    },
  });

  const { data: ledgerData, isLoading: ledgerLoading } = useQuery({
    queryKey: ['vendors', vendorId, 'ledger'],
    queryFn: async () => {
      const res = await fetch(`/api/vendors/${vendorId}/ledger`);
      if (!res.ok) throw new Error('Ledger not found');
      return res.json();
    },
  });

  if (vendorLoading || ledgerLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!vendor) return <div>Vendor not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/vendors" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{vendor.name}</h1>
          <p className="text-muted-foreground capitalize">{vendor.type} Vendor</p>
        </div>
        {canWrite && <VendorForm vendor={vendor} />}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₹{ledgerData?.summary.total_billed?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{ledgerData?.summary.total_paid?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{ledgerData?.summary.current_balance?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Amount owed to vendor</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Billed</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Running Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!ledgerData?.ledger?.length ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No transactions found for this vendor.
                </TableCell>
              </TableRow>
            ) : (
              ledgerData.ledger.map((exp: any) => (
                <TableRow key={exp.id}>
                  <TableCell>
                    {format(new Date(exp.expense_date), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell>{exp.projects?.name}</TableCell>
                  <TableCell>{exp.expense_categories?.name}</TableCell>
                  <TableCell className="text-right font-medium text-red-600">
                    {exp.amount ? `₹${exp.amount.toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell className="text-right font-medium text-green-600">
                    {exp.amount_paid ? `₹${exp.amount_paid.toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    ₹{exp.running_balance.toLocaleString()}
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
