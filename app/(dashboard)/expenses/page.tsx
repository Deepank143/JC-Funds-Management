'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdmin } from '@/contexts/AdminContext';
import { ExpenseForm } from '@/components/forms/ExpenseForm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Loader2, CheckCircle, Receipt, Building, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

function SettleExpenseDialog({ expense }: { expense: any }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('bank_transfer');
  const [ref, setRef] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/expenses/${expense.id}/pay`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: expense.amount,
          payment_mode: mode,
          reference_number: ref
        }),
      });
      if (!res.ok) throw new Error('Failed to settle expense');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-kpis'] });
      toast({ title: 'Expense settled', description: 'Marked as paid successfully.' });
      setOpen(false);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message || 'Failed to settle expense.', variant: 'destructive' });
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
          Mark Paid
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settle Expense: ₹{expense.amount?.toLocaleString()}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Payment Mode</Label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Reference / UTR Number</Label>
            <Input value={ref} onChange={e => setRef(e.target.value)} placeholder="Optional" />
          </div>
          <Button 
            className="w-full bg-green-600 hover:bg-green-700" 
            onClick={() => mutation.mutate()} 
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {mutation.isPending ? 'Settling...' : 'Confirm Payment'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ExpensesPage() {
  const { canWrite, canManageFunds } = useAdmin();

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const res = await fetch('/api/expenses');
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Track project costs and vendor bills.</p>
        </div>
        {canWrite && <ExpenseForm />}
      </div>

      {/* Mobile View: Cards */}
      <div className="grid gap-4 md:hidden">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !expenses?.length ? (
          <p className="text-center py-8 text-muted-foreground">No records found.</p>
        ) : (
          expenses.map((expense: any) => (
            <Card key={expense.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase">
                      {format(new Date(expense.expense_date), 'dd MMM yyyy')}
                    </p>
                    <div className="flex items-center gap-1.5 font-semibold">
                      <Building className="h-3.5 w-3.5 text-primary" />
                      {expense.projects?.name}
                    </div>
                  </div>
                  <Badge variant={expense.payment_status === 'paid' ? 'default' : 'destructive'}
                         className={expense.payment_status === 'paid' ? 'bg-green-600 hover:bg-green-700' : ''}>
                    {expense.payment_status}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  {expense.vendors?.name || 'No Vendor'}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    {expense.receipt_url && (
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-blue-600" asChild>
                        <a href={expense.receipt_url} target="_blank" rel="noreferrer">
                          <Receipt className="h-3.5 w-3.5 mr-1" /> Receipt
                        </a>
                      </Button>
                    )}
                  </div>
                  <div className="text-lg font-bold">
                    ₹{expense.amount?.toLocaleString()}
                  </div>
                </div>

                {canManageFunds && expense.payment_status !== 'paid' && (
                  <div className="pt-2">
                    <SettleExpenseDialog expense={expense} />
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
              <TableHead>Project / Category</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Receipt</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              {canManageFunds && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={canManageFunds ? 7 : 6} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : !expenses?.length ? (
              <TableRow>
                <TableCell colSpan={canManageFunds ? 7 : 6} className="h-24 text-center">
                  No expense records found.
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense: any) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    {format(new Date(expense.expense_date), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{expense.projects?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {expense.expense_categories?.name} 
                      {expense.expense_subcategories?.name && ` > ${expense.expense_subcategories.name}`}
                    </div>
                  </TableCell>
                  <TableCell>
                    {expense.vendors?.name || <span className="text-muted-foreground italic">None</span>}
                  </TableCell>
                  <TableCell>
                    {expense.receipt_url ? (
                      <a href={expense.receipt_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm font-medium">
                        View
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₹{expense.amount?.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={expense.payment_status === 'paid' ? 'default' : 'destructive'}
                           className={expense.payment_status === 'paid' ? 'bg-green-600 hover:bg-green-700' : ''}>
                      {expense.payment_status}
                    </Badge>
                  </TableCell>
                  {canManageFunds && (
                    <TableCell className="text-right">
                      {expense.payment_status !== 'paid' ? (
                        <SettleExpenseDialog expense={expense} />
                      ) : (
                        <span className="inline-flex items-center text-sm text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" /> Settled
                        </span>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
