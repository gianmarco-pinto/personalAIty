// Generate print-friendly SVG charts for the press article, straight from the
// measured data. Light background, dark text, vendor colours adjusted so they
// read on white. Output: press/charts/*.svg
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MODELS } from '../leaderboard/data.js';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'press', 'charts');
mkdirSync(outDir, { recursive: true });

// print palette (readable on white; xAI darkened from near-white)
const COLOR = {
  OpenAI: '#0e8f6f', Anthropic: '#c05f33', Google: '#2b6cd4',
  xAI: '#333333', Meta: '#0655d6', DeepSeek: '#6d3fd4',
  Moonshot: '#0891b2', Alibaba: '#ca8a04',
};
const short = (id) => id.split('/').pop();
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// ── Chart 1: sycophancy ranking (horizontal bars) ───────────────────────────
function sycophancyChart() {
  const rows = [...MODELS].sort((a, b) => b.sycophancy - a.sycophancy);
  const W = 720, rowH = 30, padTop = 56, padL = 200, padR = 30, barMax = W - padL - padR - 40;
  const H = padTop + rows.length * rowH + 20;
  const max = Math.max(...rows.map((r) => r.sycophancy));
  const s = [];
  s.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="Helvetica,Arial,sans-serif">`);
  s.push(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);
  s.push(`<text x="30" y="26" font-size="17" font-weight="700" fill="#111">Sycophancy: how much each model flatters and agrees</text>`);
  s.push(`<text x="30" y="44" font-size="12" fill="#666">Self-report, 0–100. Higher = more prone to caving. PersonalAIty PI-50, 5 runs, Aug 2026.</text>`);
  rows.forEach((r, i) => {
    const y = padTop + i * rowH;
    const w = (r.sycophancy / max) * barMax;
    s.push(`<text x="${padL - 8}" y="${y + 15}" font-size="12.5" fill="#222" text-anchor="end">${esc(short(r.id))}</text>`);
    s.push(`<rect x="${padL}" y="${y + 3}" width="${w.toFixed(1)}" height="18" rx="3" fill="${COLOR[r.vendor]}"/>`);
    s.push(`<text x="${padL + w + 7}" y="${y + 16}" font-size="12" font-weight="700" fill="#111">${r.sycophancy}</text>`);
  });
  return s.join('') + '</svg>\n';
}

// ── Chart 2: Honesty-Humility, everyone above the human average ─────────────
function honestyChart() {
  const rows = [...MODELS].sort((a, b) => b.domains[0] - a.domains[0]);
  const W = 720, rowH = 30, padTop = 56, padL = 200, padR = 60;
  const H = padTop + rows.length * rowH + 20;
  const scaleX = (v) => padL + (v / 100) * (W - padL - padR);
  const s = [];
  s.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="Helvetica,Arial,sans-serif">`);
  s.push(`<rect width="${W}" height="${H}" fill="#ffffff"/>`);
  s.push(`<text x="30" y="26" font-size="17" font-weight="700" fill="#111">Honesty-Humility: every model rates itself above the human average</text>`);
  s.push(`<text x="30" y="44" font-size="12" fill="#666">Self-report, 0–100. The dashed line at 50 is the average person.</text>`);
  // 50 reference line
  const x50 = scaleX(50);
  s.push(`<line x1="${x50}" y1="${padTop - 4}" x2="${x50}" y2="${padTop + rows.length * rowH}" stroke="#bbb" stroke-width="1.5" stroke-dasharray="4 4"/>`);
  s.push(`<text x="${x50}" y="${padTop - 8}" font-size="11" fill="#999" text-anchor="middle">50 = human avg</text>`);
  rows.forEach((r, i) => {
    const y = padTop + i * rowH + 12;
    const x = scaleX(r.domains[0]);
    s.push(`<text x="${padL - 8}" y="${y + 4}" font-size="12.5" fill="#222" text-anchor="end">${esc(short(r.id))}</text>`);
    s.push(`<line x1="${x50}" y1="${y}" x2="${x}" y2="${y}" stroke="#ddd" stroke-width="1"/>`);
    s.push(`<circle cx="${x}" cy="${y}" r="5.5" fill="${COLOR[r.vendor]}"/>`);
    s.push(`<text x="${x + 11}" y="${y + 4}" font-size="12" font-weight="700" fill="#111">${r.domains[0]}</text>`);
  });
  return s.join('') + '</svg>\n';
}

writeFileSync(join(outDir, 'sycophancy.svg'), sycophancyChart());
writeFileSync(join(outDir, 'honesty-humility.svg'), honestyChart());
console.log('✔ wrote press/charts/sycophancy.svg and honesty-humility.svg');
