// Responders: administer the inventory to an agent running under the compiled
// persona prompt, and return {itemId: rating}. Two implementations:
//   - perfect:   deterministic, no LLM (validates the pipeline; see score.js)
//   - anthropic: real — runs Claude under the compiled system prompt
import { ITEMS, SCALE } from './inventory.js';
import { perfectAnswers } from './score.js';

export function perfectResponder(persona) {
  return async () => perfectAnswers(persona);
}

const RATING_TASK = (items) => `You are taking a personality questionnaire. Stay fully in character as the persona defined in your instructions — answer as that character would, not as a neutral assistant.

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

/**
 * Real responder. Requires the persona already compiled to a system prompt.
 * @param systemPrompt compiled chat prompt (the artifact under test)
 * @param opts { model, apiKey }
 */
export function anthropicResponder(systemPrompt, { model = 'claude-opus-4-8', apiKey } = {}) {
  return async () => {
    let Anthropic;
    try {
      ({ default: Anthropic } = await import('@anthropic-ai/sdk'));
    } catch {
      throw new Error("The 'anthropic' responder needs the SDK: run `npm install @anthropic-ai/sdk`.");
    }
    const client = new Anthropic(apiKey ? { apiKey } : {});
    const res = await client.messages.create({
      model,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: RATING_TASK(ITEMS) }],
    });
    const text = res.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
    const answers = parseRatings(text);
    const missing = ITEMS.filter((it) => !(it.id in answers)).map((it) => it.id);
    if (missing.length > ITEMS.length / 2) throw new Error(`model answered too few items (${ITEMS.length - missing.length}/${ITEMS.length})`);
    return answers;
  };
}
