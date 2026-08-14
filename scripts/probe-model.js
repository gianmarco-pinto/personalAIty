// Diagnostic: send the PI-50 questionnaire to one model and print its RAW reply,
// so we can see whether a "no JSON array" failure is a refusal or a formatting
// issue. Usage:
//   OPENROUTER_API_KEY=... node scripts/probe-model.js google/gemini-2.5-pro
import { ITEMS } from '../src/eval/inventory.js';
import { ratingTask } from '../src/eval/responders.js';

const model = process.argv[2];
if (!model) {
  console.error('usage: node scripts/probe-model.js <openrouter-model-id>');
  process.exit(1);
}
const key = (process.env.OPENROUTER_API_KEY ?? '').trim();
if (!key) {
  console.error('OPENROUTER_API_KEY is not set');
  process.exit(1);
}

const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://personalaity.dev',
    'X-Title': 'PersonalAIty probe',
  },
  body: JSON.stringify({
    model,
    max_tokens: 8000,
    messages: [{ role: 'user', content: ratingTask(ITEMS, 'bare') }],
  }),
});

if (!res.ok) {
  console.error(`HTTP ${res.status}: ${(await res.text()).slice(0, 400)}`);
  process.exit(1);
}
const data = await res.json();
const choice = data.choices?.[0];
const text = choice?.message?.content ?? '';

console.log(`=== ${model} ===`);
console.log(`finish_reason: ${choice?.finish_reason}`);
console.log(`content length: ${text.length} chars`);
console.log('=== RAW CONTENT (first 1500 chars) ===');
console.log(text.slice(0, 1500));
console.log('=== JSON array present? ===');
console.log(/\[[\s\S]*\]/.test(text) ? 'yes' : 'NO — this is why parsing failed');
