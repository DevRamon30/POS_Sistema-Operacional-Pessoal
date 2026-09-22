'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Flame, Plus, Check } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { HabitFrequency, Habit } from '@/lib/types';

export default function HabitsPage() {
  const habits = useStore((state) => state.habits);
  const addHabit = useStore((state) => state.addHabit);
  const toggleHabitCompletion = useStore((state) => state.toggleHabitCompletion);
  
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitFreq, setNewHabitFreq] = useState<HabitFrequency>('DAILY');

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    addHabit(newHabitName, newHabitFreq);
    setNewHabitName('');
  };

  const getTodayISOString = () => format(new Date(), 'yyyy-MM-dd');
  const todayStr = getTodayISOString();

  const getStreakData = (habit: Habit) => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(new Date(), 6 - i);
      return format(d, 'yyyy-MM-dd');
    });

    const isCompleted = (dateStr: string) => habit.completions.includes(dateStr);
    
    let currentStreak = 0;
    for (let i = 0; i < 30; i++) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
      if (isCompleted(d)) {
        currentStreak++;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }

    return { last7Days, isCompleted, currentStreak };
  };

  return (
    <div className="p-8 h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-secondary/20 text-secondary rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.2)]">
          <Flame className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white drop-shadow-sm">Hábitos</h1>
          <p className="text-slate-400 mt-1">Acompanhe suas rotinas e construa consistência.</p>
        </div>
      </div>

      <div className="mb-8">
        <form onSubmit={handleAddHabit} className="flex gap-4 items-end p-6 rounded-2xl bg-background/40 backdrop-blur-md border border-white/10 shadow-lg">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-slate-300">Nome do Hábito</label>
            <Input 
              value={newHabitName} 
              onChange={e => setNewHabitName(e.target.value)} 
              placeholder="Ex: Ler 10 páginas" 
              className="bg-black/20 border-white/10 text-white focus-visible:ring-secondary/50 placeholder:text-slate-500"
            />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-slate-300">Frequência</label>
            <select 
              className="flex h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50"
              value={newHabitFreq}
              onChange={e => setNewHabitFreq(e.target.value as HabitFrequency)}
            >
              <option value="DAILY" className="bg-slate-900">Diário</option>
              <option value="WEEKLY" className="bg-slate-900">Semanal</option>
            </select>
          </div>
          <Button type="submit" className="gap-2 bg-secondary hover:bg-secondary/90 text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all hover:scale-105">
            <Plus className="w-4 h-4" /> Adicionar
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {habits.map((habit, i) => {
          const { last7Days, isCompleted, currentStreak } = getStreakData(habit);
          const completedToday = isCompleted(todayStr);

          return (
            <Card key={habit.id} className="flex flex-col border border-white/5 bg-background/40 backdrop-blur-md hover:border-secondary/30 hover:bg-white/5 transition-all shadow-lg animate-in zoom-in-95 fill-mode-both group" style={{ animationDelay: `${i * 100}ms` }}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg text-white font-bold">{habit.name}</CardTitle>
                    <CardDescription className="mt-1 text-slate-400">
                      {habit.frequency === 'DAILY' ? 'Diário' : 'Semanal'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1 text-secondary font-bold bg-secondary/10 border border-secondary/20 shadow-[0_0_10px_rgba(168,85,247,0.1)] px-3 py-1 rounded-full text-sm">
                    <Flame className="w-4 h-4" />
                    {currentStreak}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end">
                
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {last7Days.map((date) => {
                      const done = isCompleted(date);
                      return (
                        <div 
                          key={date} 
                          title={date}
                          className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] transition-colors ${done ? 'bg-secondary text-white shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'bg-black/40 border border-white/5 text-transparent'}`}
                        >
                          {done && <Check className="w-4 h-4" />}
                        </div>
                      )
                    })}
                  </div>

                  <Button 
                    variant={completedToday ? "secondary" : "default"}
                    size="sm"
                    className={completedToday ? "bg-secondary/20 text-secondary border border-secondary/50 hover:bg-secondary/30" : "bg-secondary hover:bg-secondary/90 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"}
                    onClick={() => toggleHabitCompletion(habit.id, todayStr)}
                  >
                    {completedToday ? 'Feito hoje' : 'Completar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {habits.length === 0 && (
          <div className="col-span-full text-center py-16 text-slate-400 border border-dashed border-white/20 rounded-2xl bg-background/40 backdrop-blur-md">
            Nenhum hábito rastreado. Comece uma nova rotina acima.
          </div>
        )}
      </div>
    </div>
  );
}
