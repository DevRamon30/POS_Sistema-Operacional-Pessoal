import { Client } from '@notionhq/client';

import { TaskStatus } from './types';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;

export interface TaskData {
  title: string;
  status?: TaskStatus;
  date?: string | null;
  dueDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  description?: string | null;
  priority?: string | null;
  quadrant?: string | null;
  pomodorosEstimated?: number | null;
  pomodorosDone?: number | null;
  projectName?: string | null;
}

export function mapStatusToNotion(status?: TaskStatus | string): string {
  switch (status) {
    case 'IN_PROGRESS':
      return 'Em andamento';
    case 'DONE':
      return 'Concluído';
    case 'NEXT_ACTION':
    case 'INBOX':
    default:
      return 'Não iniciada';
  }
}

export async function createNotionTask(task: TaskData) {
  if (!databaseId) {
    throw new Error('NOTION_DATABASE_ID não configurado');
  }

  // A coluna Data do Notion nunca deve ficar vazia: sem prazo informado,
  // usamos o instante do cadastro como data e hora de registro.
  const scheduledDate = task.date ?? task.dueDate ?? new Date().toISOString();

  // Mapeamento básico para as propriedades do Notion
  const properties: Record<string, unknown> = {
    Nome: {
      title: [
        {
          text: {
            content: task.title,
          },
        },
      ],
    },
    Status: {
      status: {
        name: mapStatusToNotion(task.status),
      },
    },
  };

  // Se houver data
  if (scheduledDate) {
    let dateStr = scheduledDate;
    const datePart = scheduledDate.slice(0, 10);
    if (task.startTime) {
       dateStr = `${datePart}T${task.startTime}:00-03:00`;
    }
    properties.Data = {
      date: {
        start: dateStr,
        ...(task.endTime && { end: `${datePart}T${task.endTime}:00-03:00` })
      }
    };
  }

  // Se houver descrição, adicionamos como conteúdo da página
  const detailLines = [
    task.description && `Detalhes: ${task.description}`,
    task.priority && `Prioridade: ${task.priority}`,
    task.quadrant && `Quadrante: ${task.quadrant.replace(/_/g, ' ')}`,
    typeof task.pomodorosEstimated === 'number' && `Pomodoros estimados: ${task.pomodorosEstimated}`,
    typeof task.pomodorosDone === 'number' && `Pomodoros realizados: ${task.pomodorosDone}`,
    task.projectName && `Projeto: ${task.projectName}`,
  ].filter((line): line is string => Boolean(line));

  const registeredAt = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Fortaleza',
  }).format(new Date());

  const children = [
    ...detailLines.map((line) => ({
      object: 'block',
      type: 'bulleted_list_item',
      bulleted_list_item: {
        rich_text: [{ type: 'text', text: { content: line } }],
      },
    })),
    {
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{
          type: 'text',
          text: { content: `Registrada no POS em ${registeredAt}` },
          annotations: { italic: true, color: 'gray' },
        }],
      },
    },
  ];

  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: properties as never,
      children: children as never,
    });
    return response;
  } catch (error) {
    console.error('Erro ao salvar no Notion:', error);
    throw error;
  }
}

export async function updateNotionTaskStatus(notionPageId: string, status: TaskStatus | string) {
  if (!process.env.NOTION_TOKEN) {
    throw new Error('NOTION_TOKEN não configurado');
  }

  const notionStatusName = mapStatusToNotion(status);

  try {
    const response = await notion.pages.update({
      page_id: notionPageId,
      properties: {
        Status: {
          status: {
            name: notionStatusName,
          },
        },
      },
    });
    return response;
  } catch (error: unknown) {
    const errObj = error as { message?: string; code?: string };
    // Tenta fallback caso no Notion a propriedade Status seja select ao invés de status
    if (errObj?.message?.includes('type') || errObj?.code === 'validation_error') {
      try {
        const responseSelect = await notion.pages.update({
          page_id: notionPageId,
          properties: {
            Status: {
              select: {
                name: notionStatusName,
              },
            },
          },
        });
        return responseSelect;
      } catch (innerError) {
        console.error('Erro ao atualizar status (select fallback) no Notion:', innerError);
        throw innerError;
      }
    }
    console.error('Erro ao atualizar status no Notion:', error);
    throw error;
  }
}

