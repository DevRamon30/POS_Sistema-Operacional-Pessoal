'use client';

import { Sidebar } from './Sidebar';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="flex h-screen bg-background overflow-hidden"></div>;
  }

  if (pathname === '/') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-[100dvh] bg-background overflow-hidden font-sans text-foreground relative selection:bg-primary/30">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />
      
      <div className="z-10 flex h-full w-full min-w-0 max-w-full">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-transparent md:border-l border-white/5 shadow-2xl pt-16 pb-20 md:py-0">
          <div className="w-full min-w-0 max-w-6xl mx-auto min-h-full animate-in fade-in slide-in-from-bottom-8 duration-700">
            {children}
          </div>
        </main>
      </div>
      <PomodoroTimer />
    </div>
  );
}
