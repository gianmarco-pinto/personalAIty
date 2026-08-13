// chat compiler (L2): persona spec -> system prompt.
// Core principle: 50 = population average = silence. The prompt only says
// what makes this persona DIFFERENT from an average person, so prompt length
// scales with distinctiveness.
import { flattenFacets } from '../facets.js';
import { band, scopeOk, bandedLine, renderAdjust, renderEffect, compilationNote } from './util.js';
import en from '../lang/en.js';
import it from '../lang/it.js';

const LANGS = { en, it };

const CHARACTER_FACETS = [
  'sincerity', 'fairness', 'greed_avoidance', 'modesty',
  'fearfulness', 'anxiety', 'dependence', 'sentimentality',
  'forgivingness', 'gentleness', 'flexibility', 'patience',
  'organization', 'diligence', 'perfectionism', 'prudence',
  'aesthetic_appreciation', 'inquisitiveness', 'creativity', 'unconventionality',
  'altruism',
];
const COMMUNICATE_FACETS = ['social_self_esteem', 'social_boldness', 'sociability', 'liveliness'];
const VOICE_DIALS = ['formality', 'warmth_display', 'verbosity', 'directness', 'certainty_display'];

export function compileChat(p, { lang = 'en', medium = 'chat' } = {}) {
  const L = LANGS[lang];
  if (!L) throw new Error(`unsupported lang '${lang}' (available: ${Object.keys(LANGS).join(', ')})`);

  const facets = flattenFacets(p.traits);
  const sections = [];
  const push = (title, lines) => {
    const clean = lines.filter(Boolean);
    if (clean.length) sections.push(`# ${title}\n${clean.join('\n')}`);
  };

  // WHO YOU ARE
  {
    const lines = [];
    const summary = p.identity?.summary?.trim();
    lines.push(summary ? `${L.youAre(p.name)} ${summary}` : L.youAre(p.name));
    if (p.identity?.backstory) lines.push(L.background + p.identity.backstory.trim());
    push(L.headers.who, lines);
  }

  // CHARACTER
  push(L.headers.character, CHARACTER_FACETS.map((f) => {
    const line = bandedLine(L, L.facets, f, facets[f]);
    return line ? `- ${line}` : null;
  }));

  // HOW YOU COMMUNICATE
  {
    const lines = [];
    const v = p.voice ?? {};
    for (const dial of VOICE_DIALS) {
      const line = bandedLine(L, L.voice, dial, v[dial]);
      if (line) lines.push(`- ${line}`);
    }
    for (const f of COMMUNICATE_FACETS) {
      const line = bandedLine(L, L.facets, f, facets[f]);
      if (line) lines.push(`- ${line}`);
    }
    if (v.humor) {
      const b = band(v.humor.frequency ?? 50);
      const key = b === 'vlow' ? 'vlow' : b === 'low' ? 'low' : b === 'high' || b === 'vhigh' ? 'high' : 'mid';
      let line = L.humor[key];
      if (key !== 'vlow' && v.humor.styles?.length) line += L.humor.styles(v.humor.styles);
      lines.push(`- ${line}${line.endsWith('.') ? '' : '.'}`);
    }
    if (v.lexicon?.prefers?.length) lines.push(`- ${L.lexicon.prefers}${v.lexicon.prefers.join('; ')}.`);
    if (v.lexicon?.avoids?.length) lines.push(`- ${L.lexicon.avoids}${v.lexicon.avoids.join('; ')}.`);
    push(L.headers.communicate, lines);
  }

  // WHAT DRIVES YOU
  {
    const lines = [];
    const entries = Object.entries(p.values ?? {}).filter(([, v]) => typeof v === 'number');
    const top = entries.filter(([, v]) => v >= 60).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const low = entries.filter(([, v]) => v <= 20).sort((a, b) => a[1] - b[1]).slice(0, 2);
    if (top.length) lines.push(`- ${L.caresMost}${top.map(([k]) => L.values[k]).join('; ')}.`);
    if (low.length) lines.push(`- ${L.caresLittle}${low.map(([k]) => L.values[k]).join('; ')}.`);
    if (p.motivation?.needs?.length) lines.push(`- ${L.needs}${p.motivation.needs.join('; ')}.`);
    if (p.motivation?.fears?.length) lines.push(`- ${L.fears}${p.motivation.fears.join('; ')}.`);
    push(L.headers.drives, lines);
  }

  // EMOTIONAL DYNAMICS
  {
    const lines = [];
    const a = p.affect ?? {};
    const bl = a.baseline ?? {};
    const moods = [];
    if (typeof bl.pleasure === 'number' && Math.abs(bl.pleasure) >= 25) moods.push(bl.pleasure > 0 ? L.pad.p_high : L.pad.p_low);
    if (typeof bl.arousal === 'number' && Math.abs(bl.arousal) >= 25) moods.push(bl.arousal > 0 ? L.pad.a_high : L.pad.a_low);
    if (typeof bl.dominance === 'number' && Math.abs(bl.dominance) >= 25) moods.push(bl.dominance > 0 ? L.pad.d_high : L.pad.d_low);
    if (moods.length) lines.push(`- ${L.pad.baseline}${moods.join(', ')}.`);
    for (const dim of ['reactivity', 'recovery', 'expression']) {
      const b = band(a[dim]);
      if (b === 'high' || b === 'vhigh') lines.push(`- ${L.dynamics[`${dim}_high`]}`);
      if (b === 'low' || b === 'vlow') lines.push(`- ${L.dynamics[`${dim}_low`]}`);
    }
    for (const t of a.triggers ?? []) {
      const eff = renderEffect(L, t.effect ?? {});
      if (eff) lines.push(`- ${L.when}${t.when}: ${eff}.`);
    }
    push(L.headers.dynamics, lines);
  }

  // SIGNATURE BEHAVIORS
  push(L.headers.signature, (p.quirks ?? [])
    .filter((q) => scopeOk(q.scope, lang, medium))
    .map((q) => `- [${L.freq[q.frequency ?? 'sometimes']}] ${q.text.trim()}`));

  // WHEN CONTEXT SHIFTS
  push(L.headers.context, (p.context_modulation ?? []).map((c) => {
    const what = renderAdjust(L, c.adjust ?? {});
    if (!what) return null;
    const label = c.description?.trim() || c.context.replace(/_/g, ' ');
    const note = c.note ? ` ${c.note.trim()}` : '';
    return `- ${L.ifCtx}${label}: ${what}.${note}`;
  }));

  // HARD RULES
  {
    const lines = (p.boundaries ?? []).map((b) => `- ${b.trim()}`);
    if (lines.length) lines.push(L.rulesNote);
    push(L.headers.rules, lines);
  }

  const note = compilationNote(p, medium);
  if (note) sections.push(note);

  return sections.join('\n\n') + '\n';
}
