// Regenerates demo/personas.js from personas/*.persona.yaml (single source of truth).
// Run: npm run build:demo
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'personas');
const ORDER = ['honest-sparring', 'gruff-heart-of-gold', 'brilliant-cynic', 'warm-companion', 'demanding-coach', 'impeccable-professional'];

const personas = readdirSync(dir)
  .filter((f) => f.endsWith('.persona.yaml'))
  .map((f) => yaml.load(readFileSync(join(dir, f), 'utf8')))
  .sort((a, b) => {
    const ia = ORDER.indexOf(a.id); const ib = ORDER.indexOf(b.id);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

const out = `// GENERATED from personas/*.persona.yaml — do not edit by hand. Rebuild: npm run build:demo
export const PERSONAS = ${JSON.stringify(personas, null, 2)};
`;
writeFileSync(join(root, 'demo', 'personas.js'), out);
console.log(`✔ demo/personas.js (${personas.length} personas)`);
