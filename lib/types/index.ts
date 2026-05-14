
export interface ProjectDetail {
  id: string;
  name: string;
  location: string | null;
  description: string | null;
  contract_value: number;
  status: string;
  start_date: string | null;
  expected_end_date: string | null;
  clients: { id: string; name: string; phone: string; email: string } | null;
  milestones: Array<Milestone>;
}

export interface Milestone {
  id: string;
  project_id: string;
  name: string;
  percentage?: number;
  amount: number;
  status: 'pending' | 'billed' | 'paid' | string;
  due_date?: string;
  sort_order?: number;
}

export interface ProjectPnL {
  summary: {
    total_income: number;
    total_expenses: number;
    total_paid: number;
    total_payable: number;
    profit: number;
    profit_margin: number;
    realized_profit: number;
  };
  income: Array<IncomeItem>;
  expenses: Array<ExpenseItem>;
  category_breakdown: Record<string, {
    total: number;
    paid: number;
    unpaid: number;
    items: Array<any>;
  }>;
}

export interface IncomeItem {
  amount: number;
  payment_date: string;
  payment_mode: string;
  reference_number: string;
  milestone_id: string | null;
  milestones: { name: string; percentage: number } | null;
}

export interface ExpenseItem {
  amount: number;
  amount_paid: number;
  milestone_id: string | null;
  expense_categories: { name: string };
}

export interface MilestoneStats extends Milestone {
  received: number;
  expended: number;
  pending: number;
  progress: number;
  netPosition: number;
}

export interface DashboardKPIs {
  totalReceivables: number;
  totalPayables: number;
  netPosition: number;
  totalPaid: number;
  totalProjects: number;
  activeProjects: number;
  overdueIncomeCount: number;
  overdueExpenseCount: number;
}

export interface ProjectSummary {
  id: string;
  client_id: string;
  name: string;
  client_name: string | null;
  location: string | null;
  status: string;
  contract_value: number;
  total_income: number;
  total_expenses: number;
  profit: number;
  profit_margin: number;
  start_date: string | null;
  expected_end_date: string | null;
}

export interface DashboardAlert {
  id: string;
  type: 'overdue_income' | 'overdue_expense' | 'budget_warning' | 'milestone_due';
  title: string;
  description: string;
  amount?: number;
  date: string;
  project_name?: string;
  severity: 'high' | 'medium' | 'low';
}

export interface IncomeRecord {
  id: string;
  amount: number;
  payment_date: string;
  payment_mode: string;
  reference_number?: string;
  notes?: string;
  projects?: { name: string };
  clients?: { name: string };
  milestones?: { name: string; percentage?: number; status?: string; due_date?: string };
}

export interface ExpenseRecord {
  id: string;
  amount: number;
  expense_date: string;
  payment_status: 'paid' | 'unpaid' | 'partial';
  bill_photo_url?: string;
  projects?: { name: string };
  vendors?: { name: string };
  expense_categories?: { name: string };
  expense_subcategories?: { name: string };
}

export interface Vendor {
  id: string;
  name: string;
  type: 'material' | 'labour' | 'vendor' | 'other';
  phone?: string;
  email?: string;
  address?: string;
}

export interface Client {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  total_projects: number;
  active_projects: number;
  total_contract_value: number;
}



export interface ExpenseCategory {
  id: string;
  name: string;
}

export interface ExpenseSubcategory {
  id: string;
  category_id: string;
  name: string;
}

export interface MilestoneSuggestion {
  name: string;
  percentage: number;
  description: string;
}

export interface UrgencyAlert {
  projectId: string;
  projectName: string;
  milestoneId: string;
  milestoneName: string;
  dueDate: string;
  daysRemaining: number;
  priority: 'high' | 'medium' | 'low';
  type: 'deadline' | 'payment' | 'stagnation';
}

export interface ProjectInsights {
  suggestedMilestones: MilestoneSuggestion[];
  upcomingDeadlines: UrgencyAlert[];
  planningTips: string[];
}
