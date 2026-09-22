'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { 
  FolderGit2, Plus, Calendar, Trash2, CheckCircle2, Play, 
  Layers, ArrowRight, X, Edit2, Check
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Project, EisenhowerQuadrant } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

export default function ProjectsPage() {
  const projects = useStore((state) => state.projects);
  const tasks = useStore((state) => state.tasks);
  const addProject = useStore((state) => state.addProject);
  const updateProject = useStore((state) => state.updateProject);
  const removeProject = useStore((state) => state.removeProject);
  const addTask = useStore((state) => state.addTask);
  const moveTaskStatus = useStore((state) => state.moveTaskStatus);
  const removeTask = useStore((state) => state.removeTask);

  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDate, setNewProjectDate] = useState('');

  // Estado do projeto selecionado para detalhamento
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDate, setEditDate] = useState('');

  // Estado para nova tarefa dentro do projeto
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskQuadrant, setNewTaskQuadrant] = useState<EisenhowerQuadrant>('IMPORTANTE_NAO_URGENTE');

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    addProject(newProjectName.trim(), newProjectDate || null);
    setNewProjectName('');
    setNewProjectDate('');
  };

  const handleDeleteProject = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir este projeto?')) {
      removeProject(id);
      if (selectedProject?.id === id) {
        setSelectedProject(null);
      }
    }
  };

  const handleSaveEditProject = () => {
    if (!selectedProject || !editName.trim()) return;
    updateProject(selectedProject.id, {
      name: editName.trim(),
      dueDate: editDate || null
    });
    setSelectedProject({
      ...selectedProject,
      name: editName.trim(),
      dueDate: editDate || null
    });
    setIsEditingProject(false);
  };

  const handleAddTaskToProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newTaskTitle.trim()) return;

    addTask({
      title: newTaskTitle.trim(),
      status: 'NEXT_ACTION',
      quadrant: newTaskQuadrant,
      dueDate: selectedProject.dueDate || null,
      projectId: selectedProject.id,
      pomodorosEstimated: 1,
      pomodorosDone: 0,
      aiGenerated: false,
    });

    setNewTaskTitle('');
  };

  const getProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    if (projectTasks.length === 0) return { done: 0, total: 0, percentage: 0 };
    
    const doneTasks = projectTasks.filter(t => t.status === 'DONE').length;
    const percentage = Math.round((doneTasks / projectTasks.length) * 100);
    
    return { done: doneTasks, total: projectTasks.length, percentage };
  };

  const formatDateSafe = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    try {
      const datePart = dateStr.split('T')[0];
      const parts = datePart.split('-').map(Number);
      if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
        return dateStr;
      }
      const parsed = new Date(parts[0], parts[1] - 1, parts[2]);
      if (isNaN(parsed.getTime())) return dateStr;
      return format(parsed, "dd 'de' MMMM, yyyy", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const projectTasks = selectedProject ? tasks.filter(t => t.projectId === selectedProject.id) : [];

  return (
    <div className="p-8 h-full flex flex-col animate-in fade-in duration-500 overflow-y-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/20 text-primary rounded-xl shadow-[0_0_15px_rgba(191,247,255,0.2)]">
          <FolderGit2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white drop-shadow-sm">Projetos</h1>
          <p className="text-slate-400 mt-1">Gerencie missões, defina metas e acompanhe seu progresso.</p>
        </div>
      </div>

      {/* Formulário de Novo Projeto */}
      <div className="mb-8">
        <form onSubmit={handleAddProject} className="flex flex-wrap md:flex-nowrap gap-4 items-end p-6 rounded-2xl bg-background/40 backdrop-blur-md border border-white/10 shadow-lg">
          <div className="flex-1 min-w-[200px] space-y-2">
            <label className="text-sm font-medium text-slate-300">Nome do Projeto</label>
            <Input 
              value={newProjectName} 
              onChange={e => setNewProjectName(e.target.value)} 
              placeholder="Ex: Lançar MVP da Plataforma" 
              className="bg-black/20 border-white/10 text-white focus-visible:ring-primary/50 placeholder:text-slate-500"
            />
          </div>
          <div className="w-full md:w-48 space-y-2">
            <label className="text-sm font-medium text-slate-300">Prazo Estimado</label>
            <Input 
              type="date"
              value={newProjectDate} 
              onChange={e => setNewProjectDate(e.target.value)} 
              className="bg-black/20 border-white/10 text-white focus-visible:ring-primary/50 [color-scheme:dark]"
            />
          </div>
          <Button type="submit" disabled={!newProjectName.trim()} className="gap-2 bg-primary hover:bg-primary/90 text-slate-900 font-bold shadow-[0_0_15px_rgba(191,247,255,0.3)] transition-all hover:scale-105">
            <Plus className="w-5 h-5" /> Iniciar Projeto
          </Button>
        </form>
      </div>

      {/* Grid de Cards de Projetos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, i) => {
          const progress = getProjectProgress(project.id);
          const formattedDate = formatDateSafe(project.dueDate);
          
          return (
            <Card 
              key={project.id} 
              onClick={() => {
                setSelectedProject(project);
                setEditName(project.name);
                setEditDate(project.dueDate || '');
                setIsEditingProject(false);
              }}
              className="flex flex-col border border-white/10 bg-background/40 backdrop-blur-md hover:border-primary/50 hover:bg-white/5 transition-all shadow-lg animate-in zoom-in-95 fill-mode-both group cursor-pointer relative overflow-hidden" 
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg text-white font-bold group-hover:text-primary transition-colors flex-1">
                    {project.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteProject(project.id, e)}
                    className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 -mt-1 -mr-2 transition-colors"
                    title="Excluir Projeto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {formattedDate && (
                  <CardDescription className="flex items-center gap-2 mt-1 text-slate-400">
                    <Calendar className="w-4 h-4 text-secondary" />
                    {formattedDate}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="flex-1 flex flex-col justify-end pt-2">
                <div className="mt-auto pt-4 border-t border-white/5">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-primary" />
                      {progress.done}/{progress.total} tarefas
                    </span>
                    <span className="font-bold text-white">
                      {progress.percentage}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 ease-out rounded-full group-hover:shadow-[0_0_10px_rgba(191,247,255,0.8)]"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
                  <span>Gerenciar Módulos</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          );
        })}

        {projects.length === 0 && (
          <div className="col-span-full text-center py-16 text-slate-400 border border-dashed border-white/20 rounded-2xl bg-background/40 backdrop-blur-md">
            Nenhum projeto ativo. Inicie uma nova missão no formulário acima.
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Projeto */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-background/95 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 text-white">
            
            {/* Header do Modal */}
            <div className="p-6 border-b border-white/10 flex items-start justify-between bg-white/5">
              <div className="flex-1 pr-4">
                {isEditingProject ? (
                  <div className="space-y-3">
                    <Input 
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="bg-black/40 border-white/20 text-lg font-bold text-white"
                      placeholder="Nome do Projeto"
                    />
                    <div className="flex items-center gap-3">
                      <Input 
                        type="date"
                        value={editDate}
                        onChange={e => setEditDate(e.target.value)}
                        className="bg-black/40 border-white/20 text-xs text-white w-48 [color-scheme:dark]"
                      />
                      <Button size="sm" onClick={handleSaveEditProject} className="bg-primary text-slate-900 font-bold gap-1">
                        <Check className="w-4 h-4" /> Salvar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setIsEditingProject(false)} className="text-slate-400">
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-white">{selectedProject.name}</h2>
                      <button 
                        onClick={() => setIsEditingProject(true)}
                        className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors"
                        title="Editar Projeto"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                    {selectedProject.dueDate && (
                      <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-secondary" />
                        Prazo: {formatDateSafe(selectedProject.dueDate)}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDeleteProject(selectedProject.id)} 
                  className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                  title="Excluir Projeto"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSelectedProject(null)} 
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Barra de Progresso no Modal */}
            <div className="px-6 py-4 bg-black/20 border-b border-white/5">
              {(() => {
                const prog = getProjectProgress(selectedProject.id);
                return (
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
                      <span>Progresso do Projeto</span>
                      <span className="font-bold text-primary">{prog.done} de {prog.total} tarefas concluídas ({prog.percentage}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-700 rounded-full"
                        style={{ width: `${prog.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Conteúdo do Modal - Adicionar Tarefa & Lista de Tarefas */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
              
              {/* Form Adicionar Tarefa no Projeto */}
              <form onSubmit={handleAddTaskToProject} className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary" />
                  Adicionar Nova Tarefa a este Projeto
                </h4>
                <div className="flex gap-3">
                  <Input 
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    placeholder="Nome da tarefa / módulo..."
                    className="flex-1 bg-black/30 border-white/10 text-white focus-visible:ring-primary/50"
                  />
                  <select 
                    value={newTaskQuadrant}
                    onChange={e => setNewTaskQuadrant(e.target.value as EisenhowerQuadrant)}
                    className="bg-black/30 border border-white/10 text-xs text-white rounded-md px-3 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  >
                    <option value="URGENTE_IMPORTANTE" className="bg-slate-900">Faça Agora (Urgente & Importante)</option>
                    <option value="IMPORTANTE_NAO_URGENTE" className="bg-slate-900">Agende (Importante)</option>
                    <option value="URGENTE_NAO_IMPORTANTE" className="bg-slate-900">Delegue (Urgente)</option>
                    <option value="NENHUM" className="bg-slate-900">Sem Classificação</option>
                  </select>
                  <Button type="submit" disabled={!newTaskTitle.trim()} className="bg-primary hover:bg-primary/90 text-slate-900 font-bold">
                    Adicionar
                  </Button>
                </div>
              </form>

              {/* Lista de Tarefas do Projeto */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">Tarefas Vinculadas ({projectTasks.length})</h4>
                
                {projectTasks.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 border border-dashed border-white/10 rounded-xl">
                    Nenhuma tarefa vinculada a este projeto ainda. Adicione acima!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {projectTasks.map((t) => (
                      <div 
                        key={t.id} 
                        className="flex items-center justify-between p-3.5 bg-black/30 border border-white/5 rounded-xl hover:border-white/15 transition-all group"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <button
                            onClick={() => moveTaskStatus(t.id, t.status === 'DONE' ? 'NEXT_ACTION' : 'DONE')}
                            className={`p-1 rounded-full transition-colors ${t.status === 'DONE' ? 'text-green-400 hover:text-slate-400' : 'text-slate-500 hover:text-green-400'}`}
                            title={t.status === 'DONE' ? 'Marcar como pendente' : 'Marcar como concluída'}
                          >
                            <CheckCircle2 className={`w-5 h-5 ${t.status === 'DONE' ? 'fill-green-400/20' : ''}`} />
                          </button>
                          
                          <span className={`text-sm font-medium ${t.status === 'DONE' ? 'line-through text-slate-500' : 'text-white'}`}>
                            {t.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] bg-black/40 border-white/10 text-slate-300">
                            {t.status === 'DONE' ? 'Concluído' : t.status === 'IN_PROGRESS' ? 'Em Andamento' : 'Próxima Ação'}
                          </Badge>

                          {t.status !== 'IN_PROGRESS' && t.status !== 'DONE' && (
                            <button
                              onClick={() => moveTaskStatus(t.id, 'IN_PROGRESS')}
                              className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-primary transition-colors"
                              title="Iniciar (Em Andamento)"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => removeTask(t.id)}
                            className="p-1 hover:bg-white/10 rounded text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                            title="Remover tarefa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer do Modal */}
            <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end">
              <Button onClick={() => setSelectedProject(null)} className="bg-white/10 hover:bg-white/20 text-white">
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
