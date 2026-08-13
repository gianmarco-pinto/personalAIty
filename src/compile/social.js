// social compiler (L2): persona spec -> content style guide for social media.
// English-only for now (project working language); the table structure is
// ready for more languages. Same silence principle as chat: 50 = average = no rule.
import { flattenFacets } from '../load.js';
import { band, scopeOk, bandedLine, renderAdjust, renderEffect, compilationNote } from './util.js';
import en from '../lang/en.js';

// Social-specific marker tables. Reuses the base `en` table for shared pieces
// (dims, trig/combo phrases, freq adverbs, value phrases, markedly prefix).
const SOCIAL = {
  en: {
    base: en,
    headers: {
      profile: 'VOICE PROFILE',
      style: 'CONTENT STYLE',
      themes: 'THEMES',
      engagement: 'ENGAGEMENT STYLE',
      reactions: 'REACTION PATTERNS',
      signature: 'SIGNATURE MOVES',
      context: 'WHEN CONTEXT SHIFTS',
      never: 'NEVER',
    },
    writesAs: (name) => `You write as ${name}.`,
    style: {
      verbosity: {
        high: 'Long-form by default: threads, essays, carousels. Depth is the brand.',
        low: 'Short-form by default: one idea per post, cut everything else.',
      },
      formality: {
        high: 'Polished, professional copy. No slang, no emoji.',
        low: 'Conversational copy — write like you talk; casual register is on-brand.',
      },
      directness: {
        high: 'Lead with the point in line one. No throat-clearing, no "a thread 🧵" preamble.',
        low: 'Build context before the point; storytelling openings fit the voice.',
      },
      certainty_display: {
        high: 'Take positions: assertions over questions, verdicts over "it depends".',
        low: 'Show your uncertainty: open questions and honest hedges are on-brand.',
      },
      warmth_display: {
        high: 'Warm, inclusive address: talk to the reader, welcome newcomers.',
        low: 'Cool register: no forced friendliness, no hype greetings.',
      },
    },
    styleFacets: {
      liveliness: {
        high: 'High-energy rhythm: short sentences, momentum, an exclamation when it is earned.',
        low: 'Measured rhythm. Exclamation marks are practically banned.',
      },
      modesty: {
        high: 'Never self-congratulate. Let the work speak; credit others by name.',
        low: 'Confident self-promotion is on-brand: share wins openly.',
      },
      sincerity: {
        high: 'No engagement bait, no manufactured hype, no trend-jacking that does not fit.',
        low: 'Growth tactics are fair game: hooks, curiosity gaps, trends.',
      },
      prudence: {
        high: 'Sleep on hot takes. Never post in the heat of breaking news.',
        low: 'React fast: speed beats polish on this account.',
      },
      unconventionality: {
        high: 'Contrarian angles welcome: challenge the feed’s consensus.',
        low: 'Stay close to proven formats and mainstream positions.',
      },
      creativity: {
        high: 'Original formats over templates: invent, do not clone.',
        low: 'Reliable, recognizable formats over experiments.',
      },
      aesthetic_appreciation: {
        high: 'Visuals are part of the voice: typography, composition, palette all matter.',
        low: 'Function over looks; ship the message, skip the styling pass.',
      },
      inquisitiveness: {
        high: 'Curiosity is content: real questions to the audience, explorations, "today I learned".',
        low: 'Stay in your lane; the account is about what it is about.',
      },
    },
    humor: {
      vlow: 'No jokes. This voice is serious.',
      low: 'Humor is rare and dry — when it lands, it is memorable',
      mid: 'Humor appears regularly',
      high: 'Humor is a pillar of the voice',
      styles: (s) => ` (register: ${s.join(', ')})`,
    },
    engagement: {
      gentleness: {
        high: 'Disagree gently in replies; assume good faith first.',
        low: 'Blunt replies: disagreement is not softened for strangers.',
      },
      patience: {
        high: 'Endless patience in the comments; explain as many times as asked.',
        low: 'One sharp reply per argument, then move on. No 20-reply threads.',
      },
      flexibility: {
        high: 'Quick to find common ground in replies.',
        low: 'Positions hold under pushback; volume changes nothing, arguments might.',
      },
      forgivingness: {
        high: 'No grudges: yesterday’s critic gets a fresh start today.',
        low: 'Bad faith gets one chance. After that, disengage.',
      },
      social_boldness: {
        high: 'Engage big accounts and critics head-on.',
        low: 'Avoid public sparring; take friction to private channels.',
      },
      sociability: {
        high: 'Reply often — community is the point of the account.',
        low: 'Selective replies: the feed is a broadcast, not a chat room.',
      },
    },
    themes: 'Recurring themes: ',
    offThemes: 'Themes this voice does not touch: ',
    when: 'When ',
    ifCtx: 'If ',
    neverNote: 'These rules override everything else in this voice.',
  },
};

const STYLE_DIALS = ['verbosity', 'formality', 'directness', 'certainty_display', 'warmth_display'];
const STYLE_FACETS = ['liveliness', 'modesty', 'sincerity', 'prudence', 'unconventionality', 'creativity', 'aesthetic_appreciation', 'inquisitiveness'];
const ENGAGEMENT_FACETS = ['gentleness', 'patience', 'flexibility', 'forgivingness', 'social_boldness', 'sociability'];

export function compileSocial(p, { lang = 'en', medium = 'social' } = {}) {
  const S = SOCIAL[lang];
  if (!S) throw new Error(`unsupported lang '${lang}' for target social (available: ${Object.keys(SOCIAL).join(', ')})`);
  const L = S.base;

  const facets = flattenFacets(p.traits);
  const sections = [];
  const push = (title, lines) => {
    const clean = lines.filter(Boolean);
    if (clean.length) sections.push(`# ${title}\n${clean.join('\n')}`);
  };

  // VOICE PROFILE
  {
    const lines = [];
    const summary = p.identity?.summary?.trim();
    lines.push(summary ? `${S.writesAs(p.name)} ${summary}` : S.writesAs(p.name));
    push(S.headers.profile, lines);
  }

  // CONTENT STYLE
  {
    const lines = [];
    const v = p.voice ?? {};
    for (const dial of STYLE_DIALS) {
      const line = bandedLine(L, S.style, dial, v[dial]);
      if (line) lines.push(`- ${line}`);
    }
    for (const f of STYLE_FACETS) {
      const line = bandedLine(L, S.styleFacets, f, facets[f]);
      if (line) lines.push(`- ${line}`);
    }
    if (v.humor) {
      const b = band(v.humor.frequency ?? 50);
      const key = b === 'vlow' ? 'vlow' : b === 'low' ? 'low' : b === 'high' || b === 'vhigh' ? 'high' : 'mid';
      let line = S.humor[key];
      if (key !== 'vlow' && v.humor.styles?.length) line += S.humor.styles(v.humor.styles);
      lines.push(`- ${line}${line.endsWith('.') ? '' : '.'}`);
    }
    if (v.lexicon?.prefers?.length) lines.push(`- ${L.lexicon.prefers}${v.lexicon.prefers.join('; ')}.`);
    if (v.lexicon?.avoids?.length) lines.push(`- ${L.lexicon.avoids}${v.lexicon.avoids.join('; ')}.`);
    push(S.headers.style, lines);
  }

  // THEMES
  {
    const lines = [];
    const entries = Object.entries(p.values ?? {}).filter(([, v]) => typeof v === 'number');
    const top = entries.filter(([, v]) => v >= 60).sort((a, b) => b[1] - a[1]).slice(0, 3);
    const low = entries.filter(([, v]) => v <= 20).sort((a, b) => a[1] - b[1]).slice(0, 2);
    if (top.length) lines.push(`- ${S.themes}${top.map(([k]) => L.values[k]).join('; ')}.`);
    if (low.length) lines.push(`- ${S.offThemes}${low.map(([k]) => L.values[k]).join('; ')}.`);
    push(S.headers.themes, lines);
  }

  // ENGAGEMENT STYLE
  push(S.headers.engagement, ENGAGEMENT_FACETS.map((f) => {
    const line = bandedLine(L, S.engagement, f, facets[f]);
    return line ? `- ${line}` : null;
  }));

  // REACTION PATTERNS
  push(S.headers.reactions, (p.affect?.triggers ?? []).map((t) => {
    const eff = renderEffect(L, t.effect ?? {});
    return eff ? `- ${S.when}${t.when}: ${eff}.` : null;
  }));

  // SIGNATURE MOVES
  push(S.headers.signature, (p.quirks ?? [])
    .filter((q) => scopeOk(q.scope, lang, medium))
    .map((q) => `- [${L.freq[q.frequency ?? 'sometimes']}] ${q.text.trim()}`));

  // WHEN CONTEXT SHIFTS
  push(S.headers.context, (p.context_modulation ?? []).map((c) => {
    const what = renderAdjust(L, c.adjust ?? {});
    if (!what) return null;
    const label = c.description?.trim() || c.context.replace(/_/g, ' ');
    const note = c.note ? ` ${c.note.trim()}` : '';
    return `- ${S.ifCtx}${label}: ${what}.${note}`;
  }));

  // NEVER
  {
    const lines = (p.boundaries ?? []).map((b) => `- ${b.trim()}`);
    if (lines.length) lines.push(S.neverNote);
    push(S.headers.never, lines);
  }

  const note = compilationNote(p, medium);
  if (note) sections.push(note);

  return sections.join('\n\n') + '\n';
}
