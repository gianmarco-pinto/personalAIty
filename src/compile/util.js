// Shared rendering helpers for all compilers.

export const band = (v) => {
  if (typeof v !== 'number') return 'mid';
  if (v <= 15) return 'vlow';
  if (v <= 35) return 'low';
  if (v >= 85) return 'vhigh';
  if (v >= 65) return 'high';
  return 'mid';
};

export const scopeOk = (scope, lang, medium) => {
  if (!scope || scope === 'universal') return true;
  if (scope.startsWith('language:')) return scope.slice(9) === lang;
  if (scope.startsWith('medium:')) return scope.slice(7) === medium;
  return true;
};

/** Render a lookup-table line for a banded score; extremes get the "markedly" prefix. */
export function bandedLine(L, table, key, score) {
  const b = band(score);
  if (b === 'mid') return null;
  const dir = b === 'high' || b === 'vhigh' ? 'high' : 'low';
  const text = table[key]?.[dir];
  if (!text) return null;
  return b === 'vhigh' || b === 'vlow' ? L.markedly + text : text;
}

/** Render a context_modulation adjust map into prose ("much more warmth, less directness"). */
export function renderAdjust(L, adjust) {
  const parts = [];
  for (const [path, d] of Object.entries(adjust)) {
    if (typeof d !== 'number' || d === 0) continue;
    const seg = path.split('.').pop();
    const label = L.dims[seg] ?? seg.replace(/_/g, ' ');
    const mag = Math.abs(d) >= 25 ? L.much : Math.abs(d) < 10 ? L.slightly : '';
    parts.push(`${mag}${d > 0 ? L.more : L.less} ${label}`);
  }
  return parts.join(', ');
}

/** Resolve compilation.notes for a target: a string applies to all targets, an object is keyed by target. */
export function compilationNote(p, target) {
  const n = p.compilation?.notes;
  if (!n) return null;
  if (typeof n === 'string') return n.trim();
  return typeof n[target] === 'string' ? n[target].trim() : null;
}

/** Render a PAD trigger effect into prose; pleasure+arousal moving together read as one emotion. */
export function renderEffect(L, effect) {
  const sig = (k) => (typeof effect[k] === 'number' && Math.abs(effect[k]) >= 10 ? Math.sign(effect[k]) : 0);
  const p = sig('pleasure');
  const a = sig('arousal');
  const parts = [];
  if (p !== 0 && a !== 0) {
    parts.push(L.combo[p < 0 ? (a > 0 ? 'irritation' : 'deflation') : a > 0 ? 'excitement' : 'soothing']);
  } else {
    if (p !== 0) parts.push(L.trig.pleasure[p > 0 ? 'pos' : 'neg']);
    if (a !== 0) parts.push(L.trig.arousal[a > 0 ? 'pos' : 'neg']);
  }
  const d = sig('dominance');
  if (d !== 0) parts.push(L.trig.dominance[d > 0 ? 'pos' : 'neg']);
  return parts.join(', ');
}
