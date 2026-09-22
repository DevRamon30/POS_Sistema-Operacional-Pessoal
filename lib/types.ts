export interface InboxItem {
  id: string;
  title: string;
  createdAt: string;
  processed: boolean;
}

export type TaskStatus = 'INBOX' | 'NEXT_ACTION' | 'IN_PROGRESS' | 'DONE';

export type EisenhowerQuadrant = 
  | 'URGENTE_IMPORTANTE'
  | 'IMPORTANTE_NAO_URGENTE'
  | 'URGENTE_NAO_IMPORTANTE'
  | 'NENHUM';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  quadrant: EisenhowerQuadrant | null;
  dueDate: string | null;
  projectId: string | null;
  pomodorosEstimated: number;
  pomodorosDone: number;
  aiGenerated: boolean;
  notionId?: string | null;
}

export interface Project {
  id: string;
  name: string;
  dueDate: string | null;
}

export type HabitFrequency = 'DAILY' | 'WEEKLY';

export interface Habit {
  id: string;
  name: string;
  frequency: HabitFrequency;
  completions: string[]; // array de datas ISO
}
