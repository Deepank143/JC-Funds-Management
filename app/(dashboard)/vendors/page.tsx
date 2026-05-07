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
import { Loader2, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function VendorsPage() {
  const { canWrite } = useAdmin();

  const { data: vendors, isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const res = await fetch('/api/vendors');
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendors & Labour</h1>
          <p className="text-muted-foreground">Manage suppliers and contractors.</p>
        </div>
        {canWrite && <VendorForm />}
      </div>

      <div className="rounded-md border bg-card">
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
              vendors.map((vendor: any) => (
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
