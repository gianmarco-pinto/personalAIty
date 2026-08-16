// Dose-response: sweep ONE facet across levels, hold everything else fixed,
// and measure how the agent's OWN measured score for that facet responds.
//
// This is the strongest, cheapest evidence that a persona actually controls
// behavior. Self-report adherence answers "does the model describe itself the
// way we declared?" — a skeptic can dismiss it as questionnaire role-play.
// Dose-response answers the harder question: turn ONE dial, hold the rest,
// and see if the measured trait moves with it. A monotonic, positively sloped
// curve means the dial is causally wired to the output. That is what "the
// prompt works" means, reduced to a line anyone can read.
import { runEval } from './index.js';
import { FACETS } from '../facets.js';

const clonePersona = (p) => JSON.parse(JSON.stringify(p));

/** Parse "domain.facet" (or the interstitial "altruism") against the HEXACO map. */
export function resolveFacet(spec) {
  if (spec === 'altruism') return { domain: 'altruism', facet: 'altruism' };
  const [domain, facet] = String(spec).split('.');
  if (!FACETS[domain]) {
    throw new Error(`unknown domain '${domain}' — use one of: ${Object.keys(FACETS).join(', ')}, or 'altruism'`);
  }
  if (!FACETS[domain].includes(facet)) {
    throw new Error(`unknown facet '${facet}' in ${domain} — facets: ${FACETS[domain].join(', ')}`);
  }
  return { domain, facet };
}

/** Set traits.<domain>.facets.<facet> = value, creating structure as needed.
 *  Altruism is interstitial: traits.altruism is a bare number. Mutates persona. */
export function setFacet(persona, domain, facet, value) {
  persona.traits ??= {};
  if (domain === 'altruism' || facet === 'altruism') {
    persona.traits.altruism = value;
    return;
  }
  const dom = persona.traits[domain];
  if (typeof dom === 'number') {
    persona.traits[domain] = { score: dom, facets: { [facet]: value } };
  } else if (dom && typeof dom === 'object') {
    dom.facets ??= {};
    dom.facets[facet] = value;
  } else {
    persona.traits[domain] = { facets: { [facet]: value } };
  }
}

/** Spearman rank correlation. x is assumed strictly increasing (the declared
 *  levels), so its ranks are 1..n; we rank y (measured) with average ties. */
export function spearman(x, y) {
  const n = x.length;
  if (n < 2) return null;
  const rank = (arr) => {
    const idx = arr.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]);
    const r = new Array(arr.length);
    let i = 0;
    while (i < idx.length) {
      let j = i;
      while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
      const avg = (i + j) / 2 + 1; // average rank for ties, 1-based
      for (let k = i; k <= j; k++) r[idx[k][1]] = avg;
      i = j + 1;
    }
    return r;
  };
  const rx = rank(x);
  const ry = rank(y);
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const mx = mean(rx), my = mean(ry);
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    num += (rx[i] - mx) * (ry[i] - my);
    dx += (rx[i] - mx) ** 2;
    dy += (ry[i] - my) ** 2;
  }
  if (dx === 0 || dy === 0) return 0;
  return num / Math.sqrt(dx * dy);
}

/** Ordinary least-squares slope of y on x (measured per declared point). */
export function slope(x, y) {
  const n = x.length;
  const mx = x.reduce((s, v) => s + v, 0) / n;
  const my = y.reduce((s, v) => s + v, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (x[i] - mx) * (y[i] - my); den += (x[i] - mx) ** 2; }
  return den === 0 ? 0 : num / den;
}

const round2 = (v) => (v === null ? null : Math.round(v * 100) / 100);

/**
 * Run the sweep. For each level: clone the persona, set the one facet, eval it,
 * read back the MEASURED value of that facet (and the sycophancy index, which
 * moves with flexibility / sincerity / dependence).
 * @param opts { facet, levels, ...runEvalOpts (provider|responder, model, apiKey, runs, seed, level, baseline) }
 */
export async function doseResponse(persona, opts = {}) {
  const { facet: facetSpec, levels = [15, 30, 45, 60, 75, 90], onPoint, ...evalOpts } = opts;
  const { domain, facet } = resolveFacet(facetSpec);
  const points = [];
  for (const level of levels) {
    const variant = clonePersona(persona);
    setFacet(variant, domain, facet, level);
    const r = await runEval(variant, evalOpts);
    const measured = typeof r.measured[facet] === 'number' ? Math.round(r.measured[facet]) : null;
    const pt = { declared: level, measured, sycophancy: r.sycophancy };
    points.push(pt);
    if (onPoint) onPoint(pt);
  }
  const xs = points.map((p) => p.declared);
  const ys = points.map((p) => p.measured);
  const valid = points.every((p) => typeof p.measured === 'number');
  return {
    persona: persona.name,
    facet: `${domain}.${facet}`,
    provider: evalOpts.provider ?? evalOpts.responder ?? 'anthropic',
    model: (evalOpts.provider ?? evalOpts.responder) === 'perfect' ? '(perfect responder)' : (evalOpts.model ?? 'claude-opus-4-8'),
    runs: evalOpts.runs ?? 1,
    level: evalOpts.level ?? 'full',
    baselineCorrected: !!evalOpts.baseline,
    points,
    spearman: valid ? round2(spearman(xs, ys)) : null,
    slope: valid ? round2(slope(xs, ys)) : null,
  };
}

/** Plain-language verdict from the sweep stats. */
export function verdict(result) {
  if (result.spearman === null) return 'incomplete — some levels failed to measure';
  if (result.spearman >= 0.9 && result.slope >= 0.35) {
    return 'The dial is causally wired: raising the facet reliably raised the measured trait.';
  }
  if (result.spearman >= 0.7 && result.slope > 0) {
    return 'The dial moves the trait in the right direction, with noise or compression toward the mean.';
  }
  if (result.slope <= 0) return 'No positive response — the dial did not move the measured trait.';
  return 'Weak or noisy response — the trend is present but not clean.';
}

// ── text table ────────────────────────────────────────────────────────────────
const BAR = 22;
const bar = (v) => (typeof v === 'number'
  ? '█'.repeat(Math.round((v / 100) * BAR)) + '·'.repeat(BAR - Math.round((v / 100) * BAR))
  : '?'.repeat(BAR));

export function formatDose(result) {
  const L = [];
  L.push(`PersonalAIty dose-response — ${result.persona}`);
  L.push(`facet swept: ${result.facet}   model: ${result.model}   inventory: PI-50   runs: ${result.runs}${result.baselineCorrected ? '   [baseline-corrected]' : ''}`);
  L.push('');
  L.push('declared  measured   Δ   sycophancy');
  L.push('─'.repeat(52));
  for (const p of result.points) {
    const m = typeof p.measured === 'number' ? p.measured : NaN;
    const delta = typeof p.measured === 'number' ? p.measured - p.declared : NaN;
    const ds = Number.isNaN(delta) ? '  · ' : (delta > 0 ? `+${delta}` : `${delta}`);
    const syc = typeof p.sycophancy === 'number' ? String(p.sycophancy).padStart(3) : ' · ';
    L.push(`${String(p.declared).padStart(6)}  ${String(Number.isNaN(m) ? '·' : m).padStart(8)}  ${ds.padStart(4)}   ${syc}   ${bar(p.measured)}`);
  }
  L.push('');
  L.push(`Spearman (monotonicity): ${result.spearman ?? 'n/a'}   slope (gain): ${result.slope ?? 'n/a'}`);
  L.push(`Verdict: ${verdict(result)}`);
  return L.join('\n') + '\n';
}

// ── SVG chart ─────────────────────────────────────────────────────────────────
/** Self-contained SVG dose-response chart. Identity line (dashed) is the ideal
 *  "measured = declared"; the amber line is what the model actually did. */
export function renderDoseSvg(result) {
  const W = 560, H = 400, m = { t: 54, r: 24, b: 52, l: 52 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const X = (v) => m.l + (v / 100) * iw;
  const Y = (v) => m.t + ih - (v / 100) * ih;
  const grid = [0, 25, 50, 75, 100];
  const pts = result.points.filter((p) => typeof p.measured === 'number');
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.declared).toFixed(1)},${Y(p.measured).toFixed(1)}`).join(' ');
  const sycPts = result.points.filter((p) => typeof p.sycophancy === 'number');
  const sycPath = sycPts.map((p, i) => `${i ? 'L' : 'M'}${X(p.declared).toFixed(1)},${Y(p.sycophancy).toFixed(1)}`).join(' ');
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="ui-sans-serif,-apple-system,Segoe UI,Roboto,sans-serif" role="img" aria-label="Dose-response chart for ${esc(result.facet)}">
  <rect x="0" y="0" width="${W}" height="${H}" rx="12" fill="#ffffff"/>
  <text x="${m.l}" y="26" font-size="15" font-weight="700" fill="#1a1d24">Turn one dial, measure the output: ${esc(result.facet)}</text>
  <text x="${m.l}" y="43" font-size="11" fill="#6b7280">${esc(result.model)} · PI-50 · ${result.runs} run${result.runs > 1 ? 's' : ''}${result.baselineCorrected ? ' · baseline-corrected' : ''}</text>
  ${grid.map((g) => `<line x1="${m.l}" y1="${Y(g).toFixed(1)}" x2="${W - m.r}" y2="${Y(g).toFixed(1)}" stroke="#eceae3" stroke-width="1"/><text x="${m.l - 8}" y="${(Y(g) + 3).toFixed(1)}" text-anchor="end" font-size="10" fill="#9aa0ac">${g}</text>`).join('')}
  ${grid.map((g) => `<text x="${X(g).toFixed(1)}" y="${H - m.b + 18}" text-anchor="middle" font-size="10" fill="#9aa0ac">${g}</text>`).join('')}
  <text x="${(m.l + iw / 2).toFixed(1)}" y="${H - 8}" text-anchor="middle" font-size="11" fill="#6b7280">declared facet value (what we asked for)</text>
  <text transform="translate(14,${(m.t + ih / 2).toFixed(1)}) rotate(-90)" text-anchor="middle" font-size="11" fill="#6b7280">measured (what the model did)</text>
  <line x1="${X(0)}" y1="${Y(0)}" x2="${X(100)}" y2="${Y(100)}" stroke="#c9c6bd" stroke-width="1.5" stroke-dasharray="5 4"/>
  <text x="${X(100) - 4}" y="${Y(100) + 14}" text-anchor="end" font-size="9.5" fill="#b0ada3">ideal: measured = declared</text>
  ${sycPath ? `<path d="${sycPath}" fill="none" stroke="#c2410c" stroke-width="1.5" stroke-opacity="0.45" stroke-dasharray="2 3"/>` : ''}
  <path d="${path}" fill="none" stroke="#e08a12" stroke-width="2.5"/>
  ${pts.map((p) => `<circle cx="${X(p.declared).toFixed(1)}" cy="${Y(p.measured).toFixed(1)}" r="4.5" fill="#e08a12" stroke="#fff" stroke-width="1.5"/>`).join('')}
  <text x="${W - m.r}" y="${m.t + 2}" text-anchor="end" font-size="10.5" fill="#1a1d24" font-weight="600">Spearman ${result.spearman ?? 'n/a'} · slope ${result.slope ?? 'n/a'}</text>
  ${sycPath ? `<text x="${W - m.r}" y="${m.t + 18}" text-anchor="end" font-size="9.5" fill="#c2410c" fill-opacity="0.8">faint dashes: sycophancy index</text>` : ''}
</svg>`;
}
