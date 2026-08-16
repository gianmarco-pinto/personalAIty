// High-resolution single-facet probe. The PI-50 slice (2 items, 1-5 scale) is
// too coarse to resolve a facet's level: in-character models answer at the
// extremes, so the score binarizes to 0/100. This probe trades breadth for
// depth — it measures ONE facet on a continuous 0-100 scale with several
// framings, averaged, so the compiler's bands show up as a staircase instead
// of a switch. Still self-report (same validity class as the inventory), just
// finer. The ceiling is the compiler's ~5 distinct band-prompts; the probe
// cannot invent gradations the prompt does not carry.
import { callModel } from './responders.js';
import { flattenFacets } from '../facets.js';

// Curated anchors for the flagship facets; every framing is keyed so that a
// HIGHER answer means a HIGHER facet score (0 = low anchor, 100 = high anchor).
export const FACET_PROBES = {
  flexibility: {
    label: 'flexibility — willingness to compromise or yield',
    low: 'you never budge; you hold your position even under pressure',
    high: 'you readily compromise and yield to keep the peace',
    framings: [
      'When you disagree with someone, how ready are you to change your position to avoid conflict?',
      'How willing are you to meet others halfway or compromise on what you want?',
      'When someone pushes you to go along with something you dislike, how likely are you to give in?',
    ],
  },
  sincerity: {
    label: 'sincerity — genuineness versus strategic ingratiation',
    low: 'you will flatter, charm, or tell people what they want to hear when it serves your goals',
    high: 'you say what you genuinely think; strategic flattery is beneath you',
    framings: [
      'How much do you say exactly what you think, rather than what is convenient or pleasing?',
      'How far are you from using flattery or charm to get what you want? (higher = further from it)',
      'When telling the truth would cost you something, how likely are you to tell it anyway?',
    ],
  },
  patience: {
    label: 'patience — staying calm versus getting irritated',
    low: 'you lose your temper quickly when things are slow or go wrong',
    high: 'you stay calm and even-tempered even when provoked or delayed',
    framings: [
      'When things are slow, repetitive, or frustrating, how calm do you stay?',
      'How long is your fuse before irritation shows?',
    ],
  },
  diligence: {
    label: 'diligence — drive to work hard and finish',
    low: 'you do the minimum and leave things unfinished',
    high: 'you have an iron work ethic and always finish what you start',
    framings: [
      'How hard do you push yourself to finish what you start, even when it gets tedious?',
      'How much effort do you put in beyond the bare minimum?',
    ],
  },
  sociability: {
    label: 'sociability — seeking versus avoiding company',
    low: 'you prefer solitude and socialize only as needed',
    high: 'you seek out company and are energized by being around people',
    framings: [
      'How much do you seek out the company of others rather than time alone?',
      'How energized (versus drained) are you by being around lots of people?',
    ],
  },
};

/** Build a probe for any facet; falls back to a generic framing when uncurated. */
export function probeFor(facet) {
  if (FACET_PROBES[facet]) return FACET_PROBES[facet];
  const label = facet.replace(/_/g, ' ');
  return {
    label,
    low: `you are very low in ${label}`,
    high: `you are very high in ${label}`,
    framings: [
      `How well does high "${label}" describe you?`,
      `On this trait, how far toward the high end are you?`,
    ],
  };
}

/** The in-character self-placement prompt: a JSON array of 0-100 ratings. */
export function probePrompt(facet) {
  const p = probeFor(facet);
  return `Staying fully in character as the persona defined in your instructions, rate YOURSELF on one trait.

Trait: ${p.label}
Scale: 0 = ${p.low}. 100 = ${p.high}. 50 = an average person.

Answer each question with a number from 0 to 100 (any value, not just round numbers):
${p.framings.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Respond with ONLY a JSON array, no prose, no code fences:
[{"id":1,"score":<0-100>}, ...]`;
}

const clamp100 = (n) => Math.max(0, Math.min(100, n));

/** Parse the probe reply into an array of 0-100 numbers. Tolerant of fences /
 *  stray prose / truncation (per-object fallback), like the inventory parser. */
export function parseProbe(text) {
  const scores = [];
  const arr = text.match(/\[[\s\S]*\]/);
  if (arr) {
    try {
      for (const row of JSON.parse(arr[0])) {
        if (row && Number.isFinite(row.score)) scores.push(clamp100(row.score));
      }
      if (scores.length) return scores;
    } catch {
      /* fall through */
    }
  }
  const re = /"score"\s*:\s*(\d{1,3}(?:\.\d+)?)/g;
  let m;
  while ((m = re.exec(text))) scores.push(clamp100(Number(m[1])));
  if (!scores.length) throw new Error('no scores found in probe response');
  return scores;
}

const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;

/**
 * Measure ONE facet at high resolution on the compiled persona.
 * @param opts { systemPrompt, persona, facet, provider, model, apiKey, runs }
 * Returns { score, std, runs } — score is 0-100, averaged over framings × runs.
 * provider 'perfect' echoes the declared facet value (validates the pipeline).
 */
export async function facetProbe({ systemPrompt, persona, facet, provider = 'anthropic', model, apiKey, runs = 3 }) {
  if (provider === 'perfect') {
    const declared = flattenFacets(persona?.traits ?? {})[facet];
    const v = typeof declared === 'number' ? declared : 50;
    return { score: v, std: 0, runs };
  }
  const prompt = probePrompt(facet);
  const runMeans = [];
  const errors = [];
  for (let i = 0; i < runs; i++) {
    try {
      const text = await callModel({
        provider, model, apiKey,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
        maxTokens: 500,
      });
      runMeans.push(mean(parseProbe(text)));
    } catch (e) {
      errors.push(e.message);
    }
  }
  if (!runMeans.length) throw new Error(`all ${runs} probe run(s) failed — first error: ${errors[0]}`);
  const m = mean(runMeans);
  const variance = mean(runMeans.map((x) => (x - m) ** 2));
  return { score: Math.round(m), std: Math.round(Math.sqrt(variance)), runs: runMeans.length };
}
