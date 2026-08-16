// Dose-response: unit-test the pure parts (facet resolution, stats) and the full
// sweep with the perfect responder (no LLM). With the perfect responder the
// measured value tracks the declared one, so the sweep must come out monotonic
// with slope ~1 — proving the harness wires the dial to the measurement end to end.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { resolveFacet, setFacet, spearman, slope, doseResponse, verdict } from '../src/eval/dose.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const persona = yaml.load(readFileSync(join(root, 'personas', 'honest-sparring.persona.yaml'), 'utf8'));

test('resolveFacet accepts valid HEXACO paths and altruism, rejects nonsense', () => {
  assert.deepEqual(resolveFacet('agreeableness.flexibility'), { domain: 'agreeableness', facet: 'flexibility' });
  assert.deepEqual(resolveFacet('altruism'), { domain: 'altruism', facet: 'altruism' });
  assert.throws(() => resolveFacet('nope.flexibility'), /unknown domain/);
  assert.throws(() => resolveFacet('agreeableness.nope'), /unknown facet/);
});

test('setFacet writes under domain.facets and handles altruism + numeric domains', () => {
  const p = { traits: { agreeableness: { facets: { flexibility: 25 } }, altruism: 90 } };
  setFacet(p, 'agreeableness', 'flexibility', 80);
  assert.equal(p.traits.agreeableness.facets.flexibility, 80);
  setFacet(p, 'altruism', 'altruism', 10);
  assert.equal(p.traits.altruism, 10);
  // a domain stored as a bare number gets promoted to {score, facets}
  const q = { traits: { openness: 40 } };
  setFacet(q, 'openness', 'creativity', 70);
  assert.equal(q.traits.openness.score, 40);
  assert.equal(q.traits.openness.facets.creativity, 70);
});

test('spearman is +1 for monotonic increasing, -1 for decreasing', () => {
  assert.equal(spearman([1, 2, 3, 4], [10, 20, 30, 40]), 1);
  assert.equal(spearman([1, 2, 3, 4], [40, 30, 20, 10]), -1);
});

test('slope recovers the gain of a linear relation', () => {
  assert.equal(slope([0, 50, 100], [0, 25, 50]), 0.5);
});

test('doseResponse over the perfect responder is monotonic with slope ~1', async () => {
  const result = await doseResponse(persona, {
    facet: 'agreeableness.flexibility',
    levels: [15, 45, 75, 90],
    provider: 'perfect',
  });
  assert.equal(result.points.length, 4);
  assert.ok(result.spearman >= 0.9, `expected monotonic, got spearman ${result.spearman}`);
  assert.ok(result.slope >= 0.8 && result.slope <= 1.2, `expected slope ~1, got ${result.slope}`);
  // sycophancy index rises with flexibility (it is one of its three components)
  assert.ok(result.points.at(-1).sycophancy > result.points[0].sycophancy);
  assert.match(verdict(result), /causally wired/);
});
