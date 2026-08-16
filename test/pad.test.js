// PAD runtime: pure state-machine tests, no I/O.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import {
  baselineMood, createMood, applyEffect, decay, step, moodOctant, intensity,
  displayedMood, withMood, matchTriggers, fireEvent, moodModulation, moodModulationNote,
} from '../src/runtime/pad.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const persona = yaml.load(readFileSync(join(root, 'personas', 'honest-sparring.persona.yaml'), 'utf8'));

test('createMood sits at the declared baseline', () => {
  assert.deepEqual(createMood(persona), { pleasure: 20, arousal: 10, dominance: 40 });
});

test('applyEffect scales the effect by reactivity and clamps to ±100', () => {
  // reactivity 50 → half the effect
  const m = applyEffect({ pleasure: 0, arousal: 0, dominance: 0 }, { pleasure: 40 }, { reactivity: 50 });
  assert.equal(m.pleasure, 20);
  // clamps at 100
  const hi = applyEffect({ pleasure: 90, arousal: 0, dominance: 0 }, { pleasure: 100 }, { reactivity: 100 });
  assert.equal(hi.pleasure, 100);
});

test('decay moves toward baseline and converges', () => {
  const base = { pleasure: 20, arousal: 10, dominance: 40 };
  let m = { pleasure: 100, arousal: 100, dominance: 100 };
  // recovery 100 closes the whole gap in one unit tick
  assert.deepEqual(decay(m, base, { recovery: 100, dt: 1 }), base);
  // partial recovery approaches but does not overshoot
  m = { pleasure: 100, arousal: 10, dominance: 40 };
  for (let i = 0; i < 50; i++) m = decay(m, base, { recovery: 40, dt: 1 });
  assert.ok(Math.abs(m.pleasure - base.pleasure) < 1);
});

test('step applies an effect then relaxes', () => {
  const m0 = createMood(persona); // reactivity 45, recovery 70
  const m1 = step(persona, m0, { effect: { pleasure: 30 } });
  // spiked by 30*0.45=13.5 to 33.5, then 70% of the way back toward 20 → ~24
  assert.ok(m1.pleasure > m0.pleasure && m1.pleasure < 33.5);
});

test('moodOctant names the eight octants and an even centre', () => {
  assert.equal(moodOctant({ pleasure: 40, arousal: 40, dominance: 40 }).name, 'Exuberant');
  assert.equal(moodOctant({ pleasure: -40, arousal: 40, dominance: 40 }).name, 'Hostile');
  assert.equal(moodOctant({ pleasure: -40, arousal: -40, dominance: -40 }).name, 'Bored');
  assert.equal(moodOctant({ pleasure: 2, arousal: -3, dominance: 5 }).name, 'Even');
});

test('displayedMood scales the deviation from baseline by expression', () => {
  const base = baselineMood(persona);
  const felt = { pleasure: 100, arousal: 10, dominance: 40 };
  // expression 60 → shows 60% of the deviation
  const shown = displayedMood(persona, felt);
  assert.equal(shown.pleasure, base.pleasure + (100 - base.pleasure) * 0.6);
  // expression 0 → nothing shows (always baseline)
  const flat = { ...persona, affect: { ...persona.affect, expression: 0 } };
  assert.deepEqual(displayedMood(flat, felt), baselineMood(flat));
});

test('withMood re-baselines a clone to the shown mood without mutating the source', () => {
  const felt = { pleasure: 100, arousal: 80, dominance: 40 };
  const p2 = withMood(persona, felt);
  assert.deepEqual(p2.affect.baseline, displayedMood(persona, felt));
  assert.deepEqual(persona.affect.baseline, { pleasure: 20, arousal: 10, dominance: 40 }); // untouched
});

test('matchTriggers / fireEvent route an event to the closest trigger', () => {
  const m = matchTriggers(persona, 'the user changed their mind after seeing the evidence');
  assert.ok(m.length >= 1);
  assert.match(m[0].trigger.when, /changes their mind/);
  const { mood, fired } = fireEvent(persona, createMood(persona), 'they changed their mind on the evidence');
  assert.ok(fired && mood.pleasure > createMood(persona).pleasure);
  // an unrelated event matches nothing
  assert.equal(fireEvent(persona, createMood(persona), 'the weather is nice today').fired, null);
});

test('moodModulation is zero at baseline and signed with the mood', () => {
  const base = createMood(persona);
  assert.deepEqual(moodModulation(persona, base), { warmth: 0, energy: 0, assertiveness: 0 });
  const happy = { ...base, pleasure: base.pleasure + 40 };
  assert.ok(moodModulation(persona, happy).warmth > 0); // pleasure up → warmer
  const down = { ...base, pleasure: base.pleasure - 40 };
  assert.ok(moodModulation(persona, down).warmth < 0);
});

test('moodModulationNote reads baseline as usual and deviations in plain words', () => {
  assert.equal(moodModulationNote({ warmth: 0, energy: 0, assertiveness: 0 }), 'at its usual delivery');
  assert.match(moodModulationNote({ warmth: 12, energy: 0, assertiveness: 0 }), /warmer than usual/);
  assert.match(moodModulationNote({ warmth: 12, energy: 12, assertiveness: 0 }), /warmer and quicker/);
});

test('intensity is 0 at origin and rises with distance', () => {
  assert.equal(intensity({ pleasure: 0, arousal: 0, dominance: 0 }), 0);
  assert.ok(intensity({ pleasure: 100, arousal: 100, dominance: 100 }) === 100);
});
