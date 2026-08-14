// Unit tests for the pure functions the smoke tests never exercise directly:
// scoring math, band boundaries, scope filtering, modulation rendering.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { band, scopeOk, renderAdjust } from '../src/compile/util.js';
import { itemContribution, measureProfile, idealRating, sycophancyIndex } from '../src/eval/score.js';
import { ITEMS } from '../src/eval/inventory.js';
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
