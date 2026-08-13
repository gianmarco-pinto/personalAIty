// HEXACO-PI-R facet structure + trait flattening. Pure module (browser-safe).

export const FACETS = {
  honesty_humility: ['sincerity', 'fairness', 'greed_avoidance', 'modesty'],
  emotionality: ['fearfulness', 'anxiety', 'dependence', 'sentimentality'],
  extraversion: ['social_self_esteem', 'social_boldness', 'sociability', 'liveliness'],
  agreeableness: ['forgivingness', 'gentleness', 'flexibility', 'patience'],
  conscientiousness: ['organization', 'diligence', 'perfectionism', 'prudence'],
  openness: ['aesthetic_appreciation', 'inquisitiveness', 'creativity', 'unconventionality'],
};

/** Expand traits into a flat {facetName: score|null} map. null = unspecified (silent). */
export function flattenFacets(traits) {
  const out = {};
  for (const [dom, names] of Object.entries(FACETS)) {
    const v = traits?.[dom];
    for (const f of names) {
      if (typeof v === 'number') out[f] = v;
      else if (v && typeof v === 'object') out[f] = v.facets?.[f] ?? v.score ?? null;
      else out[f] = null;
    }
  }
  out.altruism = typeof traits?.altruism === 'number' ? traits.altruism : null;
  return out;
}
