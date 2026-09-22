import { TaskStatus, EisenhowerQuadrant } from '@/lib/types';

export const QUADRANT_COLORS: Record<EisenhowerQuadrant, string> = {
  URGENTE_IMPORTANTE: 'bg-red-500/20 text-red-400 border-red-500/30',
  IMPORTANTE_NAO_URGENTE: 'bg-secondary/20 text-secondary border-secondary/30',
  URGENTE_NAO_IMPORTANTE: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  NENHUM: 'bg-white/10 text-slate-300 border-white/10',
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  INBOX: 'Inbox',
  NEXT_ACTION: 'Próxima Ação',
  IN_PROGRESS: 'Em Andamento',
  DONE: 'Concluído',
};
