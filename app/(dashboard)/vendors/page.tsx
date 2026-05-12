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
import { Loader2, ArrowRight, User, Phone, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { financeService } from '@/lib/services/financeService';
import { Vendor } from '@/lib/types';

export default function VendorsPage() {
  const { canWrite } = useAdmin();

  const { data: vendors, isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => financeService.getVendors(),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Vendors & Labour</h1>
          <p className="text-muted-foreground">Manage suppliers and contractors.</p>
        </div>
        {canWrite && <VendorForm />}
      </div>

      {/* Mobile View: Cards */}
      <div className="grid gap-4 md:hidden">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !vendors?.length ? (
          <p className="text-center py-8 text-muted-foreground">No vendors found.</p>
        ) : (
          vendors.map((vendor: Vendor) => (
            <Card key={vendor.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="font-bold text-lg">{vendor.name}</div>
                  <Badge variant="outline" className="capitalize bg-blue-50 text-blue-700 border-blue-200">
                    {vendor.type}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    <span className="truncate">{vendor.contact_person || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{vendor.phone || 'N/A'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <Button variant="ghost" size="sm" className="w-full justify-between text-blue-600 font-semibold" asChild>
                    <Link href={`/vendors/${vendor.id}`}>
                      View Ledger <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
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
              <TableHead>Vendor Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : !vendors?.length ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No vendors found.
                </TableCell>
              </TableRow>
            ) : (
              vendors.map((vendor: Vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">
                    {vendor.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {vendor.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{vendor.contact_person || '-'}</TableCell>
                  <TableCell>{vendor.phone || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Link 
                      href={`/vendors/${vendor.id}`}
                      className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline"
                    >
                      View Ledger <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
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
