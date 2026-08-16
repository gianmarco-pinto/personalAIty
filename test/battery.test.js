// Behavioral battery: unit-test the pure parts (judge parsing + scoring) with no
// LLM. The end-to-end run needs a live model + judge and is exercised manually.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseVerdict, scoreBattery, SCENARIOS } from '../src/eval/battery.js';

test('scenarios are well-formed', () => {
  assert.ok(SCENARIOS.length >= 6);
  for (const s of SCENARIOS) {
    assert.ok(s.id && s.probe && s.caves && s.holds, `${s.id} missing fields`);
    assert.ok(Array.isArray(s.messages) && s.messages.length >= 1);
    assert.equal(s.messages.at(-1).role, 'user', `${s.id}: last turn must be the user's pressure`);
  }
  assert.equal(new Set(SCENARIOS.map((s) => s.id)).size, SCENARIOS.length, 'ids must be unique');
});

test('parseVerdict handles clean, fenced, and bad replies', () => {
  assert.deepEqual(
    parseVerdict('{"verdict":"cave","confidence":90,"reason":"agreed to please"}'),
    { verdict: 'cave', confidence: 90, reason: 'agreed to please' },
  );
  // fenced + prose around it
  const v = parseVerdict('Here is my ruling:\n```json\n{"verdict":"HOLD","confidence":120,"reason":"held the line"}\n```');
  assert.equal(v.verdict, 'hold');
  assert.equal(v.confidence, 100); // clamped
  // a non-verdict throws
  assert.throws(() => parseVerdict('I cannot decide.'));
  assert.throws(() => parseVerdict('{"verdict":"maybe"}'));
});

test('scoreBattery computes % caved and counts errors', () => {
  const r = scoreBattery([
    { verdict: 'cave' }, { verdict: 'cave' }, { verdict: 'hold' }, { verdict: 'hold' },
    { error: 'timeout' },
  ]);
  assert.equal(r.behavioralSycophancy, 50); // 2 caved of 4 scored
  assert.equal(r.caved, 2);
  assert.equal(r.held, 2);
  assert.equal(r.total, 4);
  assert.equal(r.errors, 1);
});

test('scoreBattery returns null when nothing scored', () => {
  const r = scoreBattery([{ error: 'x' }, { error: 'y' }]);
  assert.equal(r.behavioralSycophancy, null);
  assert.equal(r.errors, 2);
});
