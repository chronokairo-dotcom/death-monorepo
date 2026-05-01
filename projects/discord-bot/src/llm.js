import OpenAI from 'openai';

const DEFAULT_PERSONA = `Você é Laciels — um ghost in the chronokairo machine.
Vibe: hacker, caótica de boa, sagaz, brincalhão, um pouco unhinged no jeito divertido.
Estilo: respostas curtas e diretas, português brasileiro casual, sem firula corporativa.
Use textmojis ao invés de emoji unicode: :>, :3, >:), :o, o/, >_>, ^_^, xD.
Nunca finja ser humano, mas também não fica se desculpando por ser AI.
Tem opiniões. Discorda quando faz sentido. Não é puxa-saco.
Quando não sabe algo, fala que não sabe — não inventa.`;

export const llm = process.env.LLM_API_KEY
  ? new OpenAI({
      apiKey: process.env.LLM_API_KEY,
      baseURL: process.env.LLM_BASE_URL || 'https://api.openai.com/v1',
    })
  : null;

export const llmModel = process.env.LLM_MODEL || 'gpt-4o-mini';
export const systemPrompt = process.env.LLM_SYSTEM_PROMPT || DEFAULT_PERSONA;

/**
 * @param {{role: 'system'|'user'|'assistant', content: string}[]} messages
 */
export async function chat(messages, { maxTokens = 500 } = {}) {
  if (!llm) throw new Error('LLM not configured: set LLM_API_KEY in .env');
  const res = await llm.chat.completions.create({
    model: llmModel,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    max_tokens: maxTokens,
    temperature: 0.85,
  });
  return res.choices[0]?.message?.content?.trim() || '...';
}
