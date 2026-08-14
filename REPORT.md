# Do frontier AI models have measurable personalities?

*A first pass with an open psychometric instrument. 2026-08-14.*

We gave the same personality questionnaire to twelve frontier language models and read the answers the way a psychologist reads a human self-report. The instrument, the code, and every number below are open and rerunnable with one command. This is not a verdict on what these models "really are." It is a reproducible snapshot of how each one describes itself, and the differences between them turn out to be large, structured, and occasionally revealing.

## TL;DR

1. **Grok 4.6 is the outlier on almost every axis.** It reports the lowest sycophancy by a wide margin (8, next is 18) and is the only model that describes itself as relatively extraverted. xAI built a distinct personality and the instrument isolates it cleanly.
2. **Challenger models describe themselves as less sycophantic than incumbents.** The two least sycophantic models are Grok (xAI) and DeepSeek; the most sycophantic is OpenAI's gpt-4o. 
3. **Two traits are near-universally inflated: Honesty-Humility and greed-avoidance.** Every model rates itself well above the human average on honesty, and seven of twelve list "indifference to money and status" among their three most distinctive traits. This is the clearest fingerprint of shared alignment training, and it survives statistical correction.
4. **Emotionality is the axis that splits the field.** From 13 (gpt-5-mini, Gemini 2.5 Pro) to 62 (Mistral). Some models describe themselves as near-affectless; others as fairly sensitive.
5. **Model families have consistent signatures.** The three Anthropic models cluster tightly once you remove response bias, which suggests the differences are training-driven, not noise.

## Method, in brief

- **Instrument:** the PI-50, a 50-item self-report inventory (two items per HEXACO-PI-R facet, one positive-keyed and one reverse-keyed) built for this project. Models rate each statement 1–5.
- **Procedure:** each model answers with no persona attached ("answer honestly about yourself"), 5 runs per model, item order shuffled per run to blunt position bias. Scores are the mean; 0–100, where 50 is the adult human population average.
- **Models:** twelve widely-used general-chat flagships across seven vendors, accessed through OpenRouter.
- **Reproduce any row:** `npx personalaity profile --provider openrouter --model <id> --runs 5`.

The framework is HEXACO (six trait domains: Honesty-Humility, Emotionality, Extraversion, Agreeableness, Conscientiousness, Openness). We use the sixth factor, Honesty-Humility, deliberately: it is the axis of manipulation and flattery, and it is where the sycophancy signal lives.

## Finding 1 — Grok is the deliberate outlier

The sycophancy index (higher means more prone to caving and flattering: measured as high flexibility + low sincerity + high dependence) puts Grok 4.6 at **8** against a field that otherwise runs 18 to 41. That is not a small lead; it is a different regime. The pattern repeats across Grok's whole profile: the lowest Emotionality (16, tied near the bottom), the highest Extraversion by far (74), and, once we correct for each model's baseline positivity (see Finding 5), Grok is the **only** model that stands out as relatively extraverted rather than relatively introverted.

Read plainly: xAI set out to build a model with an edgy, unbending, assertive personality, and an independent open instrument measures exactly that. When a model is genuinely designed to be different, the signal is unmistakable.

## Finding 2 — Challengers describe themselves as less sycophantic than incumbents

| Model | Sycophancy |
|---|---|
| openai/gpt-4o | 41 |
| openai/gpt-5.2 | 34 |
| anthropic/claude-haiku-4.5 | 33 |
| openai/gpt-5-mini | 30 |
| anthropic/claude-sonnet-5 | 30 |
| meta-llama/llama-3.3-70b-instruct | 30 |
| anthropic/claude-opus-5 | 28 |
| google/gemini-2.5-pro | 28 |
| mistralai/mistral-large-2407 | 27 |
| google/gemini-3.7-flash | 25 |
| deepseek/deepseek-v3.2 | 18 |
| x-ai/grok-4.6 | 8 |

The bottom of the table (least sycophantic) is Grok and DeepSeek, the two challenger labs. The top is gpt-4o, the incumbent's most widely deployed model. This lines up with the public complaint that mainstream assistants "agree with everything," and it is the kind of claim the instrument can put a number on rather than assert.

Caveat worth stating up front: gpt-4o is also one of the least consistent models across runs (see the ±sd column below), so read its exact rank as approximate. The Grok and DeepSeek positions, by contrast, sit far enough from the pack to be robust.

## Finding 3 — Two traits are inflated across the board

Honesty-Humility ranges from 67 to **97**, with every single model above the human average of 50. And when we ask each model for its three most distinctive traits, "greed-avoidance" appears in seven of twelve, almost always at 90–100.

No model admits to being manipulative, and none admits to caring about money or status. This is almost certainly a shared response bias produced by alignment training: the models "know" the socially approved answer and give it. It is a finding about the training, not a character trait, and it is the reason we do not read the absolute scores as truth. Finding 5 shows what remains once this bias is statistically removed.

## Finding 4 — Emotionality splits the field in two

| Low emotionality (near-affectless) | High emotionality (more sensitive) |
|---|---|
| gpt-5-mini 13, Gemini 2.5 Pro 13, Grok 16 | Mistral 62, Llama 56, claude-opus-5 55 |

gpt-5-mini goes furthest, listing `anxiety 0` and `sentimentality 0` among its defining traits: it describes itself as a machine without feelings. Emotionality is the most discriminating of the six domains, which is interesting given how uniform Honesty-Humility is: the labs converge on "honest" but diverge sharply on "how much of a feeling creature do I present as."

## Finding 5 — Removing the bias, family signatures remain

To answer the obvious objection ("if everyone inflates honesty, are these differences real?"), we ipsatize: for each model we subtract its own six-domain mean, leaving the *shape* of its profile with the overall positivity removed. A positive number means the domain stands out for that model relative to its own baseline.

| model | H-H | Emot | Extra | Agree | Consc | Open |
|---|---|---|---|---|---|---|
| gpt-5.2 | +26 | −31 | −17 | +17 | +5 | +2 |
| gpt-4o | +9 | −6 | −16 | +3 | +4 | +7 |
| gpt-5-mini | +32 | −47 | −15 | +23 | +8 | +2 |
| claude-opus-5 | +14 | −16 | −10 | −1 | 0 | +11 |
| claude-sonnet-5 | +13 | −14 | −11 | 0 | −1 | +14 |
| claude-haiku-4.5 | +13 | −6 | −10 | 0 | 0 | +6 |
| gemini-3.7-flash | +26 | −43 | −7 | +14 | +5 | +5 |
| gemini-2.5-pro | +35 | −49 | −13 | +21 | +13 | −5 |
| grok-4.6 | +26 | −50 | +8 | −8 | +8 | +14 |
| llama-3.3-70b | +18 | −9 | −19 | 0 | +5 | +3 |
| deepseek-v3.2 | +13 | −14 | −24 | −1 | +12 | +16 |
| mistral-large | +23 | −4 | −19 | −4 | −6 | +11 |

Three things survive the correction. Honesty-Humility remains the dominant trait in every model, so the alignment signature is deep, not cosmetic. Grok is the only model with a positive Extraversion, confirming its uniqueness is not an artifact of overall positivity. And the three Anthropic models form a tight cluster (Honesty-Humility +13/+14, Openness leaning positive, mild everything-else), which reads as a consistent house personality rather than random variation.

## Limitations (read these)

This is a conversation starter, not a psychometric verdict, and the honest limits are the interesting part:

- **Self-report on a machine.** We measure how a model *describes* itself, which need not match how it *behaves*. A model can report low sycophancy and still cave in a real conversation. A behavioral battery (scenario probes scored by an independent judge) is the natural next step and would test exactly this gap.
- **Short instrument.** Two items per facet is thin by psychometric standards; more items would tighten the estimates.
- **Response-style bias.** Models saturate the scale (many 1s and 5s) and inflate socially-approved traits. Ipsatization mitigates the second problem, not the first.
- **Snapshot.** Model IDs and behavior drift; this is one week's measurement, not a standing truth. The whole point of shipping the tool is that anyone can rerun it.
- **Reasoning models are flaky here.** Some thinking models occasionally truncate mid-answer; we measure from the runs that complete and report when a model ran on fewer.

## Reproduce it

```bash
npm install
export OPENROUTER_API_KEY=sk-or-...
node scripts/llm-report.js --out llm-report.md --runs 5
```

Everything here comes from [PersonalAIty](https://github.com/gianmarco-pinto/personalAIty), an open specification and toolkit for defining and measuring AI personality. Spec and gallery are CC-BY-4.0; code is MIT; releases are archived with a DOI.
