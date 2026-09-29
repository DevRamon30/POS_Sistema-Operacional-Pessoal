'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InboxItem, EisenhowerQuadrant } from '@/lib/types';
import { useStore } from '@/lib/store';
import { Sparkles, Loader2, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ProcessItemModalProps {
  item: InboxItem | null;
  isOpen: boolean;
  onClose: () => void;
}

interface TaskSchedule {
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  description: string | null;
  priority: string | null;
}

export function ProcessItemModal({ item, isOpen, onClose }: ProcessItemModalProps) {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<{ title: string; pomodorosEstimated: number }[]>([]);
  const [quadrant, setQuadrant] = useState<EisenhowerQuadrant | null>(null);
  const [schedule, setSchedule] = useState<TaskSchedule>({
    date: null, startTime: null, endTime: null, description: null, priority: null,
  });
  const [processed, setProcessed] = useState(false);

  const { addTask, removeInboxItem } = useStore();

  const handleProcessAI = async () => {
    if (!item) return;
    setLoading(true);
    try {
      const [classifyRes, breakdownRes, parseRes] = await Promise.all([
        fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'classify', title: item.title }),
        }),
        fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'breakdown', title: item.title }),
        }),
        fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'parse-task', payload: item.title }),
        }),
      ]);

      const classifyData = await classifyRes.json();
      setQuadrant(classifyData.result?.quadrant || 'NENHUM');

      const breakdownData = await breakdownRes.json();
      const parsedTask = parseRes.ok ? await parseRes.json() : null;
      const parsedSchedule = parsedTask?.result;
      setSchedule({
        date: parsedSchedule?.date || null,
        startTime: parsedSchedule?.startTime || null,
        endTime: parsedSchedule?.endTime || null,
        description: parsedSchedule?.description || null,
        priority: parsedSchedule?.priority || null,
      });
      
      const subtasks = breakdownData.result?.subtasks || [item.title];
      setTasks(subtasks.map((t: string) => ({ title: t, pomodorosEstimated: 1 })));
      
      setProcessed(true);
    } catch (error) {
      console.error('Failed to process with AI', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!item) return;

    // Create tasks in Notion & store
    for (const t of tasks) {
      let notionId: string | null = null;
      try {
        const res = await fetch('/api/tasks/notion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: t.title,
            status: 'NEXT_ACTION',
            date: schedule.date,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            description: schedule.description,
            priority: schedule.priority,
            quadrant,
            pomodorosEstimated: t.pomodorosEstimated,
            pomodorosDone: 0,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          notionId = data?.data?.id || null;
        }
      } catch (err) {
        console.warn('Erro ao salvar no Notion durante desdobramento:', err);
      }

      addTask({
        title: t.title,
        status: 'NEXT_ACTION',
        quadrant: quadrant,
        dueDate: schedule.date,
        projectId: null,
        pomodorosEstimated: t.pomodorosEstimated,
        pomodorosDone: 0,
        aiGenerated: true,
        notionId,
      });
    }

    // Remove from Inbox
    removeInboxItem(item.id);
    handleClose();
  };

  const handleClose = () => {
    setProcessed(false);
    setTasks([]);
    setQuadrant(null);
    setSchedule({ date: null, startTime: null, endTime: null, description: null, priority: null });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-white/10 text-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Processar: {item?.title}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {!processed && !loading && (
            <div className="text-center space-y-6">
              <p className="text-sm text-slate-400">
                Deixe a IA analisar este item para sugerir tarefas e a prioridade na Matriz de Eisenhower.
              </p>
              <Button onClick={handleProcessAI} className="w-full bg-primary hover:bg-primary/90 text-slate-900 font-bold shadow-[0_0_15px_rgba(191,247,255,0.3)] transition-all">
                <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                Processar com IA
              </Button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="w-10 h-10 text-primary animate-spin drop-shadow-[0_0_10px_rgba(191,247,255,0.5)]" />
              <p className="text-sm text-slate-400 font-medium">Analisando item na rede neural...</p>
            </div>
          )}

          {processed && !loading && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-2">Quadrante Sugerido:</h4>
                <div className="p-3 bg-black/20 border border-white/5 rounded-md text-sm font-bold text-white shadow-inner">
                  {quadrant?.replace(/_/g, ' ')}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-2">Agendamento:</h4>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    type="date"
                    value={schedule.date || ''}
                    onChange={(e) => setSchedule((current) => ({ ...current, date: e.target.value || null }))}
                    className="bg-black/20 border-white/10 text-white focus-visible:ring-primary/50 [color-scheme:dark]"
                    aria-label="Data da tarefa"
                  />
                  <Input
                    type="time"
                    value={schedule.startTime || ''}
                    onChange={(e) => setSchedule((current) => ({ ...current, startTime: e.target.value || null }))}
                    className="bg-black/20 border-white/10 text-white focus-visible:ring-primary/50 [color-scheme:dark]"
                    aria-label="Hora de início"
                  />
                  <Input
                    type="time"
                    value={schedule.endTime || ''}
                    onChange={(e) => setSchedule((current) => ({ ...current, endTime: e.target.value || null }))}
                    className="bg-black/20 border-white/10 text-white focus-visible:ring-primary/50 [color-scheme:dark]"
                    aria-label="Hora de término"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">Data, início e término extraídos do item original. Ajuste antes de confirmar, se necessário.</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-2">Tarefas Desdobradas (NEXT_ACTION):</h4>
                <div className="space-y-3">
                  {tasks.map((task, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input 
                        value={task.title}
                        onChange={(e) => {
                          const newTasks = [...tasks];
                          newTasks[idx].title = e.target.value;
                          setTasks(newTasks);
                        }}
                        className="flex-1 bg-black/20 border-white/10 text-white focus-visible:ring-primary/50"
                      />
                      <Input 
                        type="number" 
                        value={task.pomodorosEstimated}
                        onChange={(e) => {
                          const newTasks = [...tasks];
                          newTasks[idx].pomodorosEstimated = parseInt(e.target.value) || 1;
                          setTasks(newTasks);
                        }}
                        className="w-16 text-center bg-black/20 border-white/10 text-white focus-visible:ring-primary/50"
                        title="Pomodoros Estimados"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleConfirm} className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all">
                <Check className="w-5 h-5 mr-2" />
                Confirmar e Mover para Tarefas
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
