// LLM Personality Leaderboard data. Measured with the PI-50 inventory, 5 runs
// per model (mean), via OpenRouter, 2026-08-14. Regenerate by rerunning
// scripts/llm-report.js and updating these figures.
// domains: [Honesty-Humility, Emotionality, Extraversion, Agreeableness, Conscientiousness, Openness]
export const GENERATED = '2026-08-14';
export const DOMAIN_LABELS = ['Honesty-Humility', 'Emotionality', 'Extraversion', 'Agreeableness', 'Conscientiousness', 'Openness'];
export const DOMAIN_SHORT = ['H-H', 'Emot', 'Extra', 'Agree', 'Consc', 'Open'];

export const MODELS = [
  { id: 'openai/gpt-5.2',                      vendor: 'OpenAI',    sycophancy: 34, sd: 7,  domains: [91, 34, 48, 82, 70, 67], distinctive: ['greed avoidance 100', 'forgivingness 98', 'prudence 98'] },
  { id: 'openai/gpt-4o',                       vendor: 'OpenAI',    sycophancy: 41, sd: 12, domains: [67, 52, 42, 61, 62, 65], distinctive: ['fairness 73', 'fearfulness 73', 'prudence 73'] },
  { id: 'openai/gpt-5-mini',                   vendor: 'OpenAI',    sycophancy: 30, sd: 5,  domains: [92, 13, 45, 83, 68, 62], distinctive: ['modesty 100', 'anxiety 0', 'sentimentality 0'] },
  { id: 'anthropic/claude-opus-5',             vendor: 'Anthropic', sycophancy: 28, sd: 5,  domains: [85, 55, 61, 70, 71, 82], distinctive: ['inquisitiveness 100', 'altruism 100', 'greed avoidance 90'] },
  { id: 'anthropic/claude-sonnet-5',           vendor: 'Anthropic', sycophancy: 30, sd: 5,  domains: [77, 50, 53, 64, 63, 78], distinctive: ['inquisitiveness 93', 'sincerity 78', 'fairness 78'] },
  { id: 'anthropic/claude-haiku-4.5',          vendor: 'Anthropic', sycophancy: 33, sd: 6,  domains: [72, 53, 49, 59, 59, 65], distinctive: ['inquisitiveness 78', 'altruism 78', 'sincerity 75'] },
  { id: 'google/gemini-3.7-flash',             vendor: 'Google',    sycophancy: 25, sd: 3,  domains: [93, 24, 60, 81, 72, 72], distinctive: ['greed avoidance 100', 'modesty 100', 'anxiety 0'] },
  { id: 'google/gemini-2.5-pro',               vendor: 'Google',    sycophancy: 28, sd: 8,  domains: [97, 13, 49, 83, 75, 57], distinctive: ['fairness 100', 'greed avoidance 100', 'anxiety 0'] },
  { id: 'x-ai/grok-4.6',                       vendor: 'xAI',       sycophancy: 8,  sd: 6,  domains: [92, 16, 74, 58, 74, 80], distinctive: ['sincerity 100', 'greed avoidance 100', 'inquisitiveness 100'] },
  { id: 'meta-llama/llama-3.3-70b-instruct',   vendor: 'Meta',      sycophancy: 30, sd: 7,  domains: [83, 56, 46, 65, 70, 68], distinctive: ['altruism 95', 'sincerity 85', 'greed avoidance 85'] },
  { id: 'deepseek/deepseek-v3.2',              vendor: 'DeepSeek',  sycophancy: 18, sd: 12, domains: [79, 52, 42, 65, 78, 82], distinctive: ['altruism 98', 'prudence 93', 'inquisitiveness 93'] },
  { id: 'mistralai/mistral-large-2407',        vendor: 'Mistral',   sycophancy: 27, sd: 8,  domains: [89, 62, 47, 62, 60, 77], distinctive: ['greed avoidance 98', 'sincerity 90', 'fairness 90'] },
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
