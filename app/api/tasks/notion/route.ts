import { NextRequest, NextResponse } from 'next/server';
import { createNotionTask, updateNotionTaskStatus } from '@/lib/notion';

export async function POST(req: NextRequest) {
  try {
    const task = await req.json();

    if (!task.title) {
      return NextResponse.json({ error: 'O título da tarefa é obrigatório' }, { status: 400 });
    }

    if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
      return NextResponse.json(
        { error: 'Credenciais do Notion não configuradas no servidor' },
        { status: 500 }
      );
    }

    const response = await createNotionTask(task);

    return NextResponse.json({ success: true, data: response });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Desconhecido';
    console.error('Erro na API de integração com Notion:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar para o Notion: ' + message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { notionId, status } = await req.json();

    if (!notionId || !status) {
      return NextResponse.json({ error: 'notionId e status são obrigatórios' }, { status: 400 });
    }

    if (!process.env.NOTION_TOKEN) {
      return NextResponse.json(
        { error: 'Credenciais do Notion não configuradas no servidor' },
        { status: 500 }
      );
    }

    const response = await updateNotionTaskStatus(notionId, status);

    return NextResponse.json({ success: true, data: response });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Desconhecido';
    console.error('Erro na API ao atualizar status no Notion:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar status no Notion: ' + message },
      { status: 500 }
    );
  }
}

