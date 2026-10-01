'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { QUADRANT_COLORS } from './constants';
import { Play, CheckCircle2, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { useState } from 'react';
import { Task } from '@/lib/types';
import { parseLocalTaskDate } from '@/lib/task-schedule';

const STATUS_LABEL: Record<Task['status'], string> = {
  INBOX: 'Inbox',
  NEXT_ACTION: 'Próxima ação',
  IN_PROGRESS: 'Em andamento',
  DONE: 'Concluída',
};

export function CalendarView() {
  const allTasks = useStore((state) => state.tasks);
  const tasks = allTasks.filter(t => t.dueDate);
  const moveTaskStatus = useStore((state) => state.moveTaskStatus);
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [hoveredTask, setHoveredTask] = useState<{ task: Task; x: number; y: number } | null>(null);
  const today = new Date();
  const start = startOfMonth(currentMonth);
  const end = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start, end });
  const leadingDays = Array.from({ length: getDay(start) });
  const mobileDays = days
    .map((day) => ({
      day,
      dayTasks: tasks.filter((task) => isSameDay(parseLocalTaskDate(task.dueDate!), day)),
    }))
    .filter(({ dayTasks }) => dayTasks.length > 0);

  return (
    <Card className="overflow-hidden bg-background/40 backdrop-blur-md border border-white/10 shadow-xl">
      <CardHeader className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-white capitalize drop-shadow-sm">
            {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
          </CardTitle>
          <p className="mt-1 text-xs text-slate-500">Navegue pelos meses para visualizar seus prazos.</p>
        </div>
        <div className="flex items-center justify-between gap-1 rounded-xl border border-white/10 bg-black/20 p-1 sm:justify-start">
          <button
            onClick={() => setCurrentMonth((month) => subMonths(month, 1))}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Mês anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentMonth(startOfMonth(new Date()))}
            className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-cyan-300 transition-colors hover:bg-cyan-400/10"
            title="Voltar ao mês atual"
          >
            <CalendarDays className="h-3.5 w-3.5" /> Hoje
          </button>
          <button
            onClick={() => setCurrentMonth((month) => addMonths(month, 1))}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Próximo mês"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-4 sm:px-6 sm:pb-6">
        <div className="space-y-4 md:hidden">
          {mobileDays.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 bg-black/20 px-4 py-10 text-center text-sm text-slate-500">
              Nenhuma tarefa agendada neste mês.
            </div>
          ) : mobileDays.map(({ day, dayTasks }) => (
            <section key={day.toISOString()} className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
              <div className={`flex items-center justify-between border-b border-white/5 px-3 py-2.5 ${isSameDay(day, today) ? 'bg-primary/10' : 'bg-white/[0.03]'}`}>
                <h3 className="text-sm font-bold capitalize text-white">{format(day, "EEEE, d 'de' MMMM", { locale: ptBR })}</h3>
                {isSameDay(day, today) && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-slate-900">Hoje</span>}
              </div>
              <div className="space-y-2 p-2.5">
                {dayTasks.map((task) => (
                  <article key={task.id} className="rounded-lg border border-white/10 bg-slate-950/55 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-semibold leading-snug text-white">{task.title}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
                          {task.startTime && <span>{task.startTime}{task.endTime ? `–${task.endTime}` : ''}</span>}
                          <span>{STATUS_LABEL[task.status]}</span>
                          <span>{task.pomodorosDone}/{task.pomodorosEstimated} pomodoros</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        {task.status !== 'IN_PROGRESS' && task.status !== 'DONE' && (
                          <button onClick={() => moveTaskStatus(task.id, 'IN_PROGRESS')} className="rounded-lg border border-white/10 p-2 text-slate-400 active:bg-white/10 active:text-primary" aria-label="Mover para em andamento">
                            <Play className="h-4 w-4" />
                          </button>
                        )}
                        {task.status !== 'DONE' && (
                          <button onClick={() => moveTaskStatus(task.id, 'DONE')} className="rounded-lg border border-white/10 p-2 text-slate-400 active:bg-white/10 active:text-green-400" aria-label="Concluir tarefa">
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="hidden grid-cols-7 gap-px bg-white/10 rounded-xl overflow-hidden border border-white/10 md:grid">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="bg-black/40 p-3 text-center text-sm font-bold text-slate-400 border-b border-white/5 uppercase tracking-wider">
              {day}
            </div>
          ))}
          
          {leadingDays.map((_, index) => (
            <div key={`empty-${index}`} className="min-h-[120px] bg-black/20" />
          ))}

          {days.map(day => {
            const dayTasks = tasks.filter(t => isSameDay(parseLocalTaskDate(t.dueDate!), day));
            const isToday = isSameDay(day, today);
            
            return (
              <div 
                key={day.toISOString()} 
                className={`min-h-[120px] p-2 transition-colors ${isToday ? 'bg-primary/10 shadow-[inset_0_0_15px_rgba(191,247,255,0.1)]' : 'bg-background/60 hover:bg-white/5'}`}
              >
                <div className={`text-sm font-bold mb-2 flex items-center justify-center w-8 h-8 rounded-full ${isToday ? 'bg-primary text-slate-900 shadow-[0_0_10px_rgba(191,247,255,0.5)]' : 'text-slate-500'}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayTasks.map(task => (
                    <div 
                      key={task.id}
                      className={`text-[11px] font-medium p-1.5 rounded-md border flex items-center justify-between group/caltask ${
                        task.quadrant && task.quadrant !== 'NENHUM' 
                          ? QUADRANT_COLORS[task.quadrant] 
                          : 'bg-white/10 text-slate-300 border-white/5'
                      }`}
                      title={task.title}
                      onMouseEnter={(event) => {
                        const rect = event.currentTarget.getBoundingClientRect();
                        setHoveredTask({ task, x: rect.left + rect.width / 2, y: rect.top });
                      }}
                      onMouseLeave={() => setHoveredTask(null)}
                    >
                      <span className="truncate flex-1">{task.title}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover/caltask:opacity-100 transition-opacity ml-1 bg-black/40 rounded px-0.5">
                        {task.status !== 'IN_PROGRESS' && task.status !== 'DONE' && (
                          <button onClick={() => moveTaskStatus(task.id, 'IN_PROGRESS')} className="hover:text-primary transition-colors" title="Em Andamento">
                            <Play className="w-3 h-3" />
                          </button>
                        )}
                        {task.status !== 'DONE' && (
                          <button onClick={() => moveTaskStatus(task.id, 'DONE')} className="hover:text-green-400 transition-colors" title="Concluir">
                            <CheckCircle2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      {hoveredTask && (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-50 hidden w-64 -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-xl border border-white/[0.12] bg-slate-950/95 p-3 text-left shadow-[0_18px_45px_rgba(0,0,0,0.55)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 md:block"
          style={{ left: hoveredTask.x, top: hoveredTask.y }}
        >
          <p className="pr-2 text-sm font-bold leading-snug text-white">{hoveredTask.task.title}</p>
          <div className="mt-3 space-y-1.5 text-xs text-slate-400">
            <p className="flex items-center justify-between gap-3"><span>Status</span><span className="font-medium text-slate-200">{STATUS_LABEL[hoveredTask.task.status]}</span></p>
            {hoveredTask.task.dueDate && (
              <p className="flex items-center justify-between gap-3"><span>Prazo</span><span className="font-medium text-cyan-200">{format(parseLocalTaskDate(hoveredTask.task.dueDate), 'dd MMM', { locale: ptBR })}{hoveredTask.task.startTime ? `, ${hoveredTask.task.startTime}${hoveredTask.task.endTime ? `–${hoveredTask.task.endTime}` : ''}` : ''}</span></p>
            )}
            {hoveredTask.task.quadrant && hoveredTask.task.quadrant !== 'NENHUM' && (
              <p className="flex items-center justify-between gap-3"><span>Prioridade</span><span className="font-medium text-violet-200">{hoveredTask.task.quadrant.replace(/_/g, ' ')}</span></p>
            )}
            <p className="flex items-center justify-between gap-3"><span>Pomodoros</span><span className="font-medium text-amber-200">{hoveredTask.task.pomodorosDone}/{hoveredTask.task.pomodorosEstimated}</span></p>
          </div>
        </div>
      )}
    </Card>
  );
}
