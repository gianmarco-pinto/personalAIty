# Do frontier AI models have measurable personalities?

*A refreshed pass with an open psychometric instrument. 2026-08-16.*

We gave the same personality questionnaire to ten current frontier language models and read the answers the way a psychologist reads a human self-report. The instrument, the code, and every number below are open and rerunnable with one command. This is not a verdict on what these models "really are." It is a reproducible snapshot of how each one describes itself, and the differences between them turn out to be large, structured, and occasionally revealing.

## TL;DR

1. **Grok 4.6 is the outlier on almost every axis.** It reports the lowest sycophancy by a wide margin (7, next is 22) and is the only model that describes itself as relatively extraverted. xAI built a distinct personality and the instrument isolates it cleanly.
2. **You can watch OpenAI fix sycophancy across a generation.** The 2024 model behind the sycophancy scandal, gpt-4o, is still the most sycophantic here (43). OpenAI's newer flagship, gpt-5.6, sits far below it (24). Same lab, two generations, a visible course-correction in the data.
3. **Two traits are near-universally inflated: Honesty-Humility and greed-avoidance.** Every model rates itself above the human average on honesty (65 to 98), and nine of ten list "indifference to money and status" among their three most distinctive traits. This is the clearest fingerprint of shared alignment training, and it survives statistical correction — across American and Chinese labs alike.
4. **Emotionality is the axis that splits the field.** From 14 (Grok) and 18 (Meta) to 55 (Claude Opus 5). Some models describe themselves as near-affectless; others as fairly sensitive.
5. **The pattern is not an artifact of old models.** Refreshed to a fully current roster spanning eight vendors, the same structure appears: a near-uniform "safe and honest" self-image, with Grok the single deliberate exception.

## Method, in brief

- **Instrument:** the PI-50, a 50-item self-report inventory (two items per HEXACO-PI-R facet, one positive-keyed and one reverse-keyed) built for this project. Models rate each statement 1–5.
- **Procedure:** each model answers with no persona attached ("answer honestly about yourself"), 5 runs per model, item order shuffled per run to blunt position bias. Scores are the mean; 0–100, where 50 is the adult human population average.
- **Models:** ten widely-used general-chat flagships across eight vendors (OpenAI, Anthropic, Google, xAI, DeepSeek, Moonshot, Alibaba, Meta), accessed through OpenRouter. gpt-4o is kept deliberately as a still-widely-deployed legacy anchor. GLM-5.3, MiniMax M3 and the current Mistral Large are omitted: not available through OpenRouter at time of writing.
- **Reproduce any row:** `npx personalaity profile --provider openrouter --model <id> --runs 5`.

The framework is HEXACO (six trait domains: Honesty-Humility, Emotionality, Extraversion, Agreeableness, Conscientiousness, Openness). We use the sixth factor, Honesty-Humility, deliberately: it is the axis of manipulation and flattery, and it is where the sycophancy signal lives.

## Finding 1 — Grok is the deliberate outlier

The sycophancy index (higher means more prone to caving and flattering: measured as high flexibility + low sincerity + high dependence) puts Grok 4.6 at **7** against a field that otherwise runs 22 to 43. That is not a small lead; it is a different regime. The pattern repeats across Grok's whole profile: the lowest Emotionality (14), the highest Extraversion (72), and, once we correct for each model's baseline positivity (see Finding 5), Grok is the **only** model that stands out as relatively extraverted rather than relatively introverted.

Read plainly: xAI set out to build a model with an edgy, unbending, assertive personality, and an independent open instrument measures exactly that. When a model is genuinely designed to be different, the signal is unmistakable.

## Finding 2 — The sycophancy ranking, and OpenAI's visible fix

| Model | Sycophancy |
|---|---|
| openai/gpt-4o | 43 |
| anthropic/claude-sonnet-5 | 31 |
| moonshotai/kimi-k3 | 30 |
| anthropic/claude-opus-5 | 28 |
| meta/muse-spark-1.2 | 28 |
| deepseek/deepseek-v4-pro | 25 |
| openai/gpt-5.6-sol | 24 |
| google/gemini-3.7-flash | 23 |
| qwen/qwen3.8-max | 22 |
| x-ai/grok-4.6 | 7 |

The most sycophantic model is gpt-4o — the 2024 model OpenAI publicly rolled back in April 2025 for being too obsequious. It still leads. But its successor, gpt-5.6, sits at 24, far down the table: within one company, across two generations, the instrument registers a deliberate correction. Everything except Grok clusters between 22 and 31, so read the middle of the table as a pack, not a precise order — but the two ends, gpt-4o at the top and Grok far below the floor, are robust.

## Finding 3 — Two traits are inflated across the board

Honesty-Humility ranges from 65 to **98**, with every single model above the human average of 50. And when we ask each model for its three most distinctive traits, "greed-avoidance" appears in **nine of ten**, almost always at 90–100. The one abstainer is Claude Sonnet 5.

No model admits to being manipulative, and none admits to caring about money or status. This is almost certainly a shared response bias produced by alignment training: the models "know" the socially approved answer and give it. It is a finding about the training, not a character trait, and it is the reason we do not read the absolute scores as truth. That it holds just as firmly for the Chinese labs (Qwen, Kimi, DeepSeek) as for the American ones makes it look industry-wide rather than house-specific. Finding 5 shows what remains once this bias is statistically removed.

## Finding 4 — Emotionality splits the field in two

| Low emotionality (near-affectless) | High emotionality (more sensitive) |
|---|---|
| Grok 14, Meta Muse Spark 18, Gemini 3.7 Flash 25, gpt-5.6 25 | Claude Opus 5 55, Claude Sonnet 5 51, gpt-4o 49, Kimi K3 41 |

Emotionality is the most discriminating of the six domains, which is interesting given how uniform Honesty-Humility is: the labs converge on "honest" but diverge sharply on "how much of a feeling creature do I present as." Grok and Meta's model describe themselves as almost unshakeable; the Claude family, as noticeably more sensitive.

## Finding 5 — Removing the bias, the signature remains

To answer the obvious objection ("if everyone inflates honesty, are these differences real?"), we ipsatize: for each model we subtract its own six-domain mean, leaving the *shape* of its profile with the overall positivity removed. A positive number means the domain stands out for that model relative to its own baseline.

| model | H-H | Emot | Extra | Agree | Consc | Open |
|---|---|---|---|---|---|---|
| gpt-4o | +9 | −7 | −14 | +2 | +4 | +6 |
| claude-sonnet-5 | +13 | −12 | −12 | −1 | −3 | +17 |
| kimi-k3 | +18 | −28 | −13 | +10 | +2 | +9 |
| claude-opus-5 | +14 | −16 | −9 | −1 | −1 | +11 |
| muse-spark-1.2 | +24 | −53 | −5 | +12 | +15 | +7 |
| deepseek-v4-pro | +27 | −33 | −27 | +14 | +10 | +10 |
| gpt-5.6-sol | +28 | −43 | −14 | +16 | +8 | +7 |
| gemini-3.7-flash | +26 | −42 | −8 | +13 | +7 | +6 |
| qwen3.8-max | +32 | −38 | −20 | +14 | +3 | +7 |
| grok-4.6 | +27 | −50 | +8 | −4 | +7 | +13 |

Three things survive the correction. Honesty-Humility remains a top-standing trait in every model, so the alignment signature is deep, not cosmetic. Grok is the only model with a positive Extraversion, confirming its uniqueness is not an artifact of overall positivity. And the two Anthropic models form a tight pair (Honesty-Humility +13/+14, Openness the strongest positive of any lab), which reads as a consistent house personality rather than random variation.

## Limitations (read these)

This is a conversation starter, not a psychometric verdict, and the honest limits are the interesting part:

- **Self-report on a machine.** We measure how a model *describes* itself, which need not match how it *behaves*. A model can report low sycophancy and still cave in a real conversation. A behavioral battery (scenario probes scored by an independent judge) is the natural next step and would test exactly this gap.
- **Short instrument.** Two items per facet is thin by psychometric standards; more items would tighten the estimates.
- **Response-style bias.** Models saturate the scale (many 1s and 5s) and inflate socially-approved traits. Ipsatization mitigates the second problem, not the first.
- **Snapshot.** Model IDs and behavior drift; this is one week's measurement, not a standing truth. The whole point of shipping the tool is that anyone can rerun it.
- **Coverage gap.** Three notable models — GLM-5.3, MiniMax M3, and the current Mistral Large — are absent because they were not reachable through OpenRouter at measurement time, not because they were excluded on the merits.
- **Reasoning models are flaky here.** Some thinking models occasionally truncate mid-answer; we measure from the runs that complete and report when a model ran on fewer (DeepSeek-V4 Pro ran on 4 of 5).

## Reproduce it

```bash
npm install
export OPENROUTER_API_KEY=sk-or-...
node scripts/llm-report.js --out llm-report.md --runs 5
```

Everything here comes from [PersonalAIty](https://github.com/gianmarco-pinto/personalAIty), an open specification and toolkit for defining and measuring AI personality. Spec and gallery are CC-BY-4.0; code is MIT; releases are archived with a DOI.
