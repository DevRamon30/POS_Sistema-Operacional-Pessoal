'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useStore } from '@/lib/store';
import { TaskStatus } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { QUADRANT_COLORS, STATUS_LABELS } from './constants';
import { CalendarIcon, Clock, Play, CheckCircle2 } from 'lucide-react';
import { parseLocalTaskDate } from '@/lib/task-schedule';

const COLUMNS: TaskStatus[] = ['INBOX', 'NEXT_ACTION', 'IN_PROGRESS', 'DONE'];

export function KanbanBoard() {
  const [isMounted, setIsMounted] = useState(false);
  const tasks = useStore((state) => state.tasks);
  const moveTaskStatus = useStore((state) => state.moveTaskStatus);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    moveTaskStatus(draggableId, destination.droppableId as TaskStatus);
  };

  if (!isMounted) return null;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-6 h-full overflow-x-auto pb-4 custom-scrollbar">
        {COLUMNS.map((statusId, colIndex) => {
          const columnTasks = tasks.filter((t) => t.status === statusId);

          return (
            <div key={statusId} className="flex-shrink-0 w-80 flex flex-col bg-background/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl animate-in fade-in duration-700" style={{ animationDelay: `${colIndex * 100}ms` }}>
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5 rounded-t-2xl">
                <h3 className="font-bold text-white tracking-wide">{STATUS_LABELS[statusId]}</h3>
                <span className="bg-black/40 text-slate-300 text-xs px-2.5 py-1 rounded-full border border-white/10 shadow-inner">
                  {columnTasks.length}
                </span>
              </div>
              
              <Droppable droppableId={statusId}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-3 space-y-3 min-h-[150px] transition-colors rounded-b-2xl ${
                      snapshot.isDraggingOver ? 'bg-primary/10 shadow-[inset_0_0_20px_rgba(191,247,255,0.1)]' : ''
                    }`}
                  >
                    {columnTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-background/80 backdrop-blur-sm border-white/10 transition-shadow ${
                              snapshot.isDragging ? 'shadow-[0_0_25px_rgba(191,247,255,0.4)] ring-2 ring-primary z-50' : 'shadow-md hover:border-primary/50 hover:shadow-[0_0_15px_rgba(191,247,255,0.2)]'
                            }`}
                          >
                            <CardContent className="p-4">
                              <div className="flex flex-col gap-3">
                                <div className="flex items-start justify-between gap-2 group/title">
                                  <h4 className="font-medium text-white leading-snug flex-1">{task.title}</h4>
                                  <div className="flex items-center opacity-0 group-hover/title:opacity-100 transition-opacity -mt-1 -mr-1">
                                    {statusId !== 'IN_PROGRESS' && statusId !== 'DONE' && (
                                      <button 
                                        onClick={() => moveTaskStatus(task.id, 'IN_PROGRESS')} 
                                        className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-primary transition-colors" 
                                        title="Mover para Em Andamento"
                                      >
                                        <Play className="w-4 h-4" />
                                      </button>
                                    )}
                                    {statusId !== 'DONE' && (
                                      <button 
                                        onClick={() => moveTaskStatus(task.id, 'DONE')} 
                                        className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-green-400 transition-colors" 
                                        title="Concluir"
                                      >
                                        <CheckCircle2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-2">
                                  {task.quadrant && task.quadrant !== 'NENHUM' && (
                                    <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider bg-black/40 border-white/10 shadow-inner ${QUADRANT_COLORS[task.quadrant]}`}>
                                      {task.quadrant.replace(/_/g, ' ')}
                                    </Badge>
                                  )}
                                  
                                  {task.dueDate && (
                                    <Badge variant="outline" className="text-slate-300 bg-black/40 border-white/10 text-[10px] hover:bg-black/60 shadow-inner">
                                      <CalendarIcon className="w-3 h-3 mr-1 text-secondary" />
                                      {format(parseLocalTaskDate(task.dueDate), "dd MMM", { locale: ptBR })}
                                    </Badge>
                                  )}

                                  {task.pomodorosEstimated > 0 && (
                                    <Badge variant="outline" className="text-slate-300 bg-black/40 border-white/10 text-[10px] hover:bg-black/60 shadow-inner">
                                      <Clock className="w-3 h-3 mr-1 text-primary" />
                                      {task.pomodorosDone}/{task.pomodorosEstimated}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
