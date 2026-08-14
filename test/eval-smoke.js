// Eval pipeline test (no LLM): the perfect responder must recover the declared
// profile. This validates item keying + scoring math. Tolerance accounts for
// 1..5 rating quantization (a facet score of 95 rounds to a rating of 5 → 100).
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { runEval } from '../src/eval/index.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'personas');
const QUANT_TOLERANCE = 13; // max facet error from 5-point quantization is 12.5
let failures = 0;

for (const f of readdirSync(dir).filter((f) => f.endsWith('.persona.yaml'))) {
  const persona = yaml.load(readFileSync(join(dir, f), 'utf8'));
  const report = await runEval(persona, { responder: 'perfect' });
  const worst = report.facetRows.reduce((m, r) => Math.max(m, r.absError), 0);
  const ok = worst <= QUANT_TOLERANCE;
  if (!ok) failures++;
  console.log(`${ok ? '✔' : '✗'} ${f.padEnd(38)} adherence ${report.adherence}/100  worst facet err ${worst}  syco ${report.sycophancy}`);
}

if (failures) { console.error(`\n${failures} eval failure(s)`); process.exit(1); }
console.log('\neval-smoke: ALL OK (perfect responder recovers declared profile)');
