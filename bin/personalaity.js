#!/usr/bin/env node
// PersonalAIty CLI — compile persona specs into per-medium artifacts.
import { writeFileSync } from 'node:fs';
import { loadPersona } from '../src/load.js';
import { compileChat } from '../src/compile/chat.js';
import { compileSocial } from '../src/compile/social.js';
import { runEval, formatReport } from '../src/eval/index.js';

const HELP = `personalaity v0.3

Usage:
  personalaity compile  <persona.yaml> [--target chat|social] [--level full|style] [--lang en|it] [--out file]
  personalaity validate <persona.yaml>
  personalaity eval     <persona.yaml> [--model <id>] [--level full|style] [--responder anthropic|perfect] [--json]

Targets:
  chat    (default) system prompt for LLM chat/agents — L2 conformance
  social  content style guide for social media voice — L2 conformance (en only)

Levels (chat target only):
  full    (default) the complete persona — character, drives, dynamics, modulation
  style   compact budget mode (~60% fewer tokens): the 8 most distinctive facets,
          voice, always-on quirks and hard rules. Boundaries are never dropped.

Eval:
  Administers the PI-50 inventory to the persona compiled as a chat prompt,
  then reports declared-vs-measured HEXACO plus a sycophancy index.
  --responder anthropic (default) runs a real model — needs ANTHROPIC_API_KEY
  and \`npm install @anthropic-ai/sdk\`. --responder perfect validates the
  scoring pipeline with no LLM (should score ~100).

Notes:
  Structured fields are rendered in the requested --lang; freeform text
  (summary, backstory, quirks, boundaries) passes through as authored.
`;

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) args[a.slice(2)] = argv[++i] ?? true;
    else args._.push(a);
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const [cmd, file] = args._;

if (!cmd || args.help || !file) {
  console.log(HELP);
  process.exit(cmd ? 1 : 0);
}

const { persona, errors } = loadPersona(file);

if (cmd === 'validate') {
  if (errors.length) {
    console.error(`✗ ${file}`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(`✔ ${file} is a valid PersonalAIty persona (spec ${persona.persona_spec})`);
  process.exit(0);
}

if (cmd === 'compile') {
  if (errors.length) {
    console.error(`✗ ${file} failed validation:`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  const target = args.target ?? 'chat';
  const compilers = { chat: compileChat, social: compileSocial };
  if (!compilers[target]) {
    console.error(`✗ target '${target}' not implemented yet (available: ${Object.keys(compilers).join(', ')})`);
    process.exit(1);
  }
  if (args.level && target !== 'chat') {
    console.error(`✗ --level applies to the chat target only`);
    process.exit(1);
  }
  const out = compilers[target](persona, { lang: args.lang ?? 'en', level: args.level ?? 'full' });
  if (args.out) {
    writeFileSync(args.out, out);
    console.error(`✔ wrote ${args.out}`);
  } else {
    process.stdout.write(out);
  }
  process.exit(0);
}

if (cmd === 'eval') {
  if (errors.length) {
    console.error(`✗ ${file} failed validation:`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  const responder = args.responder ?? 'anthropic';
  try {
    if (responder === 'anthropic' && !process.env.ANTHROPIC_API_KEY && !args.apiKey) {
      console.error('✗ ANTHROPIC_API_KEY is not set. Set it, or use --responder perfect to test the pipeline offline.');
      process.exit(1);
    }
    const report = await runEval(persona, {
      responder,
      model: args.model ?? 'claude-opus-4-8',
      apiKey: args.apiKey,
      level: args.level ?? 'full',
    });
    if (args.json) process.stdout.write(JSON.stringify(report, null, 2) + '\n');
    else process.stdout.write(formatReport(persona, report));
  } catch (e) {
    console.error(`✗ eval failed: ${e.message}`);
    process.exit(1);
  }
  process.exit(0);
}

console.error(`✗ unknown command '${cmd}'`);
console.log(HELP);
process.exit(1);
