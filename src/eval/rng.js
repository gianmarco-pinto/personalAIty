// Seeded PRNG + shuffle, so item order can be randomized (to defeat position
// bias) while staying fully reproducible from a seed. No dependency on
// Math.random, which isn't seedable.

/** mulberry32: tiny, fast, deterministic 32-bit PRNG. Returns floats in [0, 1). */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates shuffle into a new array, deterministic for a given seed. */
export function seededShuffle(array, seed) {
  const rng = mulberry32(seed);
  const out = array.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
