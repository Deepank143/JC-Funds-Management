import { KpiCards } from '@/components/dashboard/KpiCards';
import { ProjectGrid } from '@/components/dashboard/ProjectGrid';
import { ExpenseForm } from '@/components/forms/ExpenseForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, Users, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Jaani Constructions
              </h1>
              <p className="text-sm text-muted-foreground">
                Funds Management System
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ExpenseForm />
              <Button variant="outline" asChild>
                <Link href="/income">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Income
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* KPI Cards */}
        <KpiCards />

        {/* Navigation Tabs */}
        <Tabs defaultValue="projects" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
            <TabsTrigger value="projects">
              <Building2 className="mr-2 h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="clients">
              <Users className="mr-2 h-4 w-4" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="expenses">
              <FileText className="mr-2 h-4 w-4" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileText className="mr-2 h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Active Projects</h2>
              <Button variant="outline" size="sm" asChild>
                <Link href="/projects">View All</Link>
              </Button>
            </div>
            <ProjectGrid />
          </TabsContent>

          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle>Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Client management coming soon. Use the sidebar navigation for now.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses">
            <Card>
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Expense details coming soon. Use the Add Expense button to record transactions.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Reports and exports coming soon.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
