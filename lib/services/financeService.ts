import { ProjectDetail, ProjectPnL, MilestoneStats, DashboardKPIs, ProjectSummary, DashboardAlert, IncomeRecord, ExpenseRecord, Vendor, Client, Milestone, ExpenseCategory, ExpenseSubcategory, ProjectInsights } from '../types';
import { intelligenceService } from './intelligenceService';

async function handleResponse(res: Response, defaultErrorMessage: string) {
  if (!res.ok) {
    let errorMessage = defaultErrorMessage;
    try {
      const errorData = await res.json();
      if (errorData.error) errorMessage = errorData.error;
    } catch (e) {}
    throw new Error(errorMessage);
  }
  return res.json();
}

interface FetchOptions {
  isAdminMode?: boolean;
}

export const financeService = {
  /**
   * Fetches project insights from the intelligence engine
   */
  async getProjectInsights(projectId: string, options?: FetchOptions): Promise<ProjectInsights> {
    const project = await this.getProjectDetail(projectId, options);
    const pnl = await this.getProjectPnL(projectId, options);
    return intelligenceService.getProjectInsights(project, pnl);
  },
  /**
   * Fetches detailed project information including milestones
   */
  async getProjectDetail(id: string, options?: FetchOptions): Promise<ProjectDetail> {
    const res = await fetch(`/api/projects/${id}`, {
      headers: options?.isAdminMode ? { 'x-admin-mode': 'true' } : {}
    });
    return handleResponse(res, 'Failed to fetch project');
  },

  /**
   * Fetches project Profit & Loss data
   */
  async getProjectPnL(id: string, options?: FetchOptions): Promise<ProjectPnL> {
    const res = await fetch(`/api/projects/${id}/pnl`, {
      headers: options?.isAdminMode ? { 'x-admin-mode': 'true' } : {}
    });
    return handleResponse(res, 'Failed to fetch P&L');
  },

  /**
   * Fetches dashboard-wide KPI summary
   */
  async getDashboardKPIs(options?: FetchOptions): Promise<DashboardKPIs> {
    const res = await fetch('/api/dashboard/summary', {
      headers: options?.isAdminMode ? { 'x-admin-mode': 'true' } : {}
    });
    return handleResponse(res, 'Failed to fetch dashboard data');
  },

  /**
   * Fetches projects with optional status filtering
   */
  async getProjects(status?: string, options?: FetchOptions): Promise<ProjectSummary[]> {
    const url = status ? `/api/projects?status=${status}` : '/api/projects';
    const res = await fetch(url, {
      headers: options?.isAdminMode ? { 'x-admin-mode': 'true' } : {}
    });
    return handleResponse(res, 'Failed to fetch projects');
  },

  /**
   * Fetches all active projects for the dashboard grid
   */
  async getActiveProjects(options?: FetchOptions): Promise<ProjectSummary[]> {
    return this.getProjects('active', options);
  },

  /**
   * Fetches system alerts and reminders
   */
  async getDashboardAlerts(): Promise<DashboardAlert[]> {
    const res = await fetch('/api/dashboard/alerts');
    return handleResponse(res, 'Failed to fetch alerts');
  },

  /**
   * Fetches all income records
   */
  async getIncomeHistory(options?: FetchOptions): Promise<IncomeRecord[]> {
    const res = await fetch('/api/income', {
      headers: options?.isAdminMode ? { 'x-admin-mode': 'true' } : {}
    });
    return handleResponse(res, 'Failed to fetch income records');
  },

  /**
   * Fetches all expense records
   */
  async getExpenses(options?: FetchOptions): Promise<ExpenseRecord[]> {
    const res = await fetch('/api/expenses', {
      headers: options?.isAdminMode ? { 'x-admin-mode': 'true' } : {}
    });
    return handleResponse(res, 'Failed to fetch expenses');
  },

  /**
   * Marks an expense as paid
   */
  async settleExpense(expenseId: string, data: { payment_mode: string; reference_number?: string; amount: number }): Promise<any> {
    const res = await fetch(`/api/expenses/${expenseId}/pay`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res, 'Failed to settle expense');
  },

  /**
   * Fetches all vendors
   */
  async getVendors(): Promise<Vendor[]> {
    const res = await fetch('/api/vendors');
    return handleResponse(res, 'Failed to fetch vendors');
  },

  /**
   * Fetches all clients with optional search
   */
  async getClients(search?: string): Promise<Client[]> {
    const url = search ? `/api/clients?search=${encodeURIComponent(search)}` : '/api/clients';
    const res = await fetch(url);
    return handleResponse(res, 'Failed to fetch clients');
  },

  /**
   * Fetches milestones for a project
   */
  async getMilestones(projectId: string): Promise<Milestone[]> {
    const res = await fetch(`/api/milestones?project_id=${projectId}`);
    return handleResponse(res, 'Failed to fetch milestones');
  },

  /**
   * Updates/Creates project milestones
   */
  async updateMilestones(projectId: string, milestones: any[], contractValue: number): Promise<any> {
    const res = await fetch(`/api/projects/${projectId}/milestones`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ milestones, contractValue }),
    });
    return handleResponse(res, 'Failed to update schedule');
  },

  /**
   * Updates a single milestone record
   */
  async updateMilestone(milestoneId: string, data: any): Promise<any> {
    const res = await fetch(`/api/milestones/${milestoneId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res, 'Failed to update milestone');
  },

  /**
   * Fetches expense categories
   */
  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    const res = await fetch('/api/expenses/categories');
    return handleResponse(res, 'Failed to fetch categories');
  },

  /**
   * Fetches expense subcategories for a category
   */
  async getExpenseSubcategories(categoryId: string): Promise<ExpenseSubcategory[]> {
    const res = await fetch(`/api/expenses/subcategories?category_id=${categoryId}`);
    return handleResponse(res, 'Failed to fetch subcategories');
  },

  /**
   * Records a new income entry
   */
  async createIncome(data: any): Promise<any> {
    const res = await fetch('/api/income', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res, 'Failed to record income');
  },

  /**
   * Records a new expense entry
   */
  async createExpense(data: any): Promise<any> {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res, 'Failed to record expense');
  },

  /**
   * Creates a new project
   */
  async createProject(data: any): Promise<any> {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res, 'Failed to create project');
  },

  /**
   * Updates an existing project
   */
  async updateProject(projectId: string, data: any): Promise<any> {
    const res = await fetch(`/api/projects/${projectId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res, 'Failed to update project');
  },

  /**
   * Creates a new client
   */
  async createClient(data: any): Promise<any> {
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res, 'Failed to create client');
  },

  /**
   * Updates an existing client
   */
  async updateClient(clientId: string, data: any): Promise<any> {
    const res = await fetch(`/api/clients/${clientId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res, 'Failed to update client');
  },

  /**
   * Creates a new vendor
   */
  async createVendor(data: any): Promise<any> {
    const res = await fetch('/api/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res, 'Failed to create vendor');
  },

  /**
   * Updates an existing income entry with correction tracking
   */
  async correctIncome(incomeId: string, data: any, reason: string): Promise<any> {
    const res = await fetch(`/api/income/${incomeId}/correct`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, correction_reason: reason }),
    });
    return handleResponse(res, 'Failed to correct income entry');
  },

  /**
   * Updates an existing expense entry with correction tracking
   */
  async correctExpense(expenseId: string, data: any, reason: string): Promise<any> {
    const res = await fetch(`/api/expenses/${expenseId}/correct`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, correction_reason: reason }),
    });
    return handleResponse(res, 'Failed to correct expense entry');
  },

  /**
   * Fetches financial gaps for project settlement
   */
  async getSettlementGaps(projectId: string): Promise<any> {
    const res = await fetch(`/api/projects/${projectId}/settlement-gaps`);
    return handleResponse(res, 'Failed to fetch settlement gaps');
  },

  /**
   * Finalizes project settlement with batch resolutions
   */
  async finalizeSettlement(projectId: string, data: any): Promise<any> {
    const res = await fetch(`/api/projects/${projectId}/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res, 'Failed to finalize settlement');
  },

  /**
   * Updates an existing vendor
   */
  async updateVendor(vendorId: string, data: any): Promise<any> {
    const res = await fetch(`/api/vendors/${vendorId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res, 'Failed to update vendor');
  },

  /**
   * Calculates enriched statistics for milestones by combining project and P&L data
   */
  calculateMilestoneStats(project: ProjectDetail, pnl: ProjectPnL): MilestoneStats[] {
    // Inject mock data if no milestones exist (for preview purposes)
    const milestones = (project?.milestones && project.milestones.length > 0) 
      ? project.milestones 
      : [
          { id: 'm1', name: 'Initial Advance', amount: project.contract_value * 0.1, percentage: 10, status: 'paid', due_date: new Date().toISOString() },
          { id: 'm2', name: 'Foundation Completion', amount: project.contract_value * 0.2, percentage: 20, status: 'due', due_date: new Date(Date.now() + 86400000 * 7).toISOString() },
          { id: 'm3', name: 'Structure Work', amount: project.contract_value * 0.4, percentage: 40, status: 'pending', due_date: new Date(Date.now() + 86400000 * 30).toISOString() },
          { id: 'm4', name: 'Finishing', amount: project.contract_value * 0.3, percentage: 30, status: 'pending', due_date: new Date(Date.now() + 86400000 * 60).toISOString() },
        ] as Milestone[];

    return milestones.map(milestone => {
      const received = pnl?.income
        ?.filter(inc => inc.milestone_id === milestone.id)
        ?.reduce((sum, inc) => sum + inc.amount, 0) || 0;
        
      const expended = pnl?.expenses
        ?.filter(exp => exp.milestone_id === milestone.id)
        ?.reduce((sum, exp) => sum + exp.amount, 0) || 0;

      const pending = Math.max(0, milestone.amount - received);
      const progress = (received / milestone.amount) * 100;
      const netPosition = received - expended;
      
      return { 
        ...milestone, 
        received, 
        expended, 
        pending, 
        progress, 
        netPosition 
      };
    });
  }
};
