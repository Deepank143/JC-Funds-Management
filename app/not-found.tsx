import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Large stylized 404 */}
        <div className="relative">
          <h1 className="text-[180px] font-black text-slate-200 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-md px-6 py-2 rounded-full border border-slate-200 shadow-xl">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Page Not Found
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 max-w-md mx-auto">
          <p className="text-slate-600 text-lg">
            The page you&apos;re looking for doesn&apos;t exist or has been moved to a new construction site.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button asChild size="lg" className="min-w-[160px] shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Back Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="min-w-[160px] transition-all hover:bg-slate-100 active:scale-95">
            <Link href="/projects">
              <Search className="mr-2 h-5 w-5" />
              Find Project
            </Link>
          </Button>
        </div>

        {/* Subtle background element */}
        <div className="pt-12 text-slate-400">
          <p className="text-sm">Apex Buildcon • Funds Management System</p>
        </div>
      </div>
    </div>
  );
}
