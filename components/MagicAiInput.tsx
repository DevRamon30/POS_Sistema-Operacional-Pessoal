'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/lib/store';

export function MagicAiInput() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { addTask } = useStore();

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setSuccess(false);

    try {
      // 1. Processar texto com IA
      const aiRes = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'parse-task', payload: text }),
      });
      
      const aiData = await aiRes.json();
      if (!aiRes.ok) throw new Error(aiData.error || 'Erro na IA');

      const taskData = aiData.result;
      
      // 2. Salvar no Notion
      const notionRes = await fetch('/api/tasks/notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      let notionId: string | null = null;
      if (notionRes.ok) {
        const notionData = await notionRes.json();
        notionId = notionData?.data?.id || null;
      } else {
        console.warn('Falha ao salvar no Notion, mas continuaremos localmente.');
      }

      // 3. Salvar localmente (Zustand)
      addTask({
        title: taskData.title || text,
        status: 'NEXT_ACTION',
        quadrant: taskData.priority === 'ALTA' ? 'URGENTE_IMPORTANTE' : 'IMPORTANTE_NAO_URGENTE', // mapeamento básico
        dueDate: taskData.date || null,
        projectId: null,
        pomodorosEstimated: 1,
        pomodorosDone: 0,
        aiGenerated: true,
        notionId,
      });

      setSuccess(true);
      setText('');
      
      // Limpar estado de sucesso após 3s
      setTimeout(() => setSuccess(false), 3000);

    } catch (error) {
      console.error('Erro no Magic Input:', error);
      alert('Erro ao processar tarefa. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleProcess} className="relative w-full max-w-2xl mb-8 group">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
      <div className="relative flex items-center bg-black/60 border border-white/10 rounded-xl p-1 shadow-2xl backdrop-blur-sm">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ex: Reunião do projeto POS sexta-feira às 14:00..."
          className="flex-1 border-0 bg-transparent text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
          disabled={loading || success}
        />
        <Button 
          type="submit" 
          disabled={loading || success || !text.trim()} 
          className="ml-2 bg-white/10 hover:bg-white/20 text-white border-0"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          ) : success ? (
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2 text-primary" />
              Processar IA
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
