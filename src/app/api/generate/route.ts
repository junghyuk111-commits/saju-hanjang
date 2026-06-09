import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { nanoid } from 'nanoid';
import { calculateSaju } from '@/lib/saju';
import { buildSystemPrompt, buildUserPrompt, parseSections } from '@/lib/prompt';
import { saveResult } from '@/lib/kv';

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, gender, birthDate, birthTime, question, product } = body;

  const [year, month, day] = birthDate.split('-').map(Number);
  const sajuData = calculateSaju(year, month, day, birthTime || null, gender);

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_KEY });
  const id = nanoid(10);

  const encoder = new TextEncoder();
  let fullText = '';

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 32000,
          system: buildSystemPrompt(),
          messages: [
            {
              role: 'user',
              content: buildUserPrompt(name, gender, birthDate, birthTime, question, product, sajuData),
            },
          ],
          stream: true,
        });

        for await (const event of response) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            const text = event.delta.text;
            fullText += text;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', text })}\n\n`));
          }
        }

        const sections = parseSections(fullText);
        const resultData = {
          id,
          createdAt: new Date().toISOString(),
          name,
          gender,
          birthDate,
          birthTime: birthTime || null,
          question: question || null,
          product,
          sajuData,
          result: fullText,
          sections,
        };

        await saveResult(resultData);

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', id })}\n\n`));
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
