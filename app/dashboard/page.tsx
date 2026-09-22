'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid
} from 'recharts';
import {
  Sparkles, LayoutDashboard, CheckCircle2,
  Zap, TrendingUp, Target, Activity, ChevronRight, X,
  Flame, Trophy, Calendar
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';


// ─── Constants ──────────────────────────────────────────────────────────────

const QUADRANT_COLORS: Record<string, string> = {
  URGENTE_IMPORTANTE:       '#fb7185',
  IMPORTANTE_NAO_URGENTE:   '#a78bfa',
  URGENTE_NAO_IMPORTANTE:   '#fbbf24',
  NENHUM:                   '#64748b',
};

const QUADRANT_LABELS: Record<string, string> = {
  URGENTE_IMPORTANTE:       'Faça Agora',
  IMPORTANTE_NAO_URGENTE:   'Agende',
  URGENTE_NAO_IMPORTANTE:   'Delegue',
  NENHUM:                   'Sem Classificação',
};

const STATUS_LABEL: Record<string, string> = {
  INBOX:       'Inbox',
  NEXT_ACTION: 'Próxima Ação',
  IN_PROGRESS: 'Em Andamento',
  DONE:        'Concluída',
};

const STATUS_COLOR: Record<string, string> = {
  INBOX:       'bg-slate-700 text-slate-300',
  NEXT_ACTION: 'bg-blue-900/60 text-blue-300',
  IN_PROGRESS: 'bg-amber-900/60 text-amber-300',
  DONE:        'bg-emerald-900/60 text-emerald-300',
};

const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#fff',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    fontSize: '13px',
  },
  itemStyle: { color: '#e2e8f0' },
};

// ─── Subcomponents ───────────────────────────────────────────────────────────

function StatCard({
  label, value, unit = '', sub, color = 'primary', icon, delay = 0
}: {
  label: string; value: number; unit?: string; sub: string;
  color?: string; icon: React.ReactNode; delay?: number;
}) {
  const textColors: Record<string, string> = {
    primary: 'text-cyan-400', secondary: 'text-purple-400',
    amber: 'text-amber-400', emerald: 'text-emerald-400',
  };
  const iconBgs: Record<string, string> = {
    primary: 'bg-cyan-500/10 border-cyan-500/20', secondary: 'bg-purple-500/10 border-purple-500/20',
    amber: 'bg-amber-500/10 border-amber-500/20', emerald: 'bg-emerald-500/10 border-emerald-500/20',
  };
  const glowColors: Record<string, string> = {
    primary: 'bg-cyan-400/20', secondary: 'bg-violet-400/20',
    amber: 'bg-amber-400/20', emerald: 'bg-emerald-400/20',
  };
  const progressColors: Record<string, string> = {
    primary: 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.65)]',
    secondary: 'bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.65)]',
    amber: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.65)]',
    emerald: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.65)]',
  };
  return (
    <Card
      className={`relative overflow-hidden metric-surface 
        transition-all duration-200 ease-out hover:-translate-y-1 hover:border-white/15 hover:shadow-[0_24px_50px_-26px_rgba(0,0,0,0.95)] group cursor-default
        animate-in zoom-in-95 duration-500 fill-mode-both rounded-2xl`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute -top-12 -right-10 w-36 h-36 ${glowColors[color]} rounded-full blur-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
      <div className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <CardHeader className="pb-2 pt-5 flex flex-row items-center justify-between relative z-10 space-y-0">
        <CardTitle className={`text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400`}>{label}</CardTitle>
        <div className={`p-2 rounded-xl border ${iconBgs[color]} ${textColors[color]}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="relative z-10 pb-5">
        <div className="text-4xl lg:text-5xl font-black text-white tracking-[-0.04em] drop-shadow-md leading-none mt-1">
          {value}<span className="text-lg lg:text-xl text-slate-500 font-medium ml-1">{unit}</span>
        </div>
        <p className="text-xs text-slate-400 mt-2.5 font-medium opacity-80">{sub}</p>
        <div className="mt-4 h-1 w-full bg-white/[0.06] rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ease-out ${progressColors[color]}`}
            style={{ width: `${Math.min(value, 100)}%` }} />
        </div>
      </CardContent>
    </Card>
  );
}

interface ContextItem { label: string; badge: string; badgeColor: string; note?: string; }

function ContextPanel({ title, subtitle, color, items, onClose }: {
  title: string; subtitle: string; color: string; items: ContextItem[]; onClose: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-slate-900/80 backdrop-blur-xl
      animate-in slide-in-from-top-3 fade-in duration-400"
      style={{ borderColor: color + '40' }}
    >
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-sm">{title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          </div>
          <button onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
            <X className="w-4 h-4" />
          </button>
        </div>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-500">
            <CheckCircle2 className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">Nenhum item nessa categoria</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {items.map((item, i) => (
              <div key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group/item">
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover/item:text-slate-400 shrink-0" />
                <span className="text-sm text-slate-200 flex-1 truncate">{item.label}</span>
                {item.note && <span className="text-xs text-slate-500 shrink-0">{item.note}</span>}
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { tasks, projects, habits } = useStore();
  const [review, setReview]                   = useState('');
  const [isLoading, setIsLoading]             = useState(false);
  const [selectedQuadrant, setSelectedQuadrant] = useState<string | null>(null);
  const [selectedPomodoro, setSelectedPomodoro] = useState<string | null>(null);
  const [habitFocusMode, setHabitFocusMode]   = useState(false);

  // ── Computed Metrics ─────────────────────────────────────────────────────

  const totalTasks     = tasks.length;
  const doneTasks      = tasks.filter(t => t.status === 'DONE').length;
  const inProgress     = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const completionRate = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  const last7Days = useMemo(() =>
    Array.from({ length: 7 }).map((_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd')), []);

  const habitConsistency = useMemo(() => {
    if (habits.length === 0) return 0;
    let totalExpected = 0, totalDone = 0;
    habits.forEach(habit => {
      if (habit.frequency === 'DAILY') {
        totalExpected += 7;
        last7Days.forEach(date => { if (habit.completions.includes(date)) totalDone++; });
      } else {
        totalExpected += 1;
        if (habit.completions.some(d => last7Days.includes(d))) totalDone++;
      }
    });
    return totalExpected === 0 ? 0 : Math.round((totalDone / totalExpected) * 100);
  }, [habits, last7Days]);

  const habitsAtRisk = useMemo(() =>
    habits.filter(h => !last7Days.slice(0, 3).some(d => h.completions.includes(d))),
    [habits, last7Days]);

  const quadrantData = useMemo(() =>
    Object.entries(QUADRANT_LABELS).map(([key, label]) => ({
      name: label, key,
      value: tasks.filter(t => t.quadrant === key || (key === 'NENHUM' && !t.quadrant)).length,
      color: QUADRANT_COLORS[key],
    })).filter(d => d.value > 0), [tasks]);

  const pomodoroData = useMemo(() =>
    tasks.filter(t => t.pomodorosEstimated > 0 || t.pomodorosDone > 0).map(t => ({
      id: t.id,
      name: t.title.substring(0, 13) + (t.title.length > 13 ? '…' : ''),
      fullName: t.title,
      Estimados: t.pomodorosEstimated,
      Realizados: t.pomodorosDone,
      status: t.status,
      efficiency: t.pomodorosEstimated === 0 ? 0 :
        Math.round((t.pomodorosDone / t.pomodorosEstimated) * 100),
    })), [tasks]);

  const projectProgress = useMemo(() =>
    projects.map(p => {
      const pTasks = tasks.filter(t => t.projectId === p.id);
      const pDone  = pTasks.filter(t => t.status === 'DONE').length;
      return { ...p, rate: pTasks.length === 0 ? 0 : Math.round((pDone / pTasks.length) * 100),
        done: pDone, total: pTasks.length, tasks: pTasks };
    }), [tasks, projects]);

  const totalPomodorosEstimated = tasks.reduce((a, t) => a + t.pomodorosEstimated, 0);
  const totalPomodorosDone      = tasks.reduce((a, t) => a + t.pomodorosDone, 0);
  const pomodoroEfficiency = totalPomodorosEstimated === 0 ? 0 :
    Math.round((totalPomodorosDone / totalPomodorosEstimated) * 100);

  // ── Context Panel Items ──────────────────────────────────────────────────

  const quadrantPanelItems = useMemo((): ContextItem[] => {
    if (!selectedQuadrant) return [];
    return tasks
      .filter(t => t.quadrant === selectedQuadrant || (selectedQuadrant === 'NENHUM' && !t.quadrant))
      .map(t => ({
        label: t.title,
        badge: STATUS_LABEL[t.status] ?? t.status,
        badgeColor: STATUS_COLOR[t.status] ?? '',
        note: t.dueDate ? format(new Date(t.dueDate), 'dd/MM', { locale: ptBR }) : undefined,
      }));
  }, [selectedQuadrant, tasks]);

  const pomodoroPanelItems = useMemo((): ContextItem[] => {
    if (!selectedPomodoro) return [];
    const task = tasks.find(t => t.id === selectedPomodoro);
    if (!task) return [];
    return [{
      label: task.title,
      badge: `${task.pomodorosDone}/${task.pomodorosEstimated} 🍅`,
      badgeColor: task.pomodorosDone >= task.pomodorosEstimated
        ? 'bg-emerald-900/60 text-emerald-300' : 'bg-amber-900/60 text-amber-300',
      note: `${Math.round((task.pomodorosDone / Math.max(task.pomodorosEstimated, 1)) * 100)}% efic.`,
    }];
  }, [selectedPomodoro, tasks]);

  const habitPanelItems = useMemo((): ContextItem[] =>
    habitsAtRisk.map(h => ({
      label: h.name,
      badge: h.frequency === 'DAILY' ? 'Diário' : 'Semanal',
      badgeColor: 'bg-red-900/60 text-red-300',
      note: `${h.completions.filter(d => last7Days.includes(d)).length}/7 dias`,
    })), [habitsAtRisk, last7Days]);

  // ── Weekly Review ────────────────────────────────────────────────────────

  const generateWeeklyReview = async () => {
    setIsLoading(true);
    setReview('');
    const payload = {
      tarefasConcluidas:      doneTasks,
      tarefasPlanejadas:      totalTasks,
      distribuicaoQuadrantes: quadrantData.map(q => `${q.name}: ${q.value}`).join(', '),
      pomodoros:              { estimados: totalPomodorosEstimated, realizados: totalPomodorosDone },
      consistenciaHabitos:    `${habitConsistency}%`,
    };
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'weekly-review', payload }),
      });
      const data = await res.json();
      setReview(res.ok ? data.result : 'Erro: ' + (data.error || 'Falha ao conectar.'));
    } catch (err: unknown) {
      setReview('Erro: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="p-6 lg:p-10 h-full flex flex-col overflow-y-auto scroll-smooth">

      {/* ── Header ── */}
      <div className="flex items-center gap-4 mb-10 animate-in slide-in-from-top-4 duration-500">
        <div className="p-3.5 bg-cyan-500/20 text-cyan-400 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.25)] border border-cyan-500/30">
          <LayoutDashboard className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white
            drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]">
            Command Center
          </h1>
          <p className="text-slate-400 mt-0.5 text-sm">
            {format(new Date(), "EEEE, d 'de' MMMM · yyyy", { locale: ptBR })}
          </p>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard label="Taxa de Conclusão" value={completionRate} unit="%"
          sub={`${doneTasks} de ${totalTasks} tarefas concluídas`}
          color="primary" icon={<CheckCircle2 className="w-8 h-8" />} delay={0} />
        <StatCard label="Hábitos (7 dias)" value={habitConsistency} unit="%"
          sub={`${habitsAtRisk.length} hábito(s) em risco`}
          color="secondary" icon={<Flame className="w-8 h-8" />} delay={100} />
        <StatCard label="Em Andamento" value={inProgress}
          sub={`${totalTasks - doneTasks - inProgress} tarefa(s) na fila`}
          color="amber" icon={<Activity className="w-8 h-8" />} delay={200} />
        <StatCard label="Eficiência Pomodoro" value={pomodoroEfficiency} unit="%"
          sub={`${totalPomodorosDone}/${totalPomodorosEstimated} ciclos 🍅`}
          color="emerald" icon={<Zap className="w-8 h-8" />} delay={300} />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Eisenhower Pie */}
        <Card className="premium-surface 
          transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-white/15
          animate-in slide-in-from-bottom-6 duration-700 delay-200 fill-mode-both rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base text-white font-bold flex items-center gap-2">
                  <Target className="w-4 h-4 text-cyan-400" /> Espectro de Foco
                </CardTitle>
                <CardDescription className="text-slate-500 text-xs mt-0.5">
                  Matriz de Eisenhower · clique no gráfico para ver as tarefas
                </CardDescription>
              </div>
              {selectedQuadrant && (
                <button onClick={() => setSelectedQuadrant(null)}
                  className="text-xs text-slate-500 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-all flex items-center gap-1">
                  <X className="w-3 h-3" /> Limpar
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent className="min-h-[280px]">
            {quadrantData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                  <Pie
                    data={quadrantData}
                    cx="50%" cy="50%"
                    innerRadius={65} outerRadius={105}
                    paddingAngle={6} dataKey="value"
                    stroke="none"
                    isAnimationActive animationBegin={300} animationDuration={1200}
                    cornerRadius={8}
                    onClick={(d) => setSelectedQuadrant((d as {key:string}).key === selectedQuadrant ? null : (d as {key:string}).key)}
                    className="cursor-pointer"
                  >
                    {quadrantData.map((entry, i) => (
                      <Cell
                        key={`cell-${i}`} fill={entry.color}
                        opacity={selectedQuadrant && selectedQuadrant !== entry.key ? 0.25 : 1}
                        className="transition-opacity duration-300"
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip {...tooltipStyle} formatter={(v, n) => [`${v} tarefa(s)`, n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 px-2 pb-1">
                  {quadrantData.map((item) => (
                    <div key={item.key} className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="h-2 w-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: item.color, color: item.color }} />
                      <span className="truncate">{item.name}</span>
                      <span className="ml-auto text-slate-300 tabular-nums">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-slate-600 gap-2">
                <Target className="w-10 h-10 opacity-30" />
                <p className="text-sm">Nenhuma tarefa classificada ainda</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pomodoro Bar */}
        <Card className="premium-surface 
          transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-white/15
          animate-in slide-in-from-bottom-6 duration-700 delay-300 fill-mode-both rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base text-white font-bold flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" /> Desempenho Energético
                </CardTitle>
                <CardDescription className="text-slate-500 text-xs mt-0.5">
                  Pomodoros Estimados vs Executados · clique para inspecionar
                </CardDescription>
              </div>
              {selectedPomodoro && (
                <button onClick={() => setSelectedPomodoro(null)}
                  className="text-xs text-slate-500 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-all flex items-center gap-1">
                  <X className="w-3 h-3" /> Limpar
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent className="min-h-[280px]">
            {pomodoroData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={pomodoroData}
                  margin={{ top: 10, right: 20, left: -20, bottom: 5 }}
                  onClick={(d) => {
                    const activePayload = (d as typeof d & { activePayload?: Array<{ payload: { id: string } }> })?.activePayload;
                    if (activePayload?.[0]) {
                      const item = activePayload[0].payload;
                      setSelectedPomodoro(item.id === selectedPomodoro ? null : item.id);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <defs>
                    <linearGradient id="estimatedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.55" />
                      <stop offset="100%" stopColor="#475569" stopOpacity="0.22" />
                    </linearGradient>
                    <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#67e8f9" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="name" fontSize={10} stroke="rgba(255,255,255,0.3)"
                    axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} stroke="rgba(255,255,255,0.3)"
                    axisLine={false} tickLine={false} fontSize={10} />
                  <RechartsTooltip
                    {...tooltipStyle}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as {fullName:string;Estimados:number;Realizados:number;efficiency:number};
                      return (
                        <div style={tooltipStyle.contentStyle} className="p-3">
                          <p className="font-semibold text-white mb-1.5 text-sm">{d.fullName}</p>
                          <p className="text-slate-400 text-xs">🍅 Estimados: <span className="text-white">{d.Estimados}</span></p>
                          <p className="text-slate-400 text-xs">✅ Realizados: <span className="text-emerald-400">{d.Realizados}</span></p>
                          <p className="text-slate-400 text-xs mt-1">Eficiência: <span className={d.efficiency >= 100 ? 'text-emerald-400' : 'text-amber-400'}>{d.efficiency}%</span></p>
                          <p className="text-slate-600 text-xs mt-1 italic">Clique para ver detalhes abaixo</p>
                        </div>
                      );
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', opacity: 0.7 }} />
                  <Bar dataKey="Estimados" fill="url(#estimatedGradient)" radius={[7,7,2,2]}
                    isAnimationActive animationDuration={1200} />
                  <Bar dataKey="Realizados" fill="url(#completedGradient)" radius={[7,7,2,2]}
                    isAnimationActive animationDuration={1200} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-slate-600 gap-2">
                <Zap className="w-10 h-10 opacity-30" />
                <p className="text-sm">Nenhum ciclo Pomodoro registrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Context Panels ── */}
      {(selectedQuadrant || selectedPomodoro) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {selectedQuadrant && (
            <ContextPanel
              title={`${QUADRANT_LABELS[selectedQuadrant]} — Tarefas`}
              subtitle={`${quadrantPanelItems.length} tarefa(s) neste quadrante · prioridade sinalizada`}
              color={QUADRANT_COLORS[selectedQuadrant]}
              items={quadrantPanelItems}
              onClose={() => setSelectedQuadrant(null)}
            />
          )}
          {selectedPomodoro && (
            <ContextPanel
              title="Desempenho Energético — Detalhes"
              subtitle="Tarefa selecionada no gráfico de barras"
              color="#22d3ee"
              items={pomodoroPanelItems}
              onClose={() => setSelectedPomodoro(null)}
            />
          )}
        </div>
      )}

      {/* ── Habits at Risk ── */}
      {habitsAtRisk.length > 0 && (
        <div className="mb-6 animate-in slide-in-from-bottom-4 duration-500 delay-400 fill-mode-both">
          <div
            className="flex items-center justify-between cursor-pointer mb-3 group select-none"
            onClick={() => setHabitFocusMode(v => !v)}
          >
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              Hábitos em Risco
              <span className="text-xs px-2 py-0.5 bg-red-900/50 text-red-400 rounded-full border border-red-700/50 font-semibold">
                {habitsAtRisk.length}
              </span>
            </h2>
            <span className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
              {habitFocusMode ? '▲ Recolher' : '▼ Expandir lista'}
            </span>
          </div>
          {habitFocusMode && (
            <ContextPanel
              title="Hábitos sem execução recente"
              subtitle={`Sem registro nos últimos 3 dias — ${habitsAtRisk.length} hábito(s) precisam de atenção`}
              color="#ef4444"
              items={habitPanelItems}
              onClose={() => setHabitFocusMode(false)}
            />
          )}
        </div>
      )}

      {/* ── AI Weekly Review ── */}
      <div className="mb-8 animate-in slide-in-from-bottom-4 duration-500 delay-500 fill-mode-both">
        <div className="ai-border relative p-[1px] rounded-2xl bg-gradient-to-r from-cyan-500/50 via-violet-500/50 to-cyan-500/50 overflow-hidden shadow-[0_0_28px_rgba(168,85,247,0.16)] group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <Card className="relative h-full bg-slate-900/90 backdrop-blur-2xl border-none rounded-2xl">
            <CardHeader className="pb-2 relative z-10 pt-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="text-base text-white font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                  Inteligência Analítica Semanal
                </CardTitle>
                <CardDescription className="text-slate-500 text-xs mt-0.5">
                  Relatório gerado por IA com base nos seus dados
                </CardDescription>
              </div>
              <Button size="sm" onClick={generateWeeklyReview} disabled={isLoading}
                className="bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500 hover:text-slate-900
                  border border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.2)]
                  transition-all duration-300 font-semibold">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Processando…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5" /> Gerar Relatório
                  </span>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="relative z-10 pb-5">
            <div className="text-sm text-slate-300 leading-relaxed min-h-[64px] p-4
              bg-black/25 rounded-xl border border-white/5">
              {review ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 whitespace-pre-line">{review}</div>
              ) : (
                <span className="opacity-35 italic">O motor de IA está pronto. Solicite uma análise baseada nos dados do seu sistema.</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      </div>

      {/* ── Projects ── */}
      {projectProgress.length > 0 && (
        <div className="mb-8 animate-in slide-in-from-bottom-6 duration-700 delay-600 fill-mode-both">
          <h2 className="text-sm font-bold mb-4 text-white tracking-tight flex items-center gap-2">
            <span className="w-2 h-5 bg-gradient-to-b from-cyan-400 to-purple-400 rounded-full" />
            <Trophy className="w-4 h-4 text-amber-400" />
            Projetos Ativos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectProgress.map((p, i) => (
              <Card key={p.id}
                className="premium-surface hover:bg-white/[0.05] hover:-translate-y-0.5 transition-all duration-200 ease-out group cursor-default rounded-2xl"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <CardHeader className="pb-2 pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm text-white font-semibold leading-tight">{p.name}</CardTitle>
                    <span className="text-xs font-black text-white shrink-0">{p.rate}%</span>
                  </div>
                  {p.dueDate && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(p.dueDate), "d 'de' MMM", { locale: ptBR })}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex justify-between text-xs mb-2 text-slate-500">
                    <span>{p.done}/{p.total} módulos concluídos</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500
                        transition-all duration-1000 ease-out
                        group-hover:shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                      style={{ width: `${p.rate}%` }}
                    />
                  </div>
                  {p.tasks.slice(0, 2).map(t => (
                    <div key={t.id} className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        t.status === 'DONE' ? 'bg-emerald-400' :
                        t.status === 'IN_PROGRESS' ? 'bg-amber-400' : 'bg-slate-600'
                      }`} />
                      <span className="truncate">{t.title}</span>
                    </div>
                  ))}
                  {p.tasks.length > 2 && (
                    <p className="text-xs text-slate-600 mt-1.5 ml-3.5">+{p.tasks.length - 2} mais…</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
