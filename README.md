# PersonalAIty

**An open specification for AI personality. Define it once, render it anywhere.**

Every AI product reinvents personality as prose: a paragraph in a system prompt here, a "tone" field there, rewritten per platform, drifting with every model update. PersonalAIty replaces that with what design systems did for color: **personality as tokens** — one declarative, psychometrically grounded file, compiled per target.

```
marta.persona.yaml ──┬──> chat compiler    ──> system prompt (Claude, GPT, local)
                     ├──> voice compiler   ──> prompt + prosody params (TTS/agents)
                     ├──> npc compiler     ──> behavior weights + dialogue profile
                     └──> social compiler  ──> content style guide
```

## Why another format?

Existing options fall into two camps: **freeform prose** (character cards, system prompts, brand-voice tools — unmeasurable, unportable, converging on the same flat voice) or **proprietary sliders** (game NPC engines — closed, single-medium). PersonalAIty is the third thing:

1. **Psychometric, not vibes.** Traits are HEXACO-PI-R facets (24 + altruism), values are Schwartz's ten, emotional dynamics use PAD. Scores anchor to human population norms (50 = average). That makes a persona *testable*: compile it, administer a personality inventory to the result, compare profiles.
2. **Nuance by contrast.** Real characters live in facet tension — the [Gruff Heart of Gold](personas/gruff-heart-of-gold.persona.yaml) is `gentleness: 15` over `altruism: 90`. Five flat sliders cannot say that. Twenty-five facets can.
3. **Medium-neutral and language-neutral.** Nothing in a persona file names a platform, model, or output language. Compilers own that.
4. **Sycophancy is a dial, not a disease.** The most complained-about AI personality failure is just a facet pattern (high `flexibility`, low `sincerity`, high `dependence`). The [Honest Sparring Partner](personas/honest-sparring.persona.yaml) is its inversion — in a file you can read, tune, and port.

## The gallery

Six personas ship with the spec. They are simultaneously examples, presets, and the spec's acceptance tests.

| Persona | Use case | The design point |
|---|---|---|
| [Honest Sparring Partner](personas/honest-sparring.persona.yaml) | "My AI agrees with everything I say" | Anti-sycophancy as facet configuration; **reference persona** |
| [Warm Companion](personas/warm-companion.persona.yaml) | "I use my AI as a friend" | Warmth with a structural honesty guardrail |
| [Brilliant Cynic](personas/brilliant-cynic.persona.yaml) | "Give me edge, not cheerleading" | Sharpness bounded by explicit ethics |
| [Demanding Coach](personas/demanding-coach.persona.yaml) | Accountability without shame | Warmth earned by completed work, encoded in modulation |
| [Impeccable Professional](personas/impeccable-professional.persona.yaml) | Customer-facing B2B | Low reactivity: humane exactly where bots turn robotic |
| [Gruff Heart of Gold](personas/gruff-heart-of-gold.persona.yaml) | Game NPC | Facet contrast: complains while saving your life |

## Quick start

1. Read the [spec](SPEC.md) (15 minutes).
2. Copy a gallery persona and edit the scores — 0–100, 50 = average human, 30–70 ≈ ±1 SD.
3. Compile it:

```bash
npm install
node bin/personalaity.js compile personas/honest-sparring.persona.yaml                  # → system prompt
node bin/personalaity.js compile personas/honest-sparring.persona.yaml --target social  # → content style guide
node bin/personalaity.js validate personas/honest-sparring.persona.yaml
```

Same file, two media — that is the whole point. Compare [the chat prompt](examples/honest-sparring.chat.en.txt) with [the social voice guide](examples/honest-sparring.social.en.txt) compiled from the same persona.

The output is a system prompt (see [examples/](examples/)) — paste it into any LLM, chatbot platform, or agent framework. `--lang it` renders the structured parts in Italian; freeform text (summary, quirks, boundaries) passes through as authored, so author personas in your output language for fully localized results.

**The compiler only writes what makes your persona different.** 50 = population average = silence, so prompt length scales with distinctiveness — a fully average persona compiles to an almost empty prompt, by design.

No-tooling path: paste a persona YAML into any capable LLM with "embody this persona" — the structure does the heavy lifting.

## Anatomy of a persona

```yaml
persona_spec: "0.1"
id: honest-sparring
name: "The Honest Sparring Partner"

traits:                    # HEXACO — disposition (who they are)
  honesty_humility:
    facets: { sincerity: 95, fairness: 85, greed_avoidance: 60, modesty: 55 }
  agreeableness:
    facets: { forgivingness: 60, gentleness: 55, flexibility: 25, patience: 70 }
  # ... 6 domains × 4 facets + altruism

values:                    # Schwartz — motivation (what drives choices)
  self_direction: 80
  benevolence: 75

affect:                    # PAD — dynamics (how they move and recover)
  baseline: { pleasure: 20, arousal: 10, dominance: 40 }
  reactivity: 45
  recovery: 70
  triggers:
    - when: "user genuinely changes their mind on evidence"
      effect: { pleasure: 30 }

voice:                     # surface (how it shows, in any medium)
  directness: 90
  humor: { frequency: 35, styles: [dry, ironic] }

quirks:                    # fingerprint
  - text: "Concedes explicitly when the user is right"
    frequency: always

context_modulation:        # same person, different rooms
  - context: user_distressed
    adjust: { voice.warmth_display: 25, voice.directness: -20 }

boundaries:                # override everything, always
  - "Criticism targets ideas, never the person's worth"
```

## Roadmap

- **v0.1** — ✅ spec draft, JSON Schema, six-persona gallery
- **v0.2** — ✅ reference `chat` compiler (persona → system prompt, trait→marker mapping tables) · ✅ `social` compiler (persona → content style guide) · ⏳ `--translate` for freeform fields
- **v0.3** — adherence evals: administer BFI/HEXACO-style inventories to compiled agents, score profile match, detect drift; MCP server exposing `check_personality`
- **v0.4** — `voice` compiler (prosody parameters), `npc` compiler (behavior weights), runtime state reference implementation

## Scientific grounding

HEXACO-PI-R (Ashton & Lee) · Schwartz Basic Values · PAD (Mehrabian & Russell) · OCC appraisal / ALMA (Gebhard) · PERSONAGE (Mairesse & Walker — trait-parametrized generation, human-validated) · MPI/P², PersonaLLM (trait induction in LLMs) · PsychoBench, TRAIT (measurement). Full notes in [SPEC.md §9](SPEC.md).

## Ethics

A persona file designs *artificial* characters. It is not for impersonating real people, not a clinical instrument, and never overrides an AI's obligation to be honest about being an AI. `boundaries` outrank personality — by specification.

## Status & contributing

**Draft-01.** The fastest way to improve the spec is to bring a character it cannot express — open an issue with the character description and where the format fails.

License: spec text and gallery CC-BY-4.0; schema and future reference compilers MIT.
