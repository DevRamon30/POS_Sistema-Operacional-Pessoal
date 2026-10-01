'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Plus, Inbox as InboxIcon } from 'lucide-react';
import { ProcessItemModal } from './components/ProcessItemModal';
import { InboxItem } from '@/lib/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function InboxPage() {
  const [inputValue, setInputValue] = useState('');
  const [selectedItem, setSelectedItem] = useState<InboxItem | null>(null);
  
  const inboxItems = useStore(state => state.inboxItems);
  const addInboxItem = useStore(state => state.addInboxItem);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    addInboxItem(inputValue.trim());
    setInputValue('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto min-h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="p-3 bg-primary/20 text-primary rounded-xl shadow-[0_0_15px_rgba(191,247,255,0.2)]">
          <InboxIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-sm">Caixa de Entrada</h1>
          <p className="text-sm sm:text-base text-slate-400 mt-1">Capture tudo o que está chamando sua atenção.</p>
        </div>
      </div>

      <Card className="mb-8 border-white/10 bg-background/40 backdrop-blur-md shadow-lg">
        <CardContent className="p-4 sm:pt-6">
          <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="O que está na sua mente?"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 text-lg py-6 bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-primary/50"
              autoFocus
            />
            <Button type="submit" size="lg" className="w-full px-8 py-6 bg-primary hover:bg-primary/80 text-slate-900 font-bold shadow-[0_0_15px_rgba(191,247,255,0.3)] transition-all hover:scale-[1.02] sm:w-auto">
              <Plus className="w-5 h-5 mr-2" />
              Adicionar
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4 flex-1">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          Itens não processados 
          <span className="bg-white/10 text-slate-300 px-2.5 py-0.5 rounded-full text-xs border border-white/5">
            {inboxItems.length}
          </span>
        </h2>
        
        {inboxItems.length === 0 ? (
          <div className="text-center py-12 bg-background/40 backdrop-blur-sm rounded-xl border border-dashed border-white/20 text-slate-500">
            Sua caixa de entrada está vazia. Tudo limpo!
          </div>
        ) : (
          <div className="grid gap-3">
            {inboxItems.map((item, i) => (
              <div 
                key={item.id} 
                className="group flex flex-col items-stretch gap-3 p-4 bg-background/40 backdrop-blur-md border border-white/5 rounded-xl hover:border-primary/30 hover:bg-white/5 hover:shadow-[0_0_20px_rgba(191,247,255,0.05)] transition-all animate-in slide-in-from-bottom-4 fill-mode-both sm:flex-row sm:items-center sm:justify-between"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div>
                  <h3 className="font-medium text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Adicionado em: {format(new Date(item.createdAt), "dd 'de' MMM, HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full text-primary border-primary/30 bg-transparent hover:bg-primary/20 hover:text-primary transition-colors sm:w-auto"
                  onClick={() => setSelectedItem(item)}
                >
                  <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                  Processar com IA
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProcessItemModal 
        item={selectedItem} 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />
    </div>
  );
}
