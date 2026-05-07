'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download, FileText, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportsPage() {
  const { data: report, isLoading } = useQuery({
    queryKey: ['reports', 'project-pnl'],
    queryFn: async () => {
      const res = await fetch('/api/reports/project-pnl');
      return res.json();
    },
  });

  const exportPDF = () => {
    if (!report) return;
    
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Project Profit & Loss Report', 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableData = report.projects.map((p: any) => [
      p.name,
      p.client_name || '-',
      `Rs. ${p.total_income.toLocaleString()}`,
      `Rs. ${p.total_expense.toLocaleString()}`,
      `Rs. ${p.profit.toLocaleString()}`,
      `${p.profit_margin.toFixed(2)}%`
    ]);

    tableData.push([
      'TOTAL',
      '',
      `Rs. ${report.summary.total_income.toLocaleString()}`,
      `Rs. ${report.summary.total_expense.toLocaleString()}`,
      `Rs. ${report.summary.total_profit.toLocaleString()}`,
      `${report.summary.overall_margin.toFixed(2)}%`
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Project', 'Client', 'Total Income', 'Total Expense', 'Profit', 'Margin']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
      didParseCell: function(data) {
        if (data.row.index === tableData.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [241, 245, 249];
        }
      }
    });

    doc.save('project_pnl_report.pdf');
  };

  const exportCSV = () => {
    if (!report) return;

    const headers = ['Project', 'Client', 'Total Income', 'Total Expense', 'Profit', 'Margin (%)'];
    const rows = report.projects.map((p: any) => [
      `"${p.name}"`,
      `"${p.client_name || '-'}"`,
      p.total_income,
      p.total_expense,
      p.profit,
      p.profit_margin.toFixed(2)
    ]);

    rows.push([
      '"TOTAL"',
      '""',
      report.summary.total_income,
      report.summary.total_expense,
      report.summary.total_profit,
      report.summary.overall_margin.toFixed(2)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row: any) => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'project_pnl_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">Company-wide profit and loss summary.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportCSV} disabled={isLoading || !report}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={exportPDF} disabled={isLoading || !report}>
            <FileText className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {!isLoading && report && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₹{report.summary.total_income.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ₹{report.summary.total_expense.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{report.summary.total_profit.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Margin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {report.summary.overall_margin.toFixed(2)}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Client</TableHead>
              <TableHead className="text-right">Income</TableHead>
              <TableHead className="text-right">Expenses</TableHead>
              <TableHead className="text-right">Profit</TableHead>
              <TableHead className="text-right">Margin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : !report?.projects?.length ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No project data found.
                </TableCell>
              </TableRow>
            ) : (
              report.projects.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.client_name || '-'}</TableCell>
                  <TableCell className="text-right text-green-600">₹{p.total_income.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-red-600">₹{p.total_expense.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-bold">₹{p.profit.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{p.profit_margin.toFixed(2)}%</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
