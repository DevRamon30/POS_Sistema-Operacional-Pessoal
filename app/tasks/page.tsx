'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KanbanBoard } from './components/KanbanBoard';
import { CalendarView } from './components/CalendarView';
import { CheckSquare, LayoutGrid, Calendar as CalendarIcon } from 'lucide-react';
import { MagicAiInput } from '@/components/MagicAiInput';

export default function TasksPage() {
  return (
    <div className="p-8 h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-primary/20 text-primary rounded-xl shadow-[0_0_15px_rgba(191,247,255,0.2)]">
          <CheckSquare className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white drop-shadow-sm">Tarefas</h1>
          <p className="text-slate-400 mt-1">Gerencie suas ações através de visões flexíveis.</p>
        </div>
      </div>

      <MagicAiInput />

      <Tabs defaultValue="kanban" className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full max-w-sm grid grid-cols-2 mb-6 bg-black/40 border border-white/5 p-1 rounded-xl">
          <TabsTrigger value="kanban" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_10px_rgba(191,247,255,0.1)] transition-all">
            <LayoutGrid className="w-4 h-4" />
            Quadro Kanban
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_10px_rgba(191,247,255,0.1)] transition-all">
            <CalendarIcon className="w-4 h-4" />
            Calendário
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="flex-1 min-h-0 mt-0 data-[state=active]:flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
          <KanbanBoard />
        </TabsContent>

        <TabsContent value="calendar" className="flex-1 min-h-0 mt-0 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CalendarView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
