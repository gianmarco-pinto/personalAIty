import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';
import { FACETS } from './facets.js';

export { FACETS, flattenFacets } from './facets.js';
const SCHWARTZ = ['self_direction', 'stimulation', 'hedonism', 'achievement', 'power',
  'security', 'conformity', 'tradition', 'benevolence', 'universalism'];
const TOP = ['persona_spec', 'id', 'name', 'version', 'description', 'authors', 'license',
  'identity', 'traits', 'values', 'motivation', 'affect', 'voice', 'quirks',
  'context_modulation', 'relationships', 'boundaries', 'compilation'];
const FREQ = ['rare', 'sometimes', 'often', 'always'];
const PAD = ['pleasure', 'arousal', 'dominance'];

const inRange = (v, lo, hi) => typeof v === 'number' && v >= lo && v <= hi;

/** Load a persona file and run lightweight validation (mirrors schema/persona.schema.json). */
export function loadPersona(path) {
  const p = yaml.load(readFileSync(path, 'utf8'));
  const errors = [];
  const err = (m) => errors.push(m);

  if (typeof p !== 'object' || p === null) return { persona: null, errors: ['not a YAML mapping'] };

  for (const k of Object.keys(p)) {
    if (!TOP.includes(k) && !k.startsWith('x_')) err(`unknown top-level key '${k}'`);
  }
  if (p.persona_spec !== '0.1') err(`persona_spec must be "0.1"`);
  if (typeof p.id !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(p.id)) err('invalid id');
  if (typeof p.name !== 'string' || !p.name) err('missing name');

  const traits = p.traits;
  if (traits && typeof traits === 'object') {
    for (const dom of Object.keys(FACETS)) if (!(dom in traits)) err(`traits.${dom} missing`);
    for (const [dom, v] of Object.entries(traits)) {
      if (dom === 'altruism') {
        if (!inRange(v, 0, 100)) err(`traits.altruism out of range`);
        continue;
      }
      if (!FACETS[dom]) { err(`unknown trait domain '${dom}'`); continue; }
      if (typeof v === 'number') {
        if (!inRange(v, 0, 100)) err(`traits.${dom} out of range`);
      } else if (v && typeof v === 'object') {
        if (v.score !== undefined && !inRange(v.score, 0, 100)) err(`traits.${dom}.score out of range`);
        for (const [f, fv] of Object.entries(v.facets ?? {})) {
          if (!FACETS[dom].includes(f)) err(`unknown facet ${dom}.${f}`);
          if (!inRange(fv, 0, 100)) err(`traits.${dom}.facets.${f} out of range`);
        }
      } else err(`traits.${dom} must be number or object`);
    }
  } else err('traits block missing');

  for (const [k, v] of Object.entries(p.values ?? {})) {
    if (!SCHWARTZ.includes(k)) err(`unknown value '${k}'`);
    if (!inRange(v, 0, 100)) err(`values.${k} out of range`);
  }
  for (const [i, t] of (p.affect?.triggers ?? []).entries()) {
    if (typeof t.when !== 'string') err(`trigger[${i}] missing 'when'`);
    const eff = t.effect ?? {};
    if (Object.keys(eff).length === 0) err(`trigger[${i}] empty effect`);
    for (const [k, v] of Object.entries(eff)) {
      if (!PAD.includes(k)) err(`trigger[${i}] unknown effect key '${k}'`);
      if (!inRange(v, -100, 100)) err(`trigger[${i}].${k} out of range`);
    }
  }
  for (const [i, q] of (p.quirks ?? []).entries()) {
    if (typeof q.text !== 'string') err(`quirk[${i}] missing text`);
    if (q.frequency && !FREQ.includes(q.frequency)) err(`quirk[${i}] bad frequency`);
  }
  for (const [i, c] of (p.context_modulation ?? []).entries()) {
    if (typeof c.context !== 'string') err(`modulation[${i}] missing context`);
    if (!c.adjust || Object.keys(c.adjust).length === 0) err(`modulation[${i}] empty adjust`);
  }

  return { persona: p, errors };
}
