import { MilestoneSuggestion, UrgencyAlert, ProjectInsights, ProjectDetail, ProjectPnL } from '../types';
import { daysBetween } from '../utils';

export const intelligenceService = {
  /**
   * Generates suggested milestones for a new project based on industry standards
   */
  getSuggestedMilestones(): MilestoneSuggestion[] {
    return [
      { name: 'Initial Advance', percentage: 10, description: 'Booking amount to start project mobilization' },
      { name: 'Foundation Completion', percentage: 20, description: 'After excavation and foundation work is completed' },
      { name: 'Plinth Level', percentage: 15, description: 'Reaching the plinth level' },
      { name: 'First Slab Cast', percentage: 15, description: 'Completion of first floor structure' },
      { name: 'Brickwork & Plaster', percentage: 20, description: 'Internal walls and basic plastering' },
      { name: 'Finishing & Handover', percentage: 20, description: 'Final painting, fixtures, and site clearance' }
    ];
  },

  /**
   * Analyzes project milestones to identify urgent items
   */
  getUrgencyAlerts(projects: ProjectDetail[]): UrgencyAlert[] {
    const alerts: UrgencyAlert[] = [];
    const now = new Date();

    projects.forEach(project => {
      if (project.status !== 'active') return;

      project.milestones.forEach(milestone => {
        if (milestone.status === 'paid') return;

        if (!milestone.due_date) return;
        const dueDate = new Date(milestone.due_date);
        const daysRemaining = daysBetween(now, dueDate);

        // Deadline alerts
        if (daysRemaining <= 7) {
          alerts.push({
            projectId: project.id,
            projectName: project.name,
            milestoneId: milestone.id,
            milestoneName: milestone.name,
            dueDate: milestone.due_date,
            daysRemaining,
            priority: daysRemaining < 0 ? 'high' : daysRemaining <= 2 ? 'high' : 'medium',
            type: 'deadline'
          });
        }

        // Stagnation (billed but not paid for a while)
        // This would need a 'last_updated' or 'billed_date' in reality
      });
    });

    return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
  },

  /**
   * Provides planning insights for a specific project
   */
  getProjectInsights(project: ProjectDetail, pnl: ProjectPnL): ProjectInsights {
    const alerts = this.getUrgencyAlerts([project]);
    const totalExpenses = pnl.summary.total_expenses;
    const totalIncome = pnl.summary.total_income;
    const burnRateWarning = totalExpenses > totalIncome * 0.9;

    const tips: string[] = [];
    if (burnRateWarning) {
      tips.push('Expenses are approaching 90% of received income. Review material procurement costs.');
    }
    
    const pendingMilestones = project.milestones.filter(m => m.status !== 'paid');
    if (pendingMilestones.length > 0) {
      tips.push(`Focus on completing "${pendingMilestones[0].name}" to unlock the next payment.`);
    }

    if (pnl.summary.total_payable > 50000) {
      tips.push('High vendor payables. Consider prioritizing payments to key material suppliers.');
    }

    return {
      suggestedMilestones: this.getSuggestedMilestones(),
      upcomingDeadlines: alerts,
      planningTips: tips
    };
  }
};
