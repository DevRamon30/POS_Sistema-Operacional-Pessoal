import Link from 'next/link';
import { ArrowRight, Command, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/[0.07] blur-[120px]" />
      <div className="pointer-events-none absolute left-[18%] top-[24%] h-32 w-32 rounded-full bg-violet-500/[0.11] blur-3xl" />

      <section className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center animate-in fade-in zoom-in-95 duration-700">
        <div className="relative mb-10 flex h-36 w-36 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-cyan-300/20 animate-[welcome-orbit_10s_linear_infinite]" />
          <div className="absolute inset-3 rounded-full border border-violet-300/15 animate-[welcome-orbit_14s_linear_infinite_reverse]" />
          <span className="absolute -right-1 top-8 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.95)] animate-[welcome-float_3s_ease-in-out_infinite]" />
          <span className="absolute bottom-4 left-3 h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_14px_rgba(196,181,253,0.95)] animate-[welcome-float_3.8s_ease-in-out_infinite_0.5s]" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.65rem] border border-cyan-100/15 bg-gradient-to-br from-cyan-400/20 via-slate-900/80 to-violet-500/20 shadow-[0_0_48px_rgba(34,211,238,0.16),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl">
            <Command className="h-9 w-9 text-cyan-200 drop-shadow-[0_0_12px_rgba(103,232,249,0.65)]" />
          </div>
        </div>

        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
          POS · Sistema Operacional Pessoal
        </div>

        <h1 className="max-w-xl text-4xl font-black tracking-[-0.055em] text-white sm:text-6xl">
          Clareza para fazer
          <span className="block bg-gradient-to-r from-cyan-200 via-cyan-300 to-violet-300 bg-clip-text text-transparent">o que importa.</span>
        </h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-slate-400 sm:text-lg">
          Organize suas prioridades, transforme intenção em ação e avance no seu próprio ritmo.
        </p>

        <Link
          href="/inbox"
          className="group mt-10 inline-flex items-center gap-2 rounded-2xl border border-cyan-200/20 bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 shadow-[0_12px_32px_rgba(34,211,238,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-200 hover:shadow-[0_18px_42px_rgba(34,211,238,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        >
          Seja Produtivo
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>

        <p className="mt-5 text-xs text-slate-600">GTD, foco e organização em um só lugar.</p>
      </section>
    </main>
  );
}
