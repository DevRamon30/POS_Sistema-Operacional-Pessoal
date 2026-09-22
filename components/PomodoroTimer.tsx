'use client';

import { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { Play, Pause, Square, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type Mode = 'FOCUS' | 'BREAK';
const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

export function PomodoroTimer() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<Mode>('FOCUS');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');

  const tasks = useStore((state) => state.tasks);
  const updateTask = useStore((state) => state.updateTask);

  // Somente tarefas não concluídas
  const activeTasks = tasks.filter(t => t.status !== 'DONE');

  const handleComplete = useCallback(() => {
    setIsActive(false);
    
    if (mode === 'FOCUS') {
      if (selectedTaskId) {
        const task = tasks.find(t => t.id === selectedTaskId);
        if (task) {
          updateTask(selectedTaskId, { pomodorosDone: task.pomodorosDone + 1 });
        }
      }
      setMode('BREAK');
      setTimeLeft(BREAK_TIME);
    } else {
      setMode('FOCUS');
      setTimeLeft(FOCUS_TIME);
    }
  }, [mode, selectedTaskId, tasks, updateTask]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      handleComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, handleComplete]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'FOCUS' ? FOCUS_TIME : BREAK_TIME);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <Button 
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 bg-primary hover:bg-primary/90 text-slate-900 font-bold shadow-[0_0_15px_rgba(191,247,255,0.3)] transition-all hover:scale-110 p-0"
        >
          <Timer className="w-6 h-6" />
        </Button>
      )}

      {isOpen && (
        <Card className="w-80 bg-background/80 backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(191,247,255,0.15)] animate-in slide-in-from-bottom-8 fade-in duration-300">
          <div className="bg-white/5 border-b border-white/5 p-3 flex justify-between items-center rounded-t-lg">
            <div className="flex items-center gap-2 font-bold text-white">
              <Timer className="w-4 h-4 text-primary" />
              Pomodoro
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              ✕
            </button>
          </div>
          
          <CardContent className="p-4 flex flex-col gap-4">
            <div className="flex bg-black/40 border border-white/10 rounded-md p-1 shadow-inner">
              <button
                className={`flex-1 text-sm py-1.5 rounded-sm font-bold transition-all ${mode === 'FOCUS' ? 'bg-primary text-slate-900 shadow-[0_0_10px_rgba(191,247,255,0.3)]' : 'text-slate-400 hover:text-white'}`}
                onClick={() => { setMode('FOCUS'); setTimeLeft(FOCUS_TIME); setIsActive(false); }}
              >
                Foco (25m)
              </button>
              <button
                className={`flex-1 text-sm py-1.5 rounded-sm font-bold transition-all ${mode === 'BREAK' ? 'bg-secondary text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'text-slate-400 hover:text-white'}`}
                onClick={() => { setMode('BREAK'); setTimeLeft(BREAK_TIME); setIsActive(false); }}
              >
                Pausa (5m)
              </button>
            </div>

            <div className="text-center text-5xl font-bold font-mono text-white drop-shadow-[0_0_10px_rgba(191,247,255,0.3)] my-2 tracking-wider">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>

            <div className="flex justify-center gap-4">
              <Button 
                onClick={toggleTimer} 
                className={`w-12 h-12 rounded-full p-0 transition-all ${isActive ? 'bg-secondary hover:bg-secondary/90 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-primary hover:bg-primary/90 text-slate-900 shadow-[0_0_15px_rgba(191,247,255,0.3)]'}`}
              >
                {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
              </Button>
              <Button 
                onClick={resetTimer} 
                variant="outline" 
                className="w-12 h-12 rounded-full p-0 bg-transparent border-white/10 hover:bg-white/10 text-white transition-colors"
              >
                <Square className="w-4 h-4" />
              </Button>
            </div>

            {mode === 'FOCUS' && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <label className="text-[10px] font-bold text-slate-400 mb-2 block uppercase tracking-wider">Vincular a Tarefa</label>
                <select
                  className="w-full text-sm font-medium bg-black/40 border border-white/10 text-white rounded-md p-2.5 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                >
                  <option value="" className="bg-slate-900 text-slate-400">Nenhuma tarefa...</option>
                  {activeTasks.map(t => (
                    <option key={t.id} value={t.id} className="bg-slate-900 text-white">{t.title}</option>
                  ))}
                </select>
              </div>
            )}
            
            {mode === 'FOCUS' && selectedTaskId && (
              <div className="text-[11px] font-medium text-center text-primary/80 mt-1 animate-pulse">
                +1 pomodoro será adicionado ao concluir.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
