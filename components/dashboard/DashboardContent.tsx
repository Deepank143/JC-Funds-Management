'use client';

import { KpiCards } from '@/components/dashboard/KpiCards';
import { ProjectGrid } from '@/components/dashboard/ProjectGrid';
import { AlertFeed } from '@/components/dashboard/AlertFeed';
import { ExpenseForm } from '@/components/forms/ExpenseForm';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, Users, Building2, Receipt, IndianRupee } from 'lucide-react';
import Link from 'next/link';
import { useAdmin } from '@/contexts/AdminContext';

export function DashboardContent() {
  const { canWrite } = useAdmin();

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Overview of your projects, finances, and alerts
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canWrite && (
            <>
              <ExpenseForm />
              <Button variant="outline" size="sm" asChild>
                <Link href="/income">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Income
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <KpiCards />

      {/* Main Grid: Projects + Alerts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Projects Section - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <Tabs defaultValue="projects" className="space-y-4">
            <TabsList>
              <TabsTrigger value="projects">
                <Building2 className="mr-2 h-4 w-4" />
                Projects
              </TabsTrigger>
              <TabsTrigger value="clients">
                <Users className="mr-2 h-4 w-4" />
                Clients
              </TabsTrigger>
              <TabsTrigger value="expenses">
                <Receipt className="mr-2 h-4 w-4" />
                Expenses
              </TabsTrigger>
              <TabsTrigger value="income">
                <IndianRupee className="mr-2 h-4 w-4" />
                Income
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Active Projects</h3>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/projects">View All →</Link>
                </Button>
              </div>
              <ProjectGrid />
            </TabsContent>

            <TabsContent value="clients">
              <div className="rounded-lg border bg-card p-8 text-center">
                <Users className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                <h3 className="text-lg font-semibold">Clients</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  Manage your clients and view their project history. Navigate to the Clients page for full management.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/clients">Go to Clients</Link>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="expenses">
              <div className="rounded-lg border bg-card p-8 text-center">
                <Receipt className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                <h3 className="text-lg font-semibold">Expenses</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  Track all project expenses across Vendors, Raw Material, and Labour categories.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/expenses">View Expenses</Link>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="income">
              <div className="rounded-lg border bg-card p-8 text-center">
                <IndianRupee className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                <h3 className="text-lg font-semibold">Income</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  Record and track client payments linked to project milestones.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/income">View Income</Link>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Alerts Section - Takes 1 column */}
        <div className="space-y-4">
          <AlertFeed />

          {/* Quick Actions Card */}
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
            <div className="grid gap-2">
              {canWrite && (
                <>
                  <Button variant="outline" size="sm" className="justify-start" asChild>
                    <Link href="/projects/new">
                      <Plus className="mr-2 h-4 w-4" />
                      New Project
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start" asChild>
                    <Link href="/clients/new">
                      <Users className="mr-2 h-4 w-4" />
                      New Client
                    </Link>
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" className="justify-start" asChild>
                <Link href="/reports">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
