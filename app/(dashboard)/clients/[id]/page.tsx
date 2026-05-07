'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { ClientForm } from '@/components/forms/ClientForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { formatINR, formatDate } from '@/lib/utils';
import { 
  ArrowLeft, Phone, Mail, MapPin, Building2, 
  FileText, IndianRupee, Clock 
} from 'lucide-react';

interface ClientDetail {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  gstin: string | null;
  notes: string | null;
  total_income: number;
  total_pending: number;
  total_projects: number;
  active_projects: number;
  projects: Array<{
    id: string;
    name: string;
    location: string | null;
    contract_value: number;
    status: string;
    start_date: string | null;
    milestones: Array<{
      id: string;
      name: string;
      percentage: number;
      amount: number;
      status: string;
      due_date: string;
    }>;
  }>;
}

async function fetchClientDetail(id: string): Promise<ClientDetail> {
  const res = await fetch(`/api/clients/${id}`);
  if (!res.ok) throw new Error('Failed to fetch client');
  return res.json();
}

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => fetchClientDetail(clientId),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Client not found</p>
        <Button className="mt-4" onClick={() => router.push('/clients')}>
          Back to Clients
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/clients')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{client.name}</h2>
            {client.contact_person && (
              <p className="text-sm text-muted-foreground">{client.contact_person}</p>
            )}
          </div>
        </div>
        <ClientForm client={client} />
      </div>

      {/* Contact Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {client.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{client.phone}</span>
              </div>
            )}
            {client.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{client.email}</span>
              </div>
            )}
            {client.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{client.address}</span>
              </div>
            )}
            {client.gstin && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">GST: {client.gstin}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client.total_projects}</div>
            <p className="text-xs text-muted-foreground">{client.active_projects} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatINR(client.total_income)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{formatINR(client.total_pending)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Position</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${client.total_income - client.total_pending >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatINR(client.total_income - client.total_pending)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Projects</h3>
        {client.projects?.length === 0 ? (
          <Card className="p-6 text-center">
            <Building2 className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No projects yet</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {client.projects?.map((project) => {
              const received = project.milestones
                ?.filter(m => m.status === 'paid')
                .reduce((sum, m) => sum + (m.amount || 0), 0) || 0;
              const progress = project.contract_value > 0 
                ? (received / project.contract_value) * 100 
                : 0;

              return (
                <Card 
                  key={project.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{project.name}</h4>
                          <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                            {project.status}
                          </Badge>
                        </div>
                        {project.location && (
                          <p className="text-sm text-muted-foreground mt-1">{project.location}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1">
                            <IndianRupee className="h-3.5 w-3.5" />
                            {formatINR(project.contract_value)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {project.start_date ? formatDate(project.start_date) : 'No start date'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{progress.toFixed(0)}% paid</div>
                        <div className="text-xs text-muted-foreground">
                          {formatINR(received)} received
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
