'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCcw, Home, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-red-100 shadow-2xl shadow-red-500/10 animate-in fade-in zoom-in duration-300">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          {/* Icon with animated glow */}
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-red-50 flex items-center justify-center w-20 h-20 rounded-full border-2 border-red-100">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Something went wrong</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We encountered an unexpected error while loading the dashboard. 
              Our team has been notified.
            </p>
          </div>

          {/* Error Details (Collapsible in real apps, but here we show a hint) */}
          <div className="bg-muted/50 rounded-lg p-3 text-xs font-mono text-muted-foreground break-all">
            Error ID: {error.digest || 'unknown_err_ref'}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button 
              variant="default" 
              className="w-full bg-red-600 hover:bg-red-700 transition-all active:scale-95"
              onClick={() => reset()}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button 
              variant="outline" 
              className="w-full transition-all active:scale-95"
              onClick={() => router.push('/')}
            >
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </div>

          <div className="pt-4 flex justify-center">
            <button className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
              <MessageSquare className="h-3 w-3" />
              Contact technical support
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
