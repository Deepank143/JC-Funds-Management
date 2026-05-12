import { ProjectDetail, ProjectPnL, MilestoneStats, DashboardKPIs, ProjectSummary, DashboardAlert, IncomeRecord, ExpenseRecord, Vendor, Client, Milestone, ExpenseCategory, ExpenseSubcategory, ProjectInsights } from '../types';
import { intelligenceService } from './intelligenceService';

export const financeService = {
  /**
   * Fetches project insights from the intelligence engine
   */
  async getProjectInsights(projectId: string): Promise<ProjectInsights> {
    const project = await this.getProjectDetail(projectId);
    const pnl = await this.getProjectPnL(projectId);
    return intelligenceService.getProjectInsights(project, pnl);
  },
  /**
   * Fetches detailed project information including milestones
   */
  async getProjectDetail(id: string): Promise<ProjectDetail> {
    const res = await fetch(`/api/projects/${id}`);
    if (!res.ok) throw new Error('Failed to fetch project');
    return res.json();
  },

  /**
   * Fetches project Profit & Loss data
   */
  async getProjectPnL(id: string): Promise<ProjectPnL> {
    const res = await fetch(`/api/projects/${id}/pnl`);
    if (!res.ok) throw new Error('Failed to fetch P&L');
    return res.json();
  },

  /**
   * Fetches dashboard-wide KPI summary
   */
  async getDashboardKPIs(): Promise<DashboardKPIs> {
    const res = await fetch('/api/dashboard/summary');
    if (!res.ok) throw new Error('Failed to fetch dashboard data');
    return res.json();
  },

  /**
   * Fetches projects with optional status filtering
   */
  async getProjects(status?: string): Promise<ProjectSummary[]> {
    const url = status ? `/api/projects?status=${status}` : '/api/projects';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  /**
   * Fetches all active projects for the dashboard grid
   */
  async getActiveProjects(): Promise<ProjectSummary[]> {
    return this.getProjects('active');
  },

  /**
   * Fetches system alerts and reminders
   */
  async getDashboardAlerts(): Promise<DashboardAlert[]> {
    const res = await fetch('/api/dashboard/alerts');
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  /**
   * Fetches all income records
   */
  async getIncomeHistory(): Promise<IncomeRecord[]> {
    const res = await fetch('/api/income');
    if (!res.ok) throw new Error('Failed to fetch income records');
    return res.json();
  },

  /**
   * Fetches all expense records
   */
  async getExpenses(): Promise<ExpenseRecord[]> {
    const res = await fetch('/api/expenses');
    if (!res.ok) throw new Error('Failed to fetch expenses');
    return res.json();
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
    if (!res.ok) throw new Error('Failed to settle expense');
    return res.json();
  },

  /**
   * Fetches all vendors
   */
  async getVendors(): Promise<Vendor[]> {
    const res = await fetch('/api/vendors');
    if (!res.ok) throw new Error('Failed to fetch vendors');
    return res.json();
  },

  /**
   * Fetches all clients with optional search
   */
  async getClients(search?: string): Promise<Client[]> {
    const url = search ? `/api/clients?search=${encodeURIComponent(search)}` : '/api/clients';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch clients');
    return res.json();
  },

  /**
   * Fetches milestones for a project
   */
  async getMilestones(projectId: string): Promise<Milestone[]> {
    const res = await fetch(`/api/milestones?project_id=${projectId}`);
    if (!res.ok) throw new Error('Failed to fetch milestones');
    return res.json();
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
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to update schedule');
    }
    return res.json();
  },

  /**
   * Fetches expense categories
   */
  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    const res = await fetch('/api/expenses/categories');
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  /**
   * Fetches expense subcategories for a category
   */
  async getExpenseSubcategories(categoryId: string): Promise<ExpenseSubcategory[]> {
    const res = await fetch(`/api/expenses/subcategories?category_id=${categoryId}`);
    if (!res.ok) throw new Error('Failed to fetch subcategories');
    return res.json();
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
    if (!res.ok) throw new Error('Failed to record income');
    return res.json();
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
    if (!res.ok) throw new Error('Failed to record expense');
    return res.json();
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
    if (!res.ok) throw new Error('Failed to create project');
    return res.json();
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
    if (!res.ok) throw new Error('Failed to update project');
    return res.json();
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
    if (!res.ok) throw new Error('Failed to create client');
    return res.json();
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
    if (!res.ok) throw new Error('Failed to update client');
    return res.json();
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
    if (!res.ok) throw new Error('Failed to create vendor');
    return res.json();
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
    if (!res.ok) throw new Error('Failed to correct income entry');
    return res.json();
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
    if (!res.ok) throw new Error('Failed to correct expense entry');
    return res.json();
  },

  /**
   * Fetches financial gaps for project settlement
   */
  async getSettlementGaps(projectId: string): Promise<any> {
    const res = await fetch(`/api/projects/${projectId}/settlement-gaps`);
    if (!res.ok) throw new Error('Failed to fetch settlement gaps');
    return res.json();
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
    if (!res.ok) throw new Error('Failed to finalize settlement');
    return res.json();
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
    if (!res.ok) throw new Error('Failed to update vendor');
    return res.json();
  },

  /**
   * Calculates enriched statistics for milestones by combining project and P&L data
   */
  calculateMilestoneStats(project: ProjectDetail, pnl: ProjectPnL): MilestoneStats[] {
    if (!project?.milestones) return [];
    
    return project.milestones.map(milestone => {
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
