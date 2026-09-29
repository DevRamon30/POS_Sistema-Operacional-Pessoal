import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { PROMPTS } from '@/lib/ai-prompts';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { mode, payload } = await req.json();

    if (!mode || !['breakdown', 'classify', 'weekly-review', 'parse-task'].includes(mode)) {
      return NextResponse.json({ error: 'Modo inválido' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Chave de API não configurada' }, { status: 500 });
    }

    const systemPrompt = PROMPTS[mode as keyof typeof PROMPTS];
    const userMessage = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const currentDateContext = mode === 'parse-task'
      ? `\n\nData atual (America/Fortaleza): ${new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Fortaleza' }).format(new Date())}`
      : '';
    const fullPrompt = `${systemPrompt}${currentDateContext}\n\nDados:\n${userMessage}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: fullPrompt,
    });

    const text = response.text || '';

    if (mode === 'weekly-review') {
      return NextResponse.json({ result: text });
    }

    // Para breakdown e classify, precisamos fazer parse do JSON
    try {
      // Remover possíveis marcadores de markdown (```json e ```)
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanText);
      return NextResponse.json({ result: parsed });
    } catch {
      console.error('Erro no parse do JSON da IA:', text);
      return NextResponse.json({ error: 'Resposta inválida da IA', rawResult: text }, { status: 502 });
    }

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Desconhecido';
    console.error('Erro na API de IA:', error);
    return NextResponse.json({ error: 'Erro ao processar requisição: ' + message }, { status: 500 });
  }
}
