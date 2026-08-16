// PAD runtime: a live emotional state for persistent embodiments (companions,
// NPCs, robots). Pure and browser-safe.
//
// The persona's `affect` block declares four things this module runs:
//   baseline    resting mood {pleasure, arousal, dominance}, each -100..100
//   reactivity  0..100, how strongly an event's effect moves the mood
//   recovery    0..100, the fraction of the gap to baseline closed per tick
//   expression  0..100, how much of the felt mood actually shows outward
//
// The integration back into behavior needs no new mapping: the voice/npc/robot
// compilers already derive prosody and behavior from affect.baseline, so
// `withMood` simply moves that baseline to the currently-shown mood and lets the
// existing compilers re-render. A robot that just heard bad news recompiles to a
// cooler voice on its own.

const AXES = ['pleasure', 'arousal', 'dominance'];
const num = (v, d = 0) => (typeof v === 'number' ? v : d);
const clampPAD = (v) => Math.max(-100, Math.min(100, v));
const clone = (o) => JSON.parse(JSON.stringify(o));

export function baselineMood(persona) {
  const bl = persona.affect?.baseline ?? {};
  return { pleasure: num(bl.pleasure), arousal: num(bl.arousal), dominance: num(bl.dominance) };
}

/** Fresh mood sitting at the persona's baseline. */
export function createMood(persona) {
  return baselineMood(persona);
}

/** Apply an event's effect, scaled by reactivity. Returns a NEW mood. */
export function applyEffect(mood, effect, { reactivity = 50 } = {}) {
  const k = reactivity / 100;
  const out = { ...mood };
  for (const ax of AXES) {
    if (typeof effect?.[ax] === 'number') out[ax] = clampPAD(out[ax] + effect[ax] * k);
  }
  return out;
}

/** Relax the mood toward baseline. recovery/100 is the fraction of the remaining
 *  gap closed per unit time; dt lets a UI tick in small, smooth steps. */
export function decay(mood, baseline, { recovery = 50, dt = 1 } = {}) {
  const a = Math.max(0, Math.min(1, (recovery / 100) * dt));
  const out = {};
  for (const ax of AXES) out[ax] = clampPAD(mood[ax] + (baseline[ax] - mood[ax]) * a);
  return out;
}

/** One tick: optionally apply an effect, then decay toward baseline. */
export function step(persona, mood, { effect = null, dt = 1 } = {}) {
  const reactivity = num(persona.affect?.reactivity, 50);
  const recovery = num(persona.affect?.recovery, 50);
  let m = mood;
  if (effect) m = applyEffect(m, effect, { reactivity });
  return decay(m, baselineMood(persona), { recovery, dt });
}

// ── labelling: the classic PAD emotion octants (Mehrabian & Russell) ──────────
const OCTANTS = {
  '+++': { name: 'Exuberant', delivery: 'bright, quick, expansive' },
  '++-': { name: 'Dependent', delivery: 'eager, warm, seeking reassurance' },
  '+-+': { name: 'Relaxed', delivery: 'warm, easy, unhurried' },
  '+--': { name: 'Docile', delivery: 'gentle, soft, compliant' },
  '-++': { name: 'Hostile', delivery: 'sharp, clipped, forceful' },
  '-+-': { name: 'Anxious', delivery: 'tense, hurried, hedging' },
  '--+': { name: 'Disdainful', delivery: 'cool, flat, dismissive' },
  '---': { name: 'Bored', delivery: 'flat, slow, disengaged' },
};

/** Name the current mood. Within `dead` of the origin on every axis reads as even. */
export function moodOctant(mood, dead = 8) {
  if (AXES.every((ax) => Math.abs(mood[ax]) <= dead)) {
    return { name: 'Even', delivery: 'level, composed, unremarkable', key: '000' };
  }
  const key = AXES.map((ax) => (mood[ax] >= 0 ? '+' : '-')).join('');
  return { ...OCTANTS[key], key };
}

/** Overall magnitude of the mood (0..100), the distance from a neutral origin. */
export function intensity(mood) {
  const d = Math.sqrt(AXES.reduce((s, ax) => s + mood[ax] ** 2, 0)) / Math.sqrt(3 * 100 ** 2);
  return Math.round(d * 100);
}

/** What actually shows: the felt deviation from baseline, scaled by expression. */
export function displayedMood(persona, mood) {
  const base = baselineMood(persona);
  const expr = num(persona.affect?.expression, 50) / 100;
  const out = {};
  for (const ax of AXES) out[ax] = clampPAD(base[ax] + (mood[ax] - base[ax]) * expr);
  return out;
}

/** A persona clone whose affect.baseline is the currently-shown mood, so the
 *  existing voice/npc/robot compilers re-render coloured by the live state. */
export function withMood(persona, mood) {
  const p = clone(persona);
  p.affect = p.affect ?? {};
  p.affect.baseline = displayedMood(persona, mood);
  return p;
}

// ── naive trigger matching (host apps should replace with real event routing) ─
const STOP = new Set(['the', 'a', 'an', 'of', 'to', 'is', 'in', 'on', 'or', 'and', 'as', 'it',
  'user', 'someone', 'their', 'them', 'they', 'with', 'for', 'when', 'genuinely', 'real']);
const words = (s) => String(s).toLowerCase().match(/[a-z]+/g)?.filter((w) => w.length > 2 && !STOP.has(w)) ?? [];

/** Score each trigger by keyword overlap with the event text; return matches
 *  above `threshold`, best first. Deliberately simple, meant to be swapped out. */
export function matchTriggers(persona, eventText, { threshold = 1 } = {}) {
  const ev = new Set(words(eventText));
  return (persona.affect?.triggers ?? [])
    .map((t, i) => ({ trigger: t, index: i, score: words(t.when).filter((w) => ev.has(w)).length }))
    .filter((m) => m.score >= threshold)
    .sort((a, b) => b.score - a.score);
}

/** Match an event to the persona's triggers and apply the best one. Returns
 *  { mood, fired } where fired is the trigger applied (or null if none matched). */
export function fireEvent(persona, mood, eventText) {
  const [best] = matchTriggers(persona, eventText);
  if (!best) return { mood, fired: null };
  const reactivity = num(persona.affect?.reactivity, 50);
  return { mood: applyEffect(mood, best.trigger.effect, { reactivity }), fired: best.trigger };
}
