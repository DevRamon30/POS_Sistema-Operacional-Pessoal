'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { QUADRANT_COLORS } from './constants';
import { Play, CheckCircle2 } from 'lucide-react';

export function CalendarView() {
  const allTasks = useStore((state) => state.tasks);
  const tasks = allTasks.filter(t => t.dueDate);
  const moveTaskStatus = useStore((state) => state.moveTaskStatus);
  
  // Basic implementation: Current month
  const today = new Date();
  const start = startOfMonth(today);
  const end = endOfMonth(today);
  const days = eachDayOfInterval({ start, end });

  return (
    <Card className="bg-background/40 backdrop-blur-md border border-white/10 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white capitalize drop-shadow-sm">
          {format(today, 'MMMM yyyy', { locale: ptBR })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-px bg-white/10 rounded-xl overflow-hidden border border-white/10">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="bg-black/40 p-3 text-center text-sm font-bold text-slate-400 border-b border-white/5 uppercase tracking-wider">
              {day}
            </div>
          ))}
          
          {/* Empty cells for offset could be added here, but keeping simple for now */}
          
          {days.map(day => {
            const dayTasks = tasks.filter(t => isSameDay(new Date(t.dueDate!), day));
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
    </Card>
  );
}
