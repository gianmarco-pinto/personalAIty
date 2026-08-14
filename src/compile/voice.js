// voice compiler: persona spec -> spoken-delivery profile (prosody parameters
// + a compact system prompt). Provider-neutral — emits abstract 0..100
// parameters and qualitative labels you map to your TTS engine (SSML rate/pitch,
// ElevenLabs stability/style, etc.).
//
// Prosody derivations follow the trait→speech-marker literature (extraversion →
// faster rate, wider pitch, fewer pauses; anxiety/low self-esteem → more
// hesitation; dominance → lower, steadier pitch). Heuristic but grounded.
import { flattenFacets } from '../facets.js';
import { compileChat } from './chat.js';
import { compilationNote } from './util.js';

const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));
const mean = (...xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const padNorm = (v) => (typeof v === 'number' ? (v + 100) / 2 : 50); // -100..100 → 0..100
const label3 = (v, [lo, mid, hi]) => (v <= 35 ? lo : v >= 65 ? hi : mid);

/** Derive prosody parameters (each 0..100) from the persona. */
export function prosodyParams(p) {
  const f = flattenFacets(p.traits);
  const v = p.voice ?? {};
  const a = p.affect ?? {};
  const bl = a.baseline ?? {};
  const g = (x, d = 50) => (typeof x === 'number' ? x : d);

  const arousal = padNorm(bl.arousal);
  const dominance = padNorm(bl.dominance);
  const expression = g(a.expression);

  return {
    // extraversion + arousal drive tempo; low verbosity clips it faster still
    pace: clamp(mean(g(f.liveliness), arousal, 100 - g(v.verbosity, 50) * 0.5)),
    // dominant, low-arousal voices sit lower and steadier
    pitch_height: clamp(mean(100 - dominance, 100 - arousal * 0.5)),
    // liveliness + how much inner state is shown = pitch movement
    pitch_variation: clamp(mean(g(f.liveliness), expression)),
    // prudence and low liveliness lengthen pauses
    pauses: clamp(mean(g(f.prudence), 100 - g(f.liveliness))),
    warmth: clamp(g(v.warmth_display)),
    // social boldness + dominance = vocal force
    intensity: clamp(mean(g(f.social_boldness), dominance)),
    // anxiety, low self-esteem, low displayed certainty = hesitation/fillers
    hesitation: clamp(mean(g(f.anxiety), 100 - g(f.social_self_esteem), 100 - g(v.certainty_display, 50))),
  };
}

export function compileVoice(p, { lang = 'en' } = {}) {
  const pr = prosodyParams(p);
  const sections = [];

  sections.push(`# VOICE — ${p.name}`);

  // reuse the compact chat prompt as the speaking persona
  const prompt = compileChat(p, { lang, level: 'style', medium: 'voice' }).trim();
  sections.push(prompt);

  const rows = [
    ['Pace', pr.pace, ['slow, deliberate', 'measured', 'brisk']],
    ['Pitch height', pr.pitch_height, ['low', 'mid', 'high']],
    ['Pitch variation', pr.pitch_variation, ['flat, even', 'moderate', 'expressive']],
    ['Pauses', pr.pauses, ['clipped, few', 'natural', 'long, frequent']],
    ['Warmth', pr.warmth, ['cool', 'neutral', 'warm']],
    ['Intensity', pr.intensity, ['soft', 'moderate', 'forceful']],
    ['Hesitation / fillers', pr.hesitation, ['none — fluent', 'occasional', 'frequent']],
  ];
  const body = ['# PROSODY (0–100; map to your TTS engine)'];
  for (const [name, val, labels] of rows) {
    body.push(`- ${name}: ${String(val).padStart(3)}  (${label3(val, labels)})`);
  }
  sections.push(body.join('\n'));

  const note = compilationNote(p, 'voice');
  if (note) sections.push(note);

  return sections.join('\n\n') + '\n';
}
