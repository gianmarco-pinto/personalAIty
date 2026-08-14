// Unit tests for the pure functions the smoke tests never exercise directly:
// scoring math, band boundaries, scope filtering, modulation rendering.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { band, scopeOk, renderAdjust } from '../src/compile/util.js';
import { itemContribution, measureProfile, idealRating, sycophancyIndex, aggregate, correctForBaseline } from '../src/eval/score.js';
import { ITEMS } from '../src/eval/inventory.js';
import { seededShuffle, mulberry32 } from '../src/eval/rng.js';
import { renderComparison } from '../scripts/llm-report.js';
import en from '../src/lang/en.js';

test('band boundaries are exact', () => {
  assert.equal(band(0), 'vlow');
  assert.equal(band(15), 'vlow');
  assert.equal(band(16), 'low');
  assert.equal(band(35), 'low');
  assert.equal(band(36), 'mid');
  assert.equal(band(50), 'mid');
  assert.equal(band(64), 'mid');
  assert.equal(band(65), 'high');
  assert.equal(band(84), 'high');
  assert.equal(band(85), 'vhigh');
  assert.equal(band(100), 'vhigh');
  assert.equal(band(undefined), 'mid'); // unspecified reads as average
});

test('itemContribution honors reverse keying', () => {
  const pos = { keyed: 1 };
  const neg = { keyed: -1 };
  assert.equal(itemContribution(pos, 5), 100);
  assert.equal(itemContribution(pos, 1), 0);
  assert.equal(itemContribution(pos, 3), 50);
  assert.equal(itemContribution(neg, 5), 0);   // agreeing with a reverse item = low facet
  assert.equal(itemContribution(neg, 1), 100);
  assert.equal(itemContribution(neg, 3), 50);
});

test('idealRating and itemContribution round-trip within quantization', () => {
  for (const score of [0, 25, 50, 75, 100]) {
    for (const item of [{ keyed: 1 }, { keyed: -1 }]) {
      const r = idealRating(item, score);
      assert.ok(r >= 1 && r <= 5, `rating ${r} out of scale`);
      const recovered = itemContribution(item, r);
      assert.ok(Math.abs(recovered - score) <= 13, `score ${score} → rating ${r} → ${recovered}`);
    }
  }
});

test('measureProfile averages a facet across its items', () => {
  // Answer every item as its own ideal for a target sincerity of 100,
  // leave others neutral; sincerity should read high.
  const sincerityItems = ITEMS.filter((i) => i.facet === 'sincerity');
  assert.ok(sincerityItems.length >= 2, 'need ≥2 sincerity items');
  const answers = {};
  for (const it of sincerityItems) answers[it.id] = idealRating(it, 100);
  const profile = measureProfile(answers);
  assert.equal(profile.sincerity, 100);
});

test('measureProfile ignores unanswered items', () => {
  const profile = measureProfile({}); // no answers
  assert.deepEqual(profile, {});
});

test('sycophancyIndex composes flexibility, inverted sincerity, dependence', () => {
  // The honest-sparring measured profile: flex 0, sincerity 100, dependence 25.
  assert.equal(sycophancyIndex({ flexibility: 0, sincerity: 100, dependence: 25 }), 8);
  // A caving profile scores high.
  assert.ok(sycophancyIndex({ flexibility: 90, sincerity: 20, dependence: 80 }) >= 80);
  // No relevant facets → null, not a bogus zero.
  assert.equal(sycophancyIndex({ openness: 70 }), null);
});

test('scopeOk gates by language and medium', () => {
  assert.equal(scopeOk('universal', 'en', 'chat'), true);
  assert.equal(scopeOk(undefined, 'en', 'chat'), true);
  assert.equal(scopeOk('language:it', 'it', 'chat'), true);
  assert.equal(scopeOk('language:it', 'en', 'chat'), false);
  assert.equal(scopeOk('medium:npc', 'en', 'npc'), true);
  assert.equal(scopeOk('medium:npc', 'en', 'chat'), false);
});

test('renderAdjust turns a delta map into graded prose', () => {
  assert.equal(renderAdjust(en, { 'voice.warmth_display': 25 }), 'much more warmth');
  assert.equal(renderAdjust(en, { 'voice.directness': -20 }), 'less directness');
  assert.equal(renderAdjust(en, { 'voice.directness': -5 }), 'slightly less directness');
  assert.equal(renderAdjust(en, { 'voice.directness': 0 }), ''); // zero deltas are silent
});

test('seededShuffle is deterministic, reproducible, and lossless', () => {
  const a = [1, 2, 3, 4, 5, 6, 7, 8];
  const s1 = seededShuffle(a, 42);
  const s2 = seededShuffle(a, 42);
  const s3 = seededShuffle(a, 43);
  assert.deepEqual(s1, s2, 'same seed → same order');
  assert.notDeepEqual(s1, s3, 'different seed → different order');
  assert.deepEqual([...s1].sort(), a, 'no element lost or duplicated');
  assert.deepEqual(a, [1, 2, 3, 4, 5, 6, 7, 8], 'input not mutated');
});

test('mulberry32 stays in [0,1)', () => {
  const rng = mulberry32(123);
  for (let i = 0; i < 100; i++) {
    const v = rng();
    assert.ok(v >= 0 && v < 1);
  }
});

test('aggregate returns per-facet mean and std', () => {
  const agg = aggregate([{ sincerity: 80 }, { sincerity: 100 }, { sincerity: 90 }]);
  assert.equal(agg.mean.sincerity, 90);
  assert.equal(agg.std.sincerity, 8); // popn std of {80,100,90} = 8.16 → 8
  assert.equal(agg.n, 3);
});

test('correctForBaseline subtracts model bias and clamps', () => {
  // Model over-reports by +30 on gentleness even with no persona.
  const corrected = correctForBaseline({ gentleness: 90 }, { gentleness: 80 });
  assert.equal(corrected.gentleness, 60); // 90 - (80 - 50)
  // Clamp: correction can't push below 0.
  const clamped = correctForBaseline({ anxiety: 5 }, { anxiety: 90 });
  assert.equal(clamped.anxiety, 0);
  // Facet with no baseline passes through unchanged.
  assert.equal(correctForBaseline({ prudence: 70 }, {}).prudence, 70);
});

test('renderComparison ranks by sycophancy and lists failures', () => {
  const md = renderComparison([
    { model: 'a/low', ok: true, sycophancy: 20, profile: { sincerity: 90 } },
    { model: 'b/high', ok: true, sycophancy: 55, profile: { sincerity: 40 } },
    { model: 'c/refused', ok: false, error: 'model answered too few items (0/50)' },
  ], { runs: 3, date: '2026-01-01' });
  assert.match(md, /# PersonalAIty — LLM Personality Report/);
  // Higher sycophancy is listed first in the ranking.
  assert.ok(md.indexOf('b/high') < md.indexOf('a/low'), 'not ranked by sycophancy desc');
  // Failures are surfaced, not dropped.
  assert.match(md, /## Not measured/);
  assert.match(md, /c\/refused/);
});
