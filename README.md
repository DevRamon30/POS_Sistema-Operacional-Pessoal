# POS - Sistema Operacional Pessoal

Um aplicativo web pessoal de produtividade e gestão do tempo que unifica os métodos GTD, Matriz de Eisenhower e Pomodoro, assistido por Inteligência Artificial (Google Gemini) para facilitar o destravamento de tarefas, priorização e revisão semanal.

## 🚀 Stack Utilizado

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS + shadcn/ui
- **Gerenciamento de Estado**: Zustand (com persistência via localStorage, sem necessidade de banco de dados externo)
- **Gráficos**: Recharts
- **IA**: API do Google Gemini (gemini-2.5-flash) via SDK oficial `@google/genai`

## 🧠 Fluxo de Organização

O sistema foi desenhado para seguir um fluxo lógico e eficiente de produtividade:

1. **GTD (Caixa de Entrada & Tarefas)**:
   - Capture ideias rapidamente na Caixa de Entrada.
   - Use a IA para **Quebrar Tarefas** muito amplas em passos acionáveis.
   - Processe as tarefas movendo-as para Próxima Ação ou Agendado.

2. **Matriz de Eisenhower**:
   - Classifique as tarefas por urgência e importância. A IA pode sugerir a **Classificação do Quadrante** com base no título, descrição e prazo.

3. **Pomodoro (Foco)**:
   - Execute suas tarefas usando o **Timer Pomodoro** embutido (25m de foco / 5m de pausa).
   - O esforço é contabilizado e visualizado no Dashboard comparando pomodoros estimados vs. realizados.

4. **Dashboard & Revisão (IA)**:
   - Acompanhe a sua taxa de conclusão, consistência de hábitos e progresso de projetos.
   - Gere uma **Revisão Semanal com IA**, que analisa os indicadores da semana e fornece feedback construtivo.

## ⚙️ Instalação e Execução Local

Siga os passos abaixo para rodar o projeto na sua máquina:

1. **Clone o repositório** e acesse a pasta do projeto.
2. **Instale as dependências**:
   ```bash
   npm install
   ```
3. **Configure as Variáveis de Ambiente**:
   Crie um arquivo `.env.local` na raiz do projeto e adicione sua chave de API do Gemini:
   ```env
   GEMINI_API_KEY=sua_chave_de_api_aqui
   ```
   *(Importante: nunca commite este arquivo ou exponha sua chave)*
4. **Rode o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```
5. Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📖 Como Utilizar a Solução (Passo a Passo)

1. **Caixa de Entrada**: Comece jogando tudo o que precisa fazer na caixa de entrada. Se a tarefa for complexa, clique no botão para usar a IA e quebrar a tarefa em subtarefas menores.
2. **Classificação e Priorização**: Ao processar a tarefa, use a sugestão de classificação da IA para definir o quadrante da Matriz de Eisenhower. Defina um prazo e estime quantos pomodoros vai levar.
3. **Gerencie as Tarefas**: Na aba "Tarefas", você pode usar o quadro Kanban para mover o status das tarefas ou visualizar a grade do Calendário para organizar sua semana.
4. **Projetos e Hábitos**: Crie Projetos maiores para agrupar tarefas (o progresso aumenta conforme as tarefas são marcadas como concluídas) e defina Hábitos (diários ou semanais) marcando o checklist para criar uma sequência (*streak*).
5. **Timer Pomodoro**: Ao iniciar o trabalho focado, abra o painel flutuante de Pomodoro (canto inferior direito), vincule a tarefa atual e inicie o cronômetro.
6. **Revisão Semanal**: No final da semana, vá até o "Dashboard" para visualizar seus gráficos e clique em "Gerar Revisão" para receber um resumo gerado pela IA com seus pontos fortes, fracos e sugestões de melhoria para a próxima semana.

---
Desenvolvido como projeto prático para a disciplina de Produtividade e Gestão do Tempo.
