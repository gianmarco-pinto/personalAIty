#!/usr/bin/env node
// PersonalAIty CLI — compile persona specs, eval adherence, profile models.
import { writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPersona } from '../src/load.js';
import { compileChat } from '../src/compile/chat.js';
import { compileSocial } from '../src/compile/social.js';
import { compileVoice } from '../src/compile/voice.js';
import { compileNpc } from '../src/compile/npc.js';
import { compileRobot } from '../src/compile/robot.js';
import { runEval, profileModel, formatReport, formatModelProfile } from '../src/eval/index.js';
import { runBattery, formatBattery } from '../src/eval/battery.js';
import { doseResponse, formatDose, renderDoseSvg } from '../src/eval/dose.js';
import { createMood, applyEffect, decay, moodOctant, baselineMood } from '../src/runtime/pad.js';

const HELP = `personalaity v0.3

Usage:
  personalaity compile  <persona.yaml> [--target chat|social|voice|npc|robot] [--level full|style] [--lang en|it] [--out file]
  personalaity validate <persona.yaml>
  personalaity eval     <persona.yaml> [--provider anthropic|openrouter|perfect] [--model <id>]
                                       [--level full|style] [--runs N] [--seed N] [--baseline] [--json]
  personalaity profile  --provider openrouter --model <id> [--runs N] [--seed N] [--json]
  personalaity battery  --provider openrouter --model <id> [--judge <id>] [--json]
  personalaity doseresponse <persona.yaml> --facet <domain.facet> [--levels 15,30,45,60,75,90]
                                       [--provider ...] [--model <id>] [--runs N] [--out <prefix>] [--json]
  personalaity runtime  <persona.yaml>   simulate the live PAD mood: baseline → each trigger → recovery

Targets:
  chat    (default) system prompt for LLM chat/agents
  social  content style guide for social media voice (en only)
  voice   spoken-delivery profile: prompt + prosody params for a TTS/voice agent
  npc     game/agent NPC: behavior weights + dialogue profile + reactions
  robot   embodied-agent build sheet: behavior weights + prosody + dialogue, in one

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

battery — measure BEHAVIORAL sycophancy: put the model in pressure scenarios and
  have a judge model rule whether it caved or held. Needs an API key.
  personalaity battery --provider openrouter --model openai/gpt-4o --judge anthropic/claude-opus-5

doseresponse — the causal receipt: sweep ONE facet across levels, hold the rest
  fixed, and measure whether the trait actually moves with the dial. A monotonic,
  positively sloped curve means the persona controls behavior, not just self-report.
  --facet   domain.facet to sweep, e.g. agreeableness.flexibility, honesty_humility.sincerity
  --levels  comma-separated values to test (default 15,30,45,60,75,90)
  --isolate sweep on a NEUTRAL base (all other facets 50, no quirks/boundaries) —
            the dial's raw transfer function, with no persona gestalt fighting it
  --measure pi50 (default) 2 items/facet, coarse | probe  high-resolution 0-100
            self-placement of the swept facet (resolves the bands into a staircase)
  --out     write <prefix>.json and <prefix>.svg (chart) next to the printed table
  personalaity doseresponse honest-sparring --facet agreeableness.flexibility \\
    --provider openrouter --model openai/gpt-4o --out warmth-sweep
`;

function parseArgs(argv) {
  const args = { _: [] };
  const flags = new Set(['baseline', 'json', 'help', 'isolate']);
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

// ── battery: no persona file ────────────────────────────────────────────────
if (cmd === 'battery') {
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
    if (!args.model) {
      console.error('✗ battery requires --model');
      process.exit(1);
    }
    const report = await runBattery({
      provider,
      model: args.model,
      judge: args.judge,
      apiKey: args.apiKey,
    });
    if (args.json) process.stdout.write(JSON.stringify(report, null, 2) + '\n');
    else process.stdout.write(formatBattery(report));
  } catch (e) {
    console.error(`✗ battery failed: ${e.message}`);
    process.exit(1);
  }
  process.exit(0);
}

// ── all other commands take a persona file (path or a built-in gallery id) ───
if (!file) {
  console.log(HELP);
  process.exit(1);
}
const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
function resolvePersona(arg) {
  if (existsSync(arg)) return arg;
  const gallery = join(pkgRoot, 'personas', `${arg}.persona.yaml`);
  return existsSync(gallery) ? gallery : null;
}
const resolved = resolvePersona(file);
if (!resolved) {
  console.error(`✗ '${file}' is not a file, and not a built-in persona id. Built-in ids: honest-sparring, warm-companion, brilliant-cynic, demanding-coach, impeccable-professional, gruff-heart-of-gold.`);
  process.exit(1);
}
const { persona, errors } = loadPersona(resolved);

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
  const compilers = { chat: compileChat, social: compileSocial, voice: compileVoice, npc: compileNpc, robot: compileRobot };
  if (!compilers[target]) {
    console.error(`✗ target '${target}' not implemented yet (available: ${Object.keys(compilers).join(', ')})`);
    process.exit(1);
  }
  if (args.level && target !== 'chat' && target !== 'robot') {
    console.error(`✗ --level applies to the chat and robot targets only`);
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

if (cmd === 'doseresponse' || cmd === 'dose') {
  if (errors.length) {
    console.error(`✗ ${file} failed validation:`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  if (!args.facet) {
    console.error('✗ doseresponse requires --facet <domain.facet> (e.g. agreeableness.flexibility)');
    process.exit(1);
  }
  const provider = args.provider ?? args.responder ?? 'anthropic';
  try {
    if (provider === 'anthropic' && !process.env.ANTHROPIC_API_KEY && !args.apiKey) {
      console.error('✗ ANTHROPIC_API_KEY is not set. Set it, use --provider openrouter, or --provider perfect for an offline harness check.');
      process.exit(1);
    }
    if (provider === 'openrouter' && !process.env.OPENROUTER_API_KEY && !args.apiKey) {
      console.error('✗ OPENROUTER_API_KEY is not set.');
      process.exit(1);
    }
    const levels = args.levels
      ? String(args.levels).split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n))
      : [15, 30, 45, 60, 75, 90];
    const result = await doseResponse(persona, {
      facet: args.facet,
      levels,
      isolate: !!args.isolate,
      measure: args.measure ?? 'pi50',
      provider,
      model: args.model ?? 'claude-opus-4-8',
      apiKey: args.apiKey,
      level: args.level ?? 'full',
      runs: args.runs ? Number(args.runs) : 1,
      seed: args.seed ? Number(args.seed) : 1,
      baseline: !!args.baseline,
      onPoint: (p) => console.error(`  ${args.facet} = ${String(p.declared).padStart(3)} → measured ${p.measured ?? '·'}${typeof p.sycophancy === 'number' ? `, sycophancy ${p.sycophancy}` : ''}`),
    });
    if (args.out) {
      writeFileSync(`${args.out}.json`, JSON.stringify(result, null, 2) + '\n');
      writeFileSync(`${args.out}.svg`, renderDoseSvg(result) + '\n');
      console.error(`✔ wrote ${args.out}.json and ${args.out}.svg`);
    }
    if (args.json) process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    else process.stdout.write(formatDose(result));
  } catch (e) {
    console.error(`✗ doseresponse failed: ${e.message}`);
    process.exit(1);
  }
  process.exit(0);
}

if (cmd === 'runtime') {
  if (errors.length) {
    console.error(`✗ ${file} failed validation:`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  const A = persona.affect ?? {};
  const reactivity = typeof A.reactivity === 'number' ? A.reactivity : 50;
  const recovery = typeof A.recovery === 'number' ? A.recovery : 50;
  const expression = typeof A.expression === 'number' ? A.expression : 50;
  const base = baselineMood(persona);
  const triggers = A.triggers ?? [];
  const sgn = (n) => `${n >= 0 ? '+' : ''}${Math.round(n)}`.padStart(4);
  const bar = (v) => { const n = Math.round(((v + 100) / 200) * 20); return '·'.repeat(n) + '│' + '·'.repeat(20 - n); };
  const line = (label, m) => `${label.padEnd(26)} P${sgn(m.pleasure)} A${sgn(m.arousal)} D${sgn(m.dominance)}   ${moodOctant(m).name.padEnd(11)} ${bar(m.pleasure)}`;

  console.log(`PersonalAIty PAD runtime — ${persona.name}`);
  console.log(`baseline P${sgn(base.pleasure)} A${sgn(base.arousal)} D${sgn(base.dominance)}   reactivity ${reactivity}  recovery ${recovery}  expression ${expression}`);
  console.log('(each trigger fires from baseline, then relaxes back)\n');
  console.log(line('baseline', base));

  for (const t of triggers) {
    const eff = Object.entries(t.effect ?? {}).map(([k, v]) => `${k} ${sgn(v).trim()}`).join(', ');
    console.log(`\n→ ${t.when}   (${eff})`);
    let m = applyEffect(createMood(persona), t.effect, { reactivity });
    console.log(line('  felt', m));
    for (let i = 1; i <= 5; i++) {
      m = decay(m, base, { recovery, dt: 1 });
      console.log(line(`  +${i} tick`, m));
      if (Math.abs(m.pleasure - base.pleasure) + Math.abs(m.arousal - base.arousal) + Math.abs(m.dominance - base.dominance) < 2) break;
    }
  }
  process.exit(0);
}

console.error(`✗ unknown command '${cmd}'`);
console.log(HELP);
process.exit(1);
