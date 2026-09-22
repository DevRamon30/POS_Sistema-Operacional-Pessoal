'use client';

import { Sidebar } from './Sidebar';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { useState, useEffect } from 'react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="flex h-screen bg-background overflow-hidden"></div>;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground relative selection:bg-primary/30">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />
      
      <div className="z-10 flex h-full w-full">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-transparent border-l border-white/5 shadow-2xl">
          <div className="max-w-6xl mx-auto h-full animate-in fade-in slide-in-from-bottom-8 duration-700">
            {children}
          </div>
        </main>
      </div>
      <PomodoroTimer />
    </div>
  );
}
