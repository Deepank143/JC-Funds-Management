'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, AlertTriangle, ListChecks, ArrowRight } from 'lucide-react';
import { ProjectInsights, MilestoneSuggestion } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface MilestoneInsightCardProps {
  insights: ProjectInsights;
  onApplySuggestion?: (suggestion: MilestoneSuggestion) => void;
}

export function MilestoneInsightCard({ insights, onApplySuggestion }: MilestoneInsightCardProps) {
  return (
    <div className="space-y-4">
      {/* Planning Tips */}
      <Card className="border-blue-100 bg-blue-50/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-blue-800">
            <Lightbulb className="h-4 w-4" />
            Intelligence Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {insights.planningTips.map((tip, i) => (
              <li key={i} className="text-xs text-blue-700 flex items-start gap-2">
                <span className="mt-1 h-1 w-1 rounded-full bg-blue-400 shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Urgency Alerts */}
      {insights.upcomingDeadlines.length > 0 && (
        <Card className="border-amber-100 bg-amber-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              Critical Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.upcomingDeadlines.map((alert, i) => (
              <div key={i} className="flex items-center justify-between gap-4 p-2 rounded-lg bg-white/50 border border-amber-100">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-amber-900 truncate">{alert.milestoneName}</p>
                  <p className="text-[10px] text-amber-700">
                    {alert.daysRemaining < 0 
                      ? `Overdue by ${Math.abs(alert.daysRemaining)} days` 
                      : `Due in ${alert.daysRemaining} days`}
                  </p>
                </div>
                <Badge variant={alert.priority === 'high' ? 'destructive' : 'outline'} className="text-[10px] h-5">
                  {alert.priority.toUpperCase()}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Suggested Milestones */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-emerald-600" />
            Suggested Planning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-[11px] text-muted-foreground">
            Standard payment structure for construction projects:
          </p>
          <div className="space-y-2">
            {insights.suggestedMilestones.slice(0, 4).map((suggestion, i) => (
              <div key={i} className="flex items-center justify-between gap-3 group">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {suggestion.percentage}%
                    </span>
                    <p className="text-xs font-medium truncate">{suggestion.name}</p>
                  </div>
                </div>
                {onApplySuggestion && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onApplySuggestion(suggestion)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full text-[11px] h-8 mt-2">
            View All Suggestions
            <ArrowRight className="ml-2 h-3 w-3" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
