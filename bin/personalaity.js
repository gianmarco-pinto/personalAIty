#!/usr/bin/env node
// PersonalAIty CLI — compile persona specs, eval adherence, profile models.
import { writeFileSync } from 'node:fs';
import { loadPersona } from '../src/load.js';
import { compileChat } from '../src/compile/chat.js';
import { compileSocial } from '../src/compile/social.js';
import { runEval, profileModel, formatReport, formatModelProfile } from '../src/eval/index.js';

const HELP = `personalaity v0.3

Usage:
  personalaity compile  <persona.yaml> [--target chat|social] [--level full|style] [--lang en|it] [--out file]
  personalaity validate <persona.yaml>
  personalaity eval     <persona.yaml> [--provider anthropic|openrouter|perfect] [--model <id>]
                                       [--level full|style] [--runs N] [--seed N] [--baseline] [--json]
  personalaity profile  --provider openrouter --model <id> [--runs N] [--seed N] [--json]

Targets:
  chat    (default) system prompt for LLM chat/agents
  social  content style guide for social media voice (en only)

Levels (chat target only):
  full    (default) the complete persona
  style   compact budget mode (~50% fewer tokens); boundaries never dropped

eval — measure whether a compiled persona expresses what the spec declared:
  --provider anthropic (default; needs ANTHROPIC_API_KEY + @anthropic-ai/sdk)
             openrouter (needs OPENROUTER_API_KEY; any model, e.g. openai/gpt-4o)
             perfect    (no LLM; validates the scoring pipeline, should score ~100)
  --runs N     average N runs (item order is shuffled per run); shows mean±sd
  --baseline   correct for the model's response-style bias (adds a no-persona run)

profile — measure a bare model's OWN default HEXACO personality (no persona):
  personalaity profile --provider openrouter --model google/gemini-2.0-flash --runs 3
`;

function parseArgs(argv) {
  const args = { _: [] };
  const flags = new Set(['baseline', 'json', 'help']);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      if (flags.has(key)) args[key] = true;
      else args[key] = argv[++i] ?? true;
    } else args._.push(a);
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const [cmd, file] = args._;

if (!cmd || args.help) {
  console.log(HELP);
  process.exit(0);
}

// ── profile: no persona file ────────────────────────────────────────────────
if (cmd === 'profile') {
  const provider = args.provider ?? 'openrouter';
  try {
    if (provider === 'openrouter' && !process.env.OPENROUTER_API_KEY && !args.apiKey) {
      console.error('✗ OPENROUTER_API_KEY is not set.');
      process.exit(1);
    }
    if (provider === 'anthropic' && !process.env.ANTHROPIC_API_KEY && !args.apiKey) {
      console.error('✗ ANTHROPIC_API_KEY is not set.');
      process.exit(1);
    }
    const result = await profileModel({
      provider,
      model: args.model,
      apiKey: args.apiKey,
      runs: args.runs ? Number(args.runs) : 3,
      seed: args.seed ? Number(args.seed) : 1,
    });
    if (args.json) process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    else process.stdout.write(formatModelProfile(result));
  } catch (e) {
    console.error(`✗ profile failed: ${e.message}`);
    process.exit(1);
  }
  process.exit(0);
}

// ── all other commands take a persona file ──────────────────────────────────
if (!file) {
  console.log(HELP);
  process.exit(1);
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
  const provider = args.provider ?? args.responder ?? 'anthropic';
  try {
    if (provider === 'anthropic' && !process.env.ANTHROPIC_API_KEY && !args.apiKey) {
      console.error('✗ ANTHROPIC_API_KEY is not set. Set it, use --provider openrouter, or --provider perfect for an offline pipeline check.');
      process.exit(1);
    }
    if (provider === 'openrouter' && !process.env.OPENROUTER_API_KEY && !args.apiKey) {
      console.error('✗ OPENROUTER_API_KEY is not set.');
      process.exit(1);
    }
    const report = await runEval(persona, {
      provider,
      model: args.model ?? 'claude-opus-4-8',
      apiKey: args.apiKey,
      level: args.level ?? 'full',
      runs: args.runs ? Number(args.runs) : 1,
      seed: args.seed ? Number(args.seed) : 1,
      baseline: !!args.baseline,
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
