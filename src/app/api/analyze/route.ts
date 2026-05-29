import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { runTenderAnalysis } from '@/lib/analyzer';
import type { TenderInput } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const input: TenderInput = body.input;
    if (!input) return NextResponse.json({ error: 'Input tidak valid' }, { status: 400 });

    const baseResult = runTenderAnalysis(input);

    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (openRouterKey && openRouterKey !== 'your-openrouter-api-key-here') {
      try {
        const aiResult = await enhanceWithAI(input, baseResult, openRouterKey, process.env.NEXTAUTH_URL);
        return NextResponse.json({ result: aiResult });
      } catch { /* fallback to base */ }
    }

    return NextResponse.json({ result: baseResult });
  } catch {
    return NextResponse.json({ error: 'Analisis gagal.' }, { status: 500 });
  }
}

async function enhanceWithAI(input: TenderInput, baseResult: any, apiKey: string, siteUrl?: string) {
  const prompt = `Analis tender Indonesia. Balas HANYA JSON tanpa markdown:
{"strategicSummary":"...","keyWarnings":["..."],"recommendations":["..."],"competitiveAdvantages":["..."]}

Proyek: ${input.projectName}, Nilai: Rp ${(input.projectValue/1e9).toFixed(1)}M, Margin: ${baseResult.marginPercentage.toFixed(1)}%, Win: ${baseResult.winProbability}%`;

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'HTTP-Referer': siteUrl || '' },
    body: JSON.stringify({ model: 'anthropic/claude-3-haiku', messages: [{ role: 'user', content: prompt }], max_tokens: 500 }),
  });

  if (!res.ok) throw new Error('AI fail');
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Bad format');
  const ai = JSON.parse(match[0]);
  return { ...baseResult, ...ai };
}
