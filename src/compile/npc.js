// npc compiler: persona spec -> game-ready NPC profile. Emits behavior weights
// (0..100 knobs a game engine or agent can act on), a dialogue style, reaction
// patterns from the PAD triggers, and the hard rules. The behavior weights are
// where a persona becomes an NPC: gentleness 15 over altruism 90 (the Gruff
// Heart of Gold) yields low hostility dialogue but high help-behavior.
import { flattenFacets } from '../facets.js';
import { compileChat } from './chat.js';
import { scopeOk, renderEffect, compilationNote } from './util.js';
import en from '../lang/en.js';

const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));
const mean = (...xs) => xs.reduce((a, b) => a + b, 0) / xs.length;

/** Derive behavior weights (0..100) from traits, values and affect. */
export function behaviorWeights(p) {
  const f = flattenFacets(p.traits);
  const val = p.values ?? {};
  const g = (x, d = 50) => (typeof x === 'number' ? x : d);

  return {
    // what it DOES, regardless of how warmly it speaks
    helpfulness: clamp(mean(g(f.altruism), g(val.benevolence, 50))),
    hostility: clamp(mean(100 - g(f.gentleness), 100 - g(f.patience) * 0.5)),
    honesty: clamp(g(f.sincerity)),
    bravery: clamp(100 - g(f.fearfulness)),
    risk_taking: clamp(mean(100 - g(f.prudence), 100 - g(f.fearfulness))),
    loyalty: clamp(mean(g(f.forgivingness), g(val.benevolence, 50), g(val.tradition, 50) * 0.5)),
    grudge: clamp(100 - g(f.forgivingness)),
    talkativeness: clamp(mean(g(f.sociability), g(f.liveliness))),
    greed: clamp(100 - g(f.greed_avoidance)),
    curiosity: clamp(g(f.inquisitiveness)),
    dominance_seeking: clamp(mean(g(f.social_boldness), g(val.power, 50))),
    stubbornness: clamp(100 - g(f.flexibility)),
  };
}

export function compileNpc(p, { lang = 'en' } = {}) {
  const L = en; // npc labels are en-only for now
  const w = behaviorWeights(p);
  const sections = [];

  sections.push(`# NPC — ${p.name}`);
  if (p.identity?.summary) sections.push(p.identity.summary.trim());

  const wbody = ['# BEHAVIOR WEIGHTS (0–100, for game/agent logic)'];
  for (const [k, v] of Object.entries(w)) {
    wbody.push(`- ${k.replace(/_/g, ' ').padEnd(18)} ${String(v).padStart(3)}`);
  }
  sections.push(wbody.join('\n'));

  // dialogue style: reuse the compact chat prompt
  const dialogue = compileChat(p, { lang, level: 'style', medium: 'npc' }).trim();
  sections.push('# DIALOGUE STYLE\n' + dialogue);

  // reactions from PAD triggers
  const reactions = (p.affect?.triggers ?? [])
    .map((t) => {
      const eff = renderEffect(L, t.effect ?? {});
      return eff ? `- when ${t.when}: ${eff}` : null;
    })
    .filter(Boolean);
  if (reactions.length) sections.push('# REACTIONS\n' + reactions.join('\n'));

  // quirks scoped to npc/universal
  const quirks = (p.quirks ?? [])
    .filter((q) => scopeOk(q.scope, lang, 'npc'))
    .map((q) => `- [${L.freq[q.frequency ?? 'sometimes']}] ${q.text.trim()}`);
  if (quirks.length) sections.push('# SIGNATURE BEHAVIORS\n' + quirks.join('\n'));

  // boundaries — never dropped
  const bounds = (p.boundaries ?? []).map((b) => `- ${b.trim()}`);
  if (bounds.length) sections.push('# HARD RULES\n' + bounds.join('\n') + '\n' + L.rulesNote);

  const note = compilationNote(p, 'npc');
  if (note) sections.push(note);

  return sections.join('\n\n') + '\n';
}
