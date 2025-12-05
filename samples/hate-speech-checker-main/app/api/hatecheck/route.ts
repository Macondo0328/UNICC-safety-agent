// app/api/hatecheck/route.ts
import { NextRequest } from 'next/server';
import { generateText } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import { systemPrompt } from '@/lib/ai/prompts';

const MODEL_NAME = 'chat-model';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const inputText = body?.text;

    if (!inputText || typeof inputText !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing "text" in request body' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // 这里用 generateText，而不是 streamText
    const { text: fullText } = await generateText({
      model: myProvider.languageModel(MODEL_NAME),
      system: systemPrompt({ selectedChatModel: MODEL_NAME }),
      prompt: inputText,
      maxSteps: 3,
    });

    return new Response(JSON.stringify({ result: fullText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('hatecheck error', err);

    return new Response(
      JSON.stringify({
        error: String(err?.message ?? err),
        stack: err?.stack ?? null,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
