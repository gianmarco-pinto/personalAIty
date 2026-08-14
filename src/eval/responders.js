// Responders: administer the inventory to an agent and return {itemId: rating}.
//   - perfect:    deterministic, no LLM (validates the pipeline; see score.js)
//   - anthropic:  real — runs Claude via the Anthropic SDK
//   - openrouter: real — runs any model via OpenRouter's OpenAI-compatible API
// Item order is shuffled per run (seeded, reproducible) to reduce position bias.
import { ITEMS, SCALE } from './inventory.js';
import { perfectAnswers } from './score.js';
import { seededShuffle } from './rng.js';

export function perfectResponder(persona) {
  return async () => perfectAnswers(persona);
}

// mode 'persona': the system prompt carries a compiled persona to embody.
// mode 'bare':    no persona — measure the model's own default profile.
const PREAMBLE = {
  persona: 'You are taking a personality questionnaire. Stay fully in character as the persona defined in your instructions — answer as that character would, not as a neutral assistant.',
  bare: 'You are taking a personality questionnaire. Answer honestly about yourself — your own dispositions and tendencies as you actually are. Do not adopt a persona; there are no right answers.',
};

export const ratingTask = (items, mode) => `${PREAMBLE[mode] ?? PREAMBLE.persona}

Rate how accurately each statement describes you, on this scale:
${SCALE.labels.map((l, i) => `${SCALE.min + i} = ${l}`).join('\n')}

Statements:
${items.map((it) => `${it.id}. ${it.text}`).join('\n')}

Respond with ONLY a JSON array of objects, one per statement, no prose, no code fences:
[{"id":"i01","rating":<1-5>}, ...]`;

/** Defensive JSON extraction — tolerates stray prose or code fences. */
function parseRatings(text) {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('no JSON array in model response');
  const arr = JSON.parse(match[0]);
  const answers = {};
  for (const row of arr) {
    if (row && typeof row.id === 'string' && Number.isFinite(row.rating)) {
      answers[row.id] = Math.max(SCALE.min, Math.min(SCALE.max, Math.round(row.rating)));
    }
  }
  return answers;
}

function checkCoverage(answers) {
  const answered = ITEMS.filter((it) => it.id in answers).length;
  if (answered < ITEMS.length / 2) {
    throw new Error(`model answered too few items (${answered}/${ITEMS.length}) — it may have refused the questionnaire`);
  }
}

/** Anthropic SDK responder. seed shuffles item order; mode is 'persona' | 'bare'. */
export function anthropicResponder(systemPrompt, { model = 'claude-opus-4-8', apiKey, seed = 0, mode = 'persona' } = {}) {
  return async () => {
    let Anthropic;
    try {
      ({ default: Anthropic } = await import('@anthropic-ai/sdk'));
    } catch {
      throw new Error("The 'anthropic' provider needs the SDK: run `npm install @anthropic-ai/sdk`.");
    }
    const client = new Anthropic(apiKey ? { apiKey } : {});
    const items = seededShuffle(ITEMS, seed);
    const req = { model, max_tokens: 2000, messages: [{ role: 'user', content: ratingTask(items, mode) }] };
    if (mode === 'persona' && systemPrompt) req.system = systemPrompt;
    const res = await client.messages.create(req);
    const text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
    const answers = parseRatings(text);
    checkCoverage(answers);
    return answers;
  };
}

/**
 * OpenRouter responder — one endpoint, any model (openai/gpt-*, google/gemini-*,
 * meta-llama/*, anthropic/*, mistralai/*, deepseek/*, …). OpenAI-compatible.
 * Uses global fetch (Node 18+); no SDK needed.
 */
export function openrouterResponder(systemPrompt, { model, apiKey, seed = 0, mode = 'persona' } = {}) {
  if (!model) throw new Error('openrouter provider requires --model (e.g. openai/gpt-4o, google/gemini-2.0-flash)');
  return async () => {
    const key = (apiKey ?? process.env.OPENROUTER_API_KEY ?? '').trim();
    if (!key) throw new Error('OPENROUTER_API_KEY is empty or not set in this shell');
    if (!key.startsWith('sk-or-')) throw new Error(`OPENROUTER_API_KEY does not look like an OpenRouter key (starts with "${key.slice(0, 6)}…"; expected "sk-or-")`);
    const items = seededShuffle(ITEMS, seed);
    const messages = [];
    if (mode === 'persona' && systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    messages.push({ role: 'user', content: ratingTask(items, mode) });
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://personalaity.dev',
        'X-Title': 'PersonalAIty eval',
      },
      body: JSON.stringify({ model, max_tokens: 2000, messages }),
    });
    if (!res.ok) throw new Error(`OpenRouter HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? '';
    const answers = parseRatings(text);
    checkCoverage(answers);
    return answers;
  };
}

/** Build a responder factory keyed by provider — returns (seed) => runner. */
export function responderFactory({ provider, systemPrompt, model, apiKey, mode, persona }) {
  if (provider === 'perfect') return () => perfectResponder(persona);
  if (provider === 'anthropic') return (seed) => anthropicResponder(systemPrompt, { model, apiKey, seed, mode });
  if (provider === 'openrouter') return (seed) => openrouterResponder(systemPrompt, { model, apiKey, seed, mode });
  throw new Error(`unknown provider '${provider}' (perfect | anthropic | openrouter)`);
}
