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

  // style level (chat only): must be substantially shorter, never empty, and must keep hard rules
  for (const lang of ['en', 'it']) {
    try {
      const full = compileChat(persona, { lang, level: 'full' });
      const style = compileChat(persona, { lang, level: 'style' });
      if (style.length < 200) throw new Error(`style output too short (${style.length})`);
      if (style.length >= full.length * 0.8) throw new Error(`style not compact enough (${style.length} vs ${full.length})`);
      if ((persona.boundaries ?? []).length && !style.includes(persona.boundaries[0].trim())) {
        throw new Error('style level dropped boundaries — never allowed');
      }
      console.log(`✔ ${f} [chat-style/${lang}] ${style.length} chars (full: ${full.length}, -${Math.round((1 - style.length / full.length) * 100)}%)`);
    } catch (e) {
      failures++;
      console.error(`✗ ${f} [chat-style/${lang}]: ${e.message}`);
    }
  }
}

if (failures) {
  console.error(`\n${failures} failure(s)`);
  process.exit(1);
}
console.log('\nsmoke: ALL OK');
