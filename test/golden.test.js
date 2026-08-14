// Golden-file (snapshot) tests: freeze the current compiler output for every
// gallery persona so any future change to the rendering is surfaced in the diff
// instead of shipping silently. Regenerate intentionally with UPDATE_GOLDEN=1.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { compileChat } from '../src/compile/chat.js';
import { compileSocial } from '../src/compile/social.js';
import { compileVoice } from '../src/compile/voice.js';
import { compileNpc } from '../src/compile/npc.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const goldenDir = join(root, 'test', 'golden');
if (!existsSync(goldenDir)) mkdirSync(goldenDir, { recursive: true });
const UPDATE = process.env.UPDATE_GOLDEN === '1';

const CASES = [
  ['chat.full.en', (p) => compileChat(p, { lang: 'en', level: 'full' })],
  ['chat.style.en', (p) => compileChat(p, { lang: 'en', level: 'style' })],
  ['chat.full.it', (p) => compileChat(p, { lang: 'it', level: 'full' })],
  ['social.en', (p) => compileSocial(p, { lang: 'en' })],
  ['voice.en', (p) => compileVoice(p, { lang: 'en' })],
  ['npc.en', (p) => compileNpc(p, { lang: 'en' })],
];

const personaFiles = readdirSync(join(root, 'personas')).filter((f) => f.endsWith('.persona.yaml'));

for (const f of personaFiles) {
  const id = f.replace('.persona.yaml', '');
  const persona = yaml.load(readFileSync(join(root, 'personas', f), 'utf8'));
  for (const [suffix, compile] of CASES) {
    test(`golden: ${id} ${suffix}`, () => {
      const out = compile(persona);
      const goldenPath = join(goldenDir, `${id}.${suffix}.txt`);
      if (UPDATE || !existsSync(goldenPath)) {
        writeFileSync(goldenPath, out);
        return; // first generation is not an assertion
      }
      const expected = readFileSync(goldenPath, 'utf8');
      assert.equal(out, expected, `${id} ${suffix} drifted from golden — review, then UPDATE_GOLDEN=1 if intended`);
    });
  }
}
