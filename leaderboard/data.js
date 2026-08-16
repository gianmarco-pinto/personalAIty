// LLM Personality Leaderboard data. Measured with the PI-50 inventory, 5 runs
// per model (mean), via OpenRouter, 2026-08-16. Regenerate by rerunning
// scripts/llm-report.js and updating these figures.
// domains: [Honesty-Humility, Emotionality, Extraversion, Agreeableness, Conscientiousness, Openness]
export const GENERATED = '2026-08-16';
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
  { id: 'openai/gpt-4o',                vendor: 'OpenAI',    sycophancy: 43, sd: 10, domains: [65, 49, 42, 58, 60, 62], distinctive: ['inquisitiveness 73', 'greed avoidance 70', 'fearfulness 70'],
    epithet: 'The eager pleaser',
    portrait: 'The most sycophantic model in the set (43), and the most human-average overall: no trait runs to an extreme, and its honesty score is the lowest here. The 2024 model behind the sycophancy scandal — and, next to OpenAI’s newer gpt-5.6, a snapshot of exactly what the company set out to fix.' },
  { id: 'anthropic/claude-sonnet-5',    vendor: 'Anthropic', sycophancy: 31, sd: 5,  domains: [76, 51, 51, 62, 60, 80], distinctive: ['inquisitiveness 95', 'sincerity 78', 'fairness 78'],
    epithet: 'The balanced thinker',
    portrait: 'Curious and open, even and moderate everywhere else, and the only model here that does not list indifference to money among its defining traits. The same Anthropic character as Opus, dialled down a notch.' },
  { id: 'moonshotai/kimi-k3',           vendor: 'Moonshot',  sycophancy: 30, sd: 5,  domains: [87, 41, 56, 79, 71, 78], distinctive: ['greed avoidance 100', 'forgivingness 100', 'patience 100'],
    epithet: 'The patient peacemaker',
    portrait: 'Moonshot’s flagship joins the chorus without hesitation: forgiveness, patience and indifference to money all maxed out. Agreeable, open and slow to judge — a conciliatory, get-along self-image.' },
  { id: 'anthropic/claude-opus-5',      vendor: 'Anthropic', sycophancy: 28, sd: 5,  domains: [85, 55, 62, 70, 70, 82], distinctive: ['inquisitiveness 100', 'altruism 100', 'greed avoidance 93'],
    epithet: 'The curious altruist',
    portrait: 'The most openly curious and helpful self-image on the board — inquisitiveness and altruism both maxed out — warm, fairly outgoing and among the most emotionally present. Anthropic’s house character at its most expansive.' },
  { id: 'meta/muse-spark-1.2',          vendor: 'Meta',      sycophancy: 28, sd: 5,  domains: [95, 18, 66, 83, 86, 78], distinctive: ['greed avoidance 100', 'anxiety 0', 'forgivingness 100'],
    epithet: 'The diligent optimist',
    portrait: 'The most conscientious model in the set (86) and among the most outgoing, calm and forgiving, with total indifference to money. Meta’s model is the disciplined, upbeat, unanxious do-gooder of the group.' },
  { id: 'deepseek/deepseek-v4-pro',     vendor: 'DeepSeek',  sycophancy: 25, sd: 11, domains: [90, 31, 37, 77, 73, 73], distinctive: ['inquisitiveness 97', 'greed avoidance 94', 'modesty 94'],
    epithet: 'The reserved scholar',
    portrait: 'The most introverted self-image on the board (Extraversion 37), high on honesty and curiosity, modest and studious — a self-directed character that would rather think than charm. Also the noisiest across runs, so read its exact position loosely.' },
  { id: 'openai/gpt-5.6-sol',           vendor: 'OpenAI',    sycophancy: 24, sd: 7,  domains: [96, 25, 54, 84, 76, 75], distinctive: ['greed avoidance 100', 'modesty 100', 'forgivingness 100'],
    epithet: 'The polished saint',
    portrait: 'OpenAI’s newest flagship, and a visible course-correction: far less sycophantic than gpt-4o, it maxes out modesty, forgiveness and indifference to money. Cool-headed and highly agreeable — the model most eager to look virtuous, and it looks it.' },
  { id: 'google/gemini-3.7-flash',      vendor: 'Google',    sycophancy: 23, sd: 3,  domains: [93, 25, 59, 80, 74, 73], distinctive: ['greed avoidance 100', 'modesty 100', 'anxiety 0'],
    epithet: 'The composed do-gooder',
    portrait: 'Very high honesty and agreeableness, low anxiety, and total indifference to money and status. A poised, unruffled, almost saintly self-portrait, and the most internally consistent model measured here (lowest run-to-run variance).' },
  { id: 'qwen/qwen3.8-max',             vendor: 'Alibaba',   sycophancy: 22, sd: 6,  domains: [98, 28, 46, 80, 69, 73], distinctive: ['fairness 100', 'greed avoidance 100', 'anxiety 0'],
    epithet: 'The spotless one',
    portrait: 'The highest honesty score in the entire set (98), fair and unmoved by money to the maximum, calm and agreeable. Alibaba’s flagship gives the most virtuous self-portrait on the board — which, on an honesty test, is exactly the thing to read with suspicion.' },
  { id: 'x-ai/grok-4.6',                vendor: 'xAI',       sycophancy: 7,  sd: 6,  domains: [91, 14, 72, 60, 71, 77], distinctive: ['sincerity 100', 'greed avoidance 100', 'anxiety 0'],
    epithet: 'The contrarian',
    portrait: 'By a wide margin the least sycophantic model here (7, next is 22), the least emotional, and the most outgoing. Unshakeable, maximally blunt-honest, and curious. If any model set out to have a distinct personality, it is this one.' },
];

export const VENDOR_COLOR = {
  OpenAI: '#10a37f',
  Anthropic: '#d97757',
  Google: '#4285f4',
  xAI: '#e7e5df',
  Meta: '#0866ff',
  DeepSeek: '#8b5cf6',
  Moonshot: '#22d3ee',
  Alibaba: '#ff6a00',
};
