import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { ProjectDetail, ProjectPnL, DashboardKPIs } from '../types';
import { AuditService } from './auditService';

/**
 * Server-side service for Project and Financial calculations
 */
export class ProjectService {
  private adminMode: boolean = false;
  private auditService: AuditService;

  constructor(
    private supabase: SupabaseClient<Database, 'public'>,
    options?: { adminMode?: boolean }
  ) {
    this.adminMode = options?.adminMode ?? false;
    this.auditService = new AuditService(supabase);
  }

  /**
   * Fetches dashboard KPIs using the centralized database RPC
   */
  async getDashboardSummary(isAuthorized: boolean): Promise<DashboardKPIs> {
    const { data, error } = await this.supabase.rpc('get_dashboard_kpis');
    if (error) throw error;

    const summary = (data as any)?.[0] || {};

    // Mask sensitive data if not authorized or if Admin Mode is OFF
    const shouldShowSensitive = isAuthorized && this.adminMode;

    return {
      totalReceivables: shouldShowSensitive ? (summary.total_receivables || 0) : 0,
      totalPayables: shouldShowSensitive ? (summary.total_payables || 0) : 0,
      netPosition: shouldShowSensitive ? (summary.net_position || 0) : 0,
      totalPaid: shouldShowSensitive ? (summary.total_income || 0) : 0,
      totalProjects: summary.total_projects || 0,
      activeProjects: summary.active_projects || 0,
      overdueIncomeCount: shouldShowSensitive ? (summary.overdue_income_count || 0) : 0,
      overdueExpenseCount: shouldShowSensitive ? (summary.overdue_expense_count || 0) : 0,
    };
  }

  /**
   * Fetches detailed project information
   */
  async getProjectDetail(id: string): Promise<ProjectDetail | null> {
    const { data, error } = await this.supabase
      .from('projects')
      .select(`
        *,
        clients (*),
        milestones (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    // Type casting for relationship data
    const project = data as unknown as ProjectDetail;
    
    // Sort milestones by sort_order
    if (project.milestones) {
      project.milestones.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    }

    return project;
  }

  /**
   * Fetches project P&L using database RPC and extra history
   */
  async getProjectPnL(id: string): Promise<ProjectPnL> {
    // 1. Get summary from RPC
    const { data: summaryData, error: summaryError } = await this.supabase.rpc('get_project_summary', { 
      project_uuid: id 
    });
    if (summaryError) throw summaryError;

    // 2. Get history (Income & Expenses)
    const [incomeRes, expenseRes] = await Promise.all([
      this.supabase.from('income').select('*, milestones(name, percentage)').eq('project_id', id).order('payment_date', { ascending: false }),
      this.supabase.from('expenses').select('*, expense_categories(name)').eq('project_id', id).order('expense_date', { ascending: false })
    ]);

    if (incomeRes.error) throw incomeRes.error;
    if (expenseRes.error) throw expenseRes.error;

    // 3. Process category breakdown
    const categoryBreakdown: Record<string, { total: number; paid: number; unpaid: number; items: any[] }> = {};
    (expenseRes.data || []).forEach((exp) => {
      const catName = exp.expense_categories?.name || 'Uncategorized';
      if (!categoryBreakdown[catName]) {
        categoryBreakdown[catName] = { total: 0, paid: 0, unpaid: 0, items: [] };
      }
      categoryBreakdown[catName].total += exp.amount;
      if (exp.payment_status === 'paid') {
        categoryBreakdown[catName].paid += exp.amount;
      } else {
        categoryBreakdown[catName].unpaid += (exp.amount - (exp.amount_paid || 0));
      }
      categoryBreakdown[catName].items.push(exp);
    });

    const summary = (summaryData as any)?.[0] || {};

    // Mask sensitive data if Admin Mode is OFF
    const shouldShowSensitive = this.adminMode;

    return {
      summary: {
        total_income: shouldShowSensitive ? (summary.total_income || 0) : 0,
        total_expenses: shouldShowSensitive ? (summary.total_expenses || 0) : 0,
        total_paid: shouldShowSensitive ? (summary.total_income || 0) : 0,
        total_payable: shouldShowSensitive ? (summary.total_payable || 0) : 0,
        profit: shouldShowSensitive ? (summary.profit || 0) : 0,
        profit_margin: shouldShowSensitive ? (summary.profit_margin || 0) : 0,
        realized_profit: shouldShowSensitive ? ((summary.total_income || 0) - ((summary.total_expenses || 0) - (summary.total_payable || 0))) : 0
      },
      income: incomeRes.data as any[],
      expenses: expenseRes.data as any[],
      category_breakdown: categoryBreakdown
    };
  }
  /**
   * Lists projects with optional filtering and margin data
   */
  async listProjects(filters: { status?: string; clientId?: string }): Promise<any[]> {
    const { data: projectsWithMargins, error: rpcError } = await this.supabase.rpc('get_projects_with_margins');
    
    let result: any[];
    if (rpcError) {
      console.warn('RPC margin fetch failed, falling back to basic query:', rpcError);
      let query = this.supabase
        .from('projects')
        .select(`
          *,
          clients(name),
          milestones(id, name, status, amount)
        `)
        .order('created_at', { ascending: false });

      if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
      if (filters.clientId) query = query.eq('client_id', filters.clientId);

      const { data, error } = await query;
      if (error) throw error;
      result = data || [];
    } else {
      result = (projectsWithMargins as any[]) || [];
      if (filters.status && filters.status !== 'all') {
        result = result.filter((p) => p.status === filters.status);
      }
      if (filters.clientId) {
        result = result.filter((p) => p.client_id === filters.clientId);
      }
    }

    // Mask sensitive data in list results
    if (!this.adminMode) {
      result = result.map((p) => ({
        ...p,
        contract_value: 0,
        total_income: 0,
        total_expenses: 0,
        profit: 0,
        profit_margin: 0
      }));
    }

    return result;
  }

  /**
   * Creates a new project with default milestones
   */
  async createProject(body: any, userId: string): Promise<any> {
    const { data: project, error: projectError } = await this.supabase.from('projects')
      .insert({
        client_id: body.client_id,
        name: body.name,
        location: body.location,
        description: body.description,
        contract_value: body.contract_value,
        start_date: body.start_date,
        expected_end_date: body.expected_end_date,
        status: 'active',
        created_by: userId,
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // Create default milestones if provided
    if (body.milestones && body.milestones.length > 0) {
      const milestones = body.milestones.map((m: any, index: number) => ({
        project_id: project.id,
        name: m.name,
        percentage: m.percentage,
        amount: Math.round(((body.contract_value * m.percentage) / 100) * 100) / 100,
        due_date: m.due_date,
        sort_order: index,
      }));

      const { error: milestoneError } = await this.supabase.from('milestones')
        .insert(milestones);

      if (milestoneError) throw milestoneError;
    }

    // Log the creation
    await this.auditService.logAction({
      table_name: 'projects',
      record_id: project.id,
      action: 'CREATE',
      new_data: { name: project.name, contract_value: project.contract_value },
      reason: 'Project initialized',
      performed_by: userId,
    }).catch(err => console.warn('Failed to log project creation audit:', err));

    return project;
  }
}
