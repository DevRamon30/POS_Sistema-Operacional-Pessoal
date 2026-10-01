'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Inbox, CheckSquare, Folder, Activity, LayoutDashboard, Command } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Caixa de Entrada', href: '/inbox', icon: Inbox },
  { name: 'Tarefas', href: '/tasks', icon: CheckSquare },
  { name: 'Projetos', href: '/projects', icon: Folder },
  { name: 'Hábitos', href: '/habits', icon: Activity },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
];

export function Sidebar() {
  const pathname = usePathname();
  
  return (
    <>
    <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center border-b border-white/[0.07] bg-slate-950/90 px-4 backdrop-blur-2xl md:hidden">
      <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-200/15 bg-gradient-to-br from-cyan-400/25 to-violet-500/25">
        <Command className="h-5 w-5 text-cyan-300" />
      </div>
      <div className="ml-3">
        <h1 className="text-base font-extrabold leading-none text-white">POS</h1>
        <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">Sistema Operacional Pessoal</p>
      </div>
    </header>

    <aside className="hidden w-64 shrink-0 bg-slate-950/45 backdrop-blur-2xl text-slate-100 md:flex flex-col h-full border-r border-white/[0.07] z-20 shadow-[20px_0_60px_-40px_rgba(0,0,0,0.9)]">
      <div className="p-8 pb-7 flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400/25 via-cyan-500/15 to-violet-500/25 border border-cyan-200/15 shadow-[0_0_22px_rgba(34,211,238,0.16)]">
          <Command className="relative z-10 w-5 h-5 text-cyan-300" />
          <div className="absolute inset-0 rounded-2xl bg-cyan-400/20 blur-xl opacity-50" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-white">POS</h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mt-0.5">Sistema Base</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-5 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ease-out relative overflow-hidden",
                isActive 
                  ? "bg-gradient-to-r from-cyan-400/15 via-cyan-500/5 to-transparent text-cyan-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]" 
                  : "text-slate-400 hover:translate-x-0.5 hover:bg-white/[0.045] hover:text-white hover:shadow-[0_8px_18px_-14px_rgba(0,0,0,0.9)]"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-cyan-300 rounded-r-md shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
              )}
              <item.icon className={cn("w-5 h-5 transition-all duration-200 ease-out", 
                isActive ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" : "group-hover:scale-110 group-hover:text-cyan-400"
              )} />
              <span className={cn("font-medium tracking-wide text-sm transition-colors", isActive ? "text-white" : "")}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-6 border-t border-white/5">
        <div className="flex items-center justify-between text-xs text-slate-500 opacity-60">
          <span>v2.0.0</span>
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        </div>
      </div>
    </aside>

    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-20 w-screen max-w-[100vw] overflow-hidden border-t border-white/10 bg-slate-950/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl md:hidden">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link key={item.name} href={item.href} className={cn(
            "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-0.5 text-[9px] transition-colors min-[380px]:text-[10px]",
            isActive ? "text-cyan-300" : "text-slate-500 active:text-white"
          )}>
            {isActive && <span className="absolute top-1 h-0.5 w-8 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />}
            <item.icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_7px_rgba(34,211,238,0.7)]")} />
            <span className="max-w-full truncate">{item.name === 'Caixa de Entrada' ? 'Entrada' : item.name}</span>
          </Link>
        );
      })}
    </nav>
    </>
  );
}
