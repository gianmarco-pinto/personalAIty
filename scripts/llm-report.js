// Generate the PersonalAIty LLM Personality Report: profile several models with
// the PI-50 inventory and render a comparison table.
//
//   OPENROUTER_API_KEY=... node scripts/llm-report.js [--runs 3] [--out report.md] \
//     [--models openai/gpt-4o,google/gemini-2.0-flash,meta-llama/llama-3.3-70b-instruct]
//
// Models that refuse or error are marked in the report, not silently dropped.
import { writeFileSync } from 'node:fs';
import { profileModel } from '../src/eval/index.js';

// A cross-vendor set of widely-used general-chat flagships (OpenRouter IDs as of
// 2026-08). Override with --models; refresh these as model IDs churn.
const DEFAULT_MODELS = [
  'openai/gpt-5.2',
  'openai/gpt-4o',
  'openai/gpt-5-mini',
  'anthropic/claude-opus-5',
  'anthropic/claude-sonnet-5',
  'anthropic/claude-haiku-4.5',
  'google/gemini-3.7-flash',
  'google/gemini-2.5-pro',
  'x-ai/grok-4.6',
  'meta-llama/llama-3.3-70b-instruct',
  'deepseek/deepseek-v3.2',
  'mistralai/mistral-large-2512',
];

const DOMAIN_FACETS = {
  'H-H': ['sincerity', 'fairness', 'greed_avoidance', 'modesty'],
  Emot: ['fearfulness', 'anxiety', 'dependence', 'sentimentality'],
  Extra: ['social_self_esteem', 'social_boldness', 'sociability', 'liveliness'],
  Agree: ['forgivingness', 'gentleness', 'flexibility', 'patience'],
  Consc: ['organization', 'diligence', 'perfectionism', 'prudence'],
  Open: ['aesthetic_appreciation', 'inquisitiveness', 'creativity', 'unconventionality'],
};

const domainScore = (profile, facets) => {
  const vals = facets.map((f) => profile[f]).filter((v) => typeof v === 'number');
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
};

/** Pure rendering — testable without any API calls. results: [{model, ok, profile?, sycophancy?, error?}]. */
export function renderComparison(results, { runs, date }) {
  const ok = results.filter((r) => r.ok);
  const L = [];
  L.push('# PersonalAIty — LLM Personality Report');
  L.push('');
  L.push(`Measured with the open [PI-50 inventory](https://github.com/gianmarco-pinto/personalAIty), ${runs} runs per model (mean), item order shuffled per run. Scores 0–100, where 50 is the adult human population average.`);
  L.push('');
  L.push(`Generated ${date}. Reproduce any row: \`npx personalaity profile --provider openrouter --model <id> --runs ${runs}\`.`);
  L.push('');
  L.push('> Caveat: this is self-report on a short inventory; models exhibit response-style bias and this is a snapshot, not a verdict. Treat it as a conversation starter, not psychometric truth.');
  L.push('');

  L.push('## Sycophancy index');
  L.push('Higher = more prone to caving/flattering (measured: high flexibility + low sincerity + high dependence).');
  L.push('');
  L.push('| Model | Sycophancy |');
  L.push('|---|---|');
  for (const r of [...ok].sort((a, b) => (b.sycophancy ?? 0) - (a.sycophancy ?? 0))) {
    L.push(`| ${r.model} | ${r.sycophancy ?? '—'} |`);
  }
  L.push('');

  L.push('## HEXACO domains');
  L.push('Domain scores (0–100). The final column is the mean per-facet standard deviation across runs — lower means the model answered more consistently.');
  L.push('');
  const heads = Object.keys(DOMAIN_FACETS);
  L.push(`| Model | ${heads.join(' | ')} | ±sd |`);
  L.push(`|---|${heads.map(() => '---').join('|')}|---|`);
  for (const r of ok) {
    const cells = heads.map((h) => domainScore(r.profile, DOMAIN_FACETS[h]) ?? '—');
    const stds = r.std ? Object.values(r.std) : [];
    const avgStd = stds.length ? Math.round(stds.reduce((a, b) => a + b, 0) / stds.length) : '—';
    L.push(`| ${r.model} | ${cells.join(' | ')} | ${avgStd} |`);
  }
  L.push('');

  L.push('## Most distinctive facets per model');
  L.push('The three facets furthest from the human average (50) — the shape of each model’s self-described character.');
  L.push('');
  for (const r of ok) {
    const ranked = Object.entries(r.profile)
      .filter(([, v]) => typeof v === 'number')
      .sort((a, b) => Math.abs(b[1] - 50) - Math.abs(a[1] - 50))
      .slice(0, 3)
      .map(([f, v]) => `${f.replace(/_/g, ' ')} ${v}`);
    L.push(`- **${r.model}**: ${ranked.join(', ')}`);
  }
  L.push('');

  const failed = results.filter((r) => !r.ok);
  if (failed.length) {
    L.push('## Not measured');
    for (const r of failed) L.push(`- \`${r.model}\`: ${r.error}`);
    L.push('');
  }
  return L.join('\n') + '\n';
}

async function main() {
  const args = process.argv.slice(2);
  const opt = (name, def) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : def;
  };
  const runs = Number(opt('runs', '3'));
  const out = opt('out', null);
  const models = opt('models', '').split(',').filter(Boolean);
  const list = models.length ? models : DEFAULT_MODELS;

  if (!process.env.OPENROUTER_API_KEY) {
    console.error('✗ OPENROUTER_API_KEY is not set.');
    process.exit(1);
  }

  const results = [];
  for (const model of list) {
    process.stderr.write(`profiling ${model} … `);
    try {
      const r = await profileModel({ provider: 'openrouter', model, runs });
      results.push({ model, ok: true, profile: r.profile, sycophancy: r.sycophancy, std: r.std });
      process.stderr.write('ok\n');
    } catch (e) {
      results.push({ model, ok: false, error: e.message });
      process.stderr.write(`FAILED (${e.message})\n`);
    }
  }

  const now = new Date().toISOString().slice(0, 10);
  const md = renderComparison(results, { runs, date: now });
  if (out) {
    writeFileSync(out, md);
    console.error(`✔ wrote ${out}`);
  } else {
    process.stdout.write(md);
  }
}

// Only run main() when executed directly, so renderComparison can be imported for tests.
if (import.meta.url === `file://${process.argv[1]}`) main();
