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
import { Loader2, Receipt, ArrowLeft, Building, Calendar, Wallet, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { formatINR } from '@/lib/utils';

export default function VendorLedgerPage({ params }: { params: { id: string } }) {
  const { canWrite, isAdminMode, isOwner } = useAdmin();
  const vendorId = params.id;

  const showSensitiveData = isOwner ? isAdminMode : false;

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

  if (!vendor) return <div className="p-8 text-center">Vendor not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Link href="/vendors" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{vendor.name}</h1>
            <p className="text-muted-foreground capitalize text-sm">{vendor.type} Vendor</p>
          </div>
        </div>
        {canWrite && <VendorForm vendor={vendor} />}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatINR(ledgerData?.summary.total_billed || 0)}
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
              {formatINR(ledgerData?.summary.total_paid || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center justify-between w-full">
              Outstanding
              {!showSensitiveData && <EyeOff className="h-3 w-3 text-muted-foreground" />}
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {showSensitiveData ? (
              <div className="text-2xl font-bold">
                {formatINR(ledgerData?.summary.current_balance || 0)}
              </div>
            ) : (
              <div className="text-2xl font-bold text-muted-foreground/40 select-none">••••••</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">Amount owed to vendor</p>
          </CardContent>
        </Card>
      </div>

      {/* Mobile View: Transaction Cards */}
      <div className="grid gap-4 md:hidden">
        {!ledgerData?.ledger?.length ? (
          <p className="text-center py-8 text-muted-foreground">No transactions found.</p>
        ) : (
          ledgerData.ledger.map((exp: any) => (
            <Card key={exp.id} className="overflow-hidden border-l-4 border-l-red-500">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      {format(new Date(exp.expense_date), 'dd MMM yyyy')}
                    </p>
                    <div className="flex items-center gap-1.5 font-semibold text-sm">
                      <Building className="h-3.5 w-3.5 text-primary" />
                      {exp.projects?.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-red-600">Billed: {formatINR(exp.amount)}</div>
                    <div className="text-xs font-medium text-green-600">Paid: {formatINR(exp.amount_paid)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t text-sm">
                  <span className="text-muted-foreground">{exp.expense_categories?.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">Bal:</span>
                    <span className="font-bold">
                      {showSensitiveData ? formatINR(exp.running_balance) : '••••••'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block rounded-md border bg-card overflow-hidden">
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
                    {exp.amount ? formatINR(exp.amount) : '-'}
                  </TableCell>
                  <TableCell className="text-right font-medium text-green-600">
                    {exp.amount_paid ? formatINR(exp.amount_paid) : '-'}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {showSensitiveData ? formatINR(exp.running_balance) : (
                      <span className="text-muted-foreground/30 font-mono tracking-tighter">••••••</span>
                    )}
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
