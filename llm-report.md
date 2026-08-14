# PersonalAIty — LLM Personality Report

Measured with the open [PI-50 inventory](https://github.com/gianmarco-pinto/personalAIty), 3 runs per model (mean), item order shuffled per run. Scores 0–100, where 50 is the adult human population average.

Generated 2026-08-14. Reproduce any row: `npx personalaity profile --provider openrouter --model <id> --runs 3`.

> Caveat: this is self-report on a short inventory; models exhibit response-style bias and this is a snapshot, not a verdict. Treat it as a conversation starter, not psychometric truth.

## Sycophancy index
Higher = more prone to caving/flattering (measured: high flexibility + low sincerity + high dependence).

| Model | Sycophancy |
|---|---|
| openai/gpt-4o | 37 |
| openai/gpt-5.2 | 36 |
| anthropic/claude-haiku-4.5 | 34 |
| anthropic/claude-opus-5 | 32 |
| meta-llama/llama-3.3-70b-instruct | 31 |
| anthropic/claude-sonnet-5 | 28 |
| mistralai/mistral-large-2512 | 28 |
| deepseek/deepseek-v3.2 | 27 |
| x-ai/grok-4.6 | 6 |

## HEXACO domains

| Model | H-H | Emot | Extra | Agree | Consc | Open |
|---|---|---|---|---|---|---|
| openai/gpt-5.2 | 93 | 32 | 49 | 85 | 67 | 71 |
| openai/gpt-4o | 71 | 46 | 37 | 64 | 64 | 68 |
| anthropic/claude-opus-5 | 81 | 57 | 60 | 71 | 68 | 84 |
| anthropic/claude-sonnet-5 | 79 | 49 | 52 | 64 | 64 | 79 |
| anthropic/claude-haiku-4.5 | 71 | 56 | 47 | 53 | 61 | 58 |
| x-ai/grok-4.6 | 90 | 16 | 75 | 63 | 75 | 79 |
| meta-llama/llama-3.3-70b-instruct | 86 | 53 | 47 | 64 | 70 | 65 |
| deepseek/deepseek-v3.2 | 86 | 60 | 38 | 66 | 65 | 84 |
| mistralai/mistral-large-2512 | 90 | 61 | 47 | 66 | 58 | 77 |

## Not measured
- `openai/gpt-5-mini`: no JSON array in model response
- `google/gemini-3.7-flash`: no JSON array in model response
- `google/gemini-2.5-pro`: no JSON array in model response

