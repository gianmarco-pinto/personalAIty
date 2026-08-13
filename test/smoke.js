// Smoke test: every gallery persona must validate and compile in every language.
import { readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPersona } from '../src/load.js';
import { compileChat } from '../src/compile/chat.js';
import { compileSocial } from '../src/compile/social.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const personasDir = join(root, 'personas');
const targets = [
  ['chat', compileChat, ['en', 'it']],
  ['social', compileSocial, ['en']],
];
let failures = 0;

for (const f of readdirSync(personasDir).filter((f) => f.endsWith('.persona.yaml'))) {
  const path = join(personasDir, f);
  const { persona, errors } = loadPersona(path);
  if (errors.length) {
    failures++;
    console.error(`✗ ${f}: ${errors.join('; ')}`);
    continue;
  }
  for (const [target, compile, langs] of targets) {
    for (const lang of langs) {
      try {
        const out = compile(persona, { lang });
        const min = 400; // a gallery persona is distinctive by design — outputs must not be near-empty
        if (out.length < min) throw new Error(`suspiciously short output (${out.length} chars)`);
        console.log(`✔ ${f} [${target}/${lang}] ${out.length} chars`);
      } catch (e) {
        failures++;
        console.error(`✗ ${f} [${target}/${lang}]: ${e.message}`);
      }
    }
  }
}

if (failures) {
  console.error(`\n${failures} failure(s)`);
  process.exit(1);
}
console.log('\nsmoke: ALL OK');
