'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatINR, getProfitColor } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  location: string | null;
  contract_value: number;
  status: string;
  clients: { name: string } | null;
  milestones: Array<{ id: string; status: string; amount: number }>;
}

async function fetchProjects(): Promise<Project[]> {
  const res = await fetch('/api/projects?status=active');
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
}

export function ProjectGrid() {
  const router = useRouter();
  const { data: projects, isLoading } = useQuery({
    queryKey: ['active-projects'],
    queryFn: fetchProjects,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-[150px]" />
              <Skeleton className="h-4 w-[100px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-[80%]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!projects || !Array.isArray(projects) || projects.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No active projects found or failed to load</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first project to get started
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => {
        // Calculate received amount from milestones
        const receivedAmount = project.milestones
          ?.filter(m => m.status === 'paid')
          .reduce((sum, m) => sum + (m.amount || 0), 0) || 0;

        const progress = project.contract_value > 0 
          ? (receivedAmount / project.contract_value) * 100 
          : 0;

        return (
          <Card 
            key={project.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(`/projects/${project.id}`)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {project.clients?.name}
                  </p>
                </div>
                <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contract Value */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Contract Value</span>
                <span className="font-semibold">{formatINR(project.contract_value)}</span>
              </div>

              {/* Received vs Pending */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Received</span>
                  <span className="font-medium text-emerald-600">
                    {formatINR(receivedAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-medium text-amber-600">
                    {formatINR(project.contract_value - receivedAmount)}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Location */}
              {project.location && (
                <p className="text-xs text-muted-foreground">
                  📍 {project.location}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
