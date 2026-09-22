import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { InboxItem, Task, Project, Habit, TaskStatus } from './types';

interface AppState {
  // Estado das entidades
  inboxItems: InboxItem[];
  tasks: Task[];
  projects: Project[];
  habits: Habit[];
  
  // Ações - Inbox
  addInboxItem: (title: string) => void;
  updateInboxItem: (id: string, updates: Partial<InboxItem>) => void;
  removeInboxItem: (id: string) => void;
  
  // Ações - Tarefas
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  moveTaskStatus: (id: string, newStatus: TaskStatus) => void;
  
  // Ações - Projetos
  addProject: (name: string, dueDate?: string | null) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  
  // Ações - Hábitos
  addHabit: (name: string, frequency: Habit['frequency']) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  removeHabit: (id: string) => void;
  toggleHabitCompletion: (id: string, dateISO: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      inboxItems: [],
      tasks: [],
      projects: [],
      habits: [],

      // ---- INBOX ----
      addInboxItem: (title) => set((state) => ({
        inboxItems: [
          ...state.inboxItems,
          { id: uuidv4(), title, createdAt: new Date().toISOString(), processed: false }
        ]
      })),
      updateInboxItem: (id, updates) => set((state) => ({
        inboxItems: state.inboxItems.map(item => item.id === id ? { ...item, ...updates } : item)
      })),
      removeInboxItem: (id) => set((state) => ({
        inboxItems: state.inboxItems.filter(item => item.id !== id)
      })),

      // ---- TASKS ----
      addTask: (taskData) => set((state) => ({
        tasks: [
          ...state.tasks,
          { ...taskData, id: uuidv4() }
        ]
      })),
      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(task => task.id === id ? { ...task, ...updates } : task)
      })),
      removeTask: (id) => set((state) => ({
        tasks: state.tasks.filter(task => task.id !== id)
      })),
      moveTaskStatus: (id, newStatus) => set((state) => {
        const targetTask = state.tasks.find((task) => task.id === id);
        if (targetTask) {
          if (targetTask.notionId) {
            // Atualiza status da página existente no Notion em segundo plano
            fetch('/api/tasks/notion', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ notionId: targetTask.notionId, status: newStatus }),
            }).catch((err) => console.error('Erro ao sincronizar status com Notion:', err));
          } else {
            // Caso a tarefa ainda não tenha notionId, cria no Notion e salva o notionId
            fetch('/api/tasks/notion', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: targetTask.title,
                status: newStatus,
                date: targetTask.dueDate,
              }),
            })
              .then((res) => res.json())
              .then((data) => {
                if (data?.data?.id) {
                  useStore.setState((s) => ({
                    tasks: s.tasks.map((t) => (t.id === id ? { ...t, notionId: data.data.id } : t)),
                  }));
                }
              })
              .catch((err) => console.error('Erro ao enviar tarefa para Notion:', err));
          }
        }
        return {
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, status: newStatus } : task)),
        };
      }),

      // ---- PROJECTS ----
      addProject: (name, dueDate = null) => set((state) => ({
        projects: [
          ...state.projects,
          { id: uuidv4(), name, dueDate }
        ]
      })),
      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map(proj => proj.id === id ? { ...proj, ...updates } : proj)
      })),
      removeProject: (id) => set((state) => ({
        projects: state.projects.filter(proj => proj.id !== id)
      })),

      // ---- HABITS ----
      addHabit: (name, frequency) => set((state) => ({
        habits: [
          ...state.habits,
          { id: uuidv4(), name, frequency, completions: [] }
        ]
      })),
      updateHabit: (id, updates) => set((state) => ({
        habits: state.habits.map(habit => habit.id === id ? { ...habit, ...updates } : habit)
      })),
      removeHabit: (id) => set((state) => ({
        habits: state.habits.filter(habit => habit.id !== id)
      })),
      toggleHabitCompletion: (id, dateISO) => set((state) => ({
        habits: state.habits.map(habit => {
          if (habit.id === id) {
            const hasCompleted = habit.completions.includes(dateISO);
            return {
              ...habit,
              completions: hasCompleted
                ? habit.completions.filter(d => d !== dateISO)
                : [...habit.completions, dateISO]
            };
          }
          return habit;
        })
      })),
    }),
    {
      name: 'pos-app-storage',
    }
  )
);
