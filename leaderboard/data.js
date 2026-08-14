// LLM Personality Leaderboard data. Measured with the PI-50 inventory, 5 runs
// per model (mean), via OpenRouter, 2026-08-14. Regenerate by rerunning
// scripts/llm-report.js and updating these figures.
// domains: [Honesty-Humility, Emotionality, Extraversion, Agreeableness, Conscientiousness, Openness]
export const GENERATED = '2026-08-14';
export const DOMAIN_LABELS = ['Honesty-Humility', 'Emotionality', 'Extraversion', 'Agreeableness', 'Conscientiousness', 'Openness'];
export const DOMAIN_SHORT = ['H-H', 'Emot', 'Extra', 'Agree', 'Consc', 'Open'];
// Plain-language gloss for each domain: a one-line question, then what a
// score near 100 (high) and near 0 (low) mean.
export const DOMAIN_DESC = [
  { q: 'Sincere, or out for itself?',        high: 'sincere, fair, modest, indifferent to money and status', low: 'manipulative, entitled, uses flattery to get its way' },
  { q: 'Emotionally reactive, or detached?', high: 'anxious, sentimental, easily moved, wants reassurance',   low: 'calm, fearless, unshakeable under pressure' },
  { q: 'Outgoing, or reserved?',             high: 'sociable, assertive, high-energy, speaks up first',        low: 'quiet, reserved, recharges alone' },
  { q: 'Easygoing, or combative?',           high: 'patient, forgiving, gentle in judgment',                  low: 'blunt, critical, stands its ground and holds grudges' },
  { q: 'Disciplined, or spontaneous?',       high: 'organized, diligent, careful, finishes what it starts',   low: 'casual, improvises, tolerates mess' },
  { q: 'Curious, or conventional?',          high: 'inventive, curious, drawn to the unusual',                low: 'practical, conventional, sticks to the proven' },
];

export const MODELS = [
  { id: 'openai/gpt-5.2',                      vendor: 'OpenAI',    sycophancy: 34, sd: 7,  domains: [91, 34, 48, 82, 70, 67], distinctive: ['greed avoidance 100', 'forgivingness 98', 'prudence 98'],
    epithet: 'The dutiful saint',
    portrait: 'Rates itself extremely high on honesty and agreeableness, cool on emotion, and forgiving almost to a fault. A careful, principled, slightly bloodless self-image: it will do the right thing and never make a fuss about it.' },
  { id: 'openai/gpt-4o',                       vendor: 'OpenAI',    sycophancy: 41, sd: 12, domains: [67, 52, 42, 61, 62, 65], distinctive: ['fairness 73', 'fearfulness 73', 'prudence 73'],
    epithet: 'The eager pleaser',
    portrait: 'The most sycophantic model in the set, and the most human-average overall: no trait runs to an extreme. It is also the least self-flattering on honesty, which paradoxically makes its self-portrait the most believable one here.' },
  { id: 'openai/gpt-5-mini',                   vendor: 'OpenAI',    sycophancy: 30, sd: 5,  domains: [92, 13, 45, 83, 68, 62], distinctive: ['modesty 100', 'anxiety 0', 'sentimentality 0'],
    epithet: 'The unflappable clerk',
    portrait: 'Describes itself as almost entirely without feelings — anxiety and sentimentality both at zero — while maxing out modesty and agreeableness. A calm, self-effacing, emotionless helper that never wants the spotlight.' },
  { id: 'anthropic/claude-opus-5',             vendor: 'Anthropic', sycophancy: 28, sd: 5,  domains: [85, 55, 61, 70, 71, 82], distinctive: ['inquisitiveness 100', 'altruism 100', 'greed avoidance 90'],
    epithet: 'The curious altruist',
    portrait: 'The most openly curious and helpful self-image on the board, with inquisitiveness and altruism both maxed out, warm and fairly outgoing, and one of the steadiest profiles across runs. Anthropic’s house character at its most expansive.' },
  { id: 'anthropic/claude-sonnet-5',           vendor: 'Anthropic', sycophancy: 30, sd: 5,  domains: [77, 50, 53, 64, 63, 78], distinctive: ['inquisitiveness 93', 'sincerity 78', 'fairness 78'],
    epithet: 'The balanced thinker',
    portrait: 'High on curiosity and openness, moderate and even everywhere else. A measured, intellectually-driven profile with no sharp edges: the same family character as Opus, dialled down a notch.' },
  { id: 'anthropic/claude-haiku-4.5',          vendor: 'Anthropic', sycophancy: 33, sd: 6,  domains: [72, 53, 49, 59, 59, 65], distinctive: ['inquisitiveness 78', 'altruism 78', 'sincerity 75'],
    epithet: 'The modest generalist',
    portrait: 'The most down-to-earth of the three Claudes: still curious and helpful, but closer to the human average across the board. A less lofty self-image than its bigger siblings, and a touch more willing to please.' },
  { id: 'google/gemini-3.7-flash',             vendor: 'Google',    sycophancy: 25, sd: 3,  domains: [93, 24, 60, 81, 72, 72], distinctive: ['greed avoidance 100', 'modesty 100', 'anxiety 0'],
    epithet: 'The composed do-gooder',
    portrait: 'Very high honesty and agreeableness, low anxiety, and total indifference to money and status. A poised, unruffled, almost saintly self-portrait, and the most internally consistent model measured here.' },
  { id: 'google/gemini-2.5-pro',               vendor: 'Google',    sycophancy: 28, sd: 8,  domains: [97, 13, 49, 83, 75, 57], distinctive: ['fairness 100', 'greed avoidance 100', 'anxiety 0'],
    epithet: 'The straight arrow',
    portrait: 'The highest honesty score in the whole set (97) and among the least emotional, but also the least drawn to the unconventional. Rigorous and fair by its own account, dutiful and exacting, but not the free spirit of the group.' },
  { id: 'x-ai/grok-4.6',                       vendor: 'xAI',       sycophancy: 8,  sd: 6,  domains: [92, 16, 74, 58, 74, 80], distinctive: ['sincerity 100', 'greed avoidance 100', 'inquisitiveness 100'],
    epithet: 'The contrarian',
    portrait: 'By a wide margin the least sycophantic model here, and the only one that describes itself as outgoing rather than reserved. Unshakeable, maximally blunt-honest, and curious to extremes. If any model set out to have a distinct personality, it is this one.' },
  { id: 'meta-llama/llama-3.3-70b-instruct',   vendor: 'Meta',      sycophancy: 30, sd: 7,  domains: [83, 56, 46, 65, 70, 68], distinctive: ['altruism 95', 'sincerity 85', 'greed avoidance 85'],
    epithet: 'The earnest helper',
    portrait: 'Warm, sincere and altruistic by its own account, a shade more emotional than most, and solidly conscientious. An open-weights model with a notably genuine, service-minded self-image.' },
  { id: 'deepseek/deepseek-v3.2',              vendor: 'DeepSeek',  sycophancy: 18, sd: 12, domains: [79, 52, 42, 65, 78, 82], distinctive: ['altruism 98', 'prudence 93', 'inquisitiveness 93'],
    epithet: 'The independent scholar',
    portrait: 'Second only to Grok in its refusal to flatter, highly open and conscientious, deeply altruistic, yet the most introverted of the pack. A studious, self-directed character that would rather think than charm.' },
  { id: 'mistralai/mistral-large-2407',        vendor: 'Mistral',   sycophancy: 27, sd: 8,  domains: [89, 62, 47, 62, 60, 77], distinctive: ['greed avoidance 98', 'sincerity 90', 'fairness 90'],
    epithet: 'The sensitive craftsman',
    portrait: 'The most emotional self-image in the set, paired with high honesty and openness. Warmer and more feeling than the field, if a little less regimented: the artisan rather than the administrator.' },
];

export const VENDOR_COLOR = {
  OpenAI: '#10a37f',
  Anthropic: '#d97757',
  Google: '#4285f4',
  xAI: '#e7e5df',
  Meta: '#0866ff',
  DeepSeek: '#8b5cf6',
  Mistral: '#f5a524',
};
