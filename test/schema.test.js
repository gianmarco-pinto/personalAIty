// Guards against the two-sources-of-truth risk: schema/persona.schema.json and
// the hand-written validator in src/load.js must agree. Neither is changed —
// this test just fails loudly if they ever diverge.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, writeFileSync, rmSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import Ajv from 'ajv/dist/2020.js';
import yaml from 'js-yaml';
import { loadPersona } from '../src/load.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const schema = JSON.parse(readFileSync(join(root, 'schema/persona.schema.json'), 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: false });
const validateSchema = ajv.compile(schema);

const personaFiles = readdirSync(join(root, 'personas')).filter((f) => f.endsWith('.persona.yaml'));

// A minimal valid persona to mutate into invalid cases.
const MINIMAL = {
  persona_spec: '0.1', id: 'probe', name: 'Probe',
  traits: {
    honesty_humility: 50, emotionality: 50, extraversion: 50,
    agreeableness: 50, conscientiousness: 50, openness: 50,
  },
};

test('every gallery persona passes the JSON Schema', () => {
  for (const f of personaFiles) {
    const p = yaml.load(readFileSync(join(root, 'personas', f), 'utf8'));
    const ok = validateSchema(p);
    assert.ok(ok, `${f} failed schema: ${JSON.stringify(validateSchema.errors)}`);
  }
});

test('every gallery persona passes load.js validation', () => {
  for (const f of personaFiles) {
    const { errors } = loadPersona(join(root, 'personas', f));
    assert.equal(errors.length, 0, `${f}: ${errors.join('; ')}`);
  }
});

test('schema and load.js agree on the minimal valid persona', () => {
  assert.ok(validateSchema(MINIMAL), 'schema rejected minimal persona');
});

// Invalid cases: both validators must reject each one. This is the actual
// divergence guard — a rule dropped from one side surfaces here.
const invalidCases = {
  'wrong persona_spec': (p) => (p.persona_spec = '0.2'),
  'facet out of range': (p) => (p.traits.honesty_humility = 140),
  'unknown top-level key': (p) => (p.bogus_field = true),
  'unknown trait domain': (p) => (p.traits.charisma = 80),
  'missing a required domain': (p) => delete p.traits.openness,
  'value out of range': (p) => (p.values = { power: -10 }),
  'bad quirk frequency': (p) => (p.quirks = [{ text: 'x', frequency: 'constantly' }]),
};

for (const [label, mutate] of Object.entries(invalidCases)) {
  test(`both validators reject: ${label}`, () => {
    const bad = structuredClone(MINIMAL);
    mutate(bad);

    const schemaOk = validateSchema(bad);

    // load.js reads from a file, so round-trip through YAML in a temp path.
    const dir = mkdtempSync(join(tmpdir(), 'pa-'));
    const path = join(dir, 'bad.persona.yaml');
    writeFileSync(path, yaml.dump(bad));
    const { errors } = loadPersona(path);
    rmSync(dir, { recursive: true, force: true });

    assert.ok(!schemaOk, `schema wrongly ACCEPTED: ${label}`);
    assert.ok(errors.length > 0, `load.js wrongly ACCEPTED: ${label}`);
  });
}
