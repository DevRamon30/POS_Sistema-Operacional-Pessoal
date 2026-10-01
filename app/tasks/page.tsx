'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KanbanBoard } from './components/KanbanBoard';
import { CalendarView } from './components/CalendarView';
import { CheckSquare, LayoutGrid, Calendar as CalendarIcon } from 'lucide-react';
import { MagicAiInput } from '@/components/MagicAiInput';

export default function TasksPage() {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden p-4 sm:p-6 lg:p-8 min-h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
        <div className="p-3 bg-primary/20 text-primary rounded-xl shadow-[0_0_15px_rgba(191,247,255,0.2)]">
          <CheckSquare className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm">Tarefas</h1>
          <p className="text-sm sm:text-base text-slate-400 mt-1">Gerencie suas ações através de visões flexíveis.</p>
        </div>
      </div>

      <MagicAiInput />

      <Tabs defaultValue="kanban" className="w-full min-w-0 max-w-full flex-1 flex flex-col min-h-0">
        <TabsList className="w-full sm:max-w-sm grid grid-cols-2 mb-5 sm:mb-6 bg-black/40 border border-white/5 p-1 rounded-xl">
          <TabsTrigger value="kanban" className="flex min-w-0 items-center gap-1 text-xs sm:gap-2 sm:text-sm rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_10px_rgba(191,247,255,0.1)] transition-all">
            <LayoutGrid className="w-4 h-4" />
            Quadro Kanban
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex min-w-0 items-center gap-1 text-xs sm:gap-2 sm:text-sm rounded-lg data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_10px_rgba(191,247,255,0.1)] transition-all">
            <CalendarIcon className="w-4 h-4" />
            Calendário
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="w-full min-w-0 max-w-full overflow-hidden flex-1 min-h-0 mt-0 data-[state=active]:flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
          <KanbanBoard />
        </TabsContent>

        <TabsContent value="calendar" className="flex-1 min-h-0 mt-0 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CalendarView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
