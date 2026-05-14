'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Critical global error caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex h-screen flex-col items-center justify-center p-4 text-center bg-background">
          <div className="rounded-full bg-red-100 p-4 text-red-600 mb-4 animate-pulse">
            <AlertTriangle className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-3">Critical Application Error</h2>
          <p className="text-muted-foreground mb-6 max-w-md text-lg">
            We encountered a critical error that prevents the application from rendering. Please check your network connection or try refreshing the page.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => reset()} variant="default" size="lg">
              Try again
            </Button>
            <Button onClick={() => window.location.href = '/'} variant="outline" size="lg">
              Return Home
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
