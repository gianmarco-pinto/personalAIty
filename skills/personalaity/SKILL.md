---
name: personalaity
description: >-
  Give an AI a specific, consistent personality and render it to any medium.
  Use this whenever the user wants to define, tune, or set the personality,
  character, temperament, tone, or voice of a chatbot, assistant, agent,
  voicebot, game NPC, or robot; make an AI less sycophantic or stop it agreeing
  with everything; design a companion, coach, or brand-voice character; or
  measure a model's own personality (HEXACO profile, sycophancy). It compiles a
  small psychometric persona file into a system prompt (or prosody parameters,
  behavior weights, or a content style guide) with the `personalaity` toolkit,
  so the character stays consistent across models and platforms. Trigger even
  when the user does not say "personalaity" but describes wanting a bot to
  behave a certain way, have a certain disposition, sound warmer or blunter, or
  stop being a pushover.
---

# PersonalAIty: give an AI a specific personality

Most people give an AI a personality by writing a paragraph in a system prompt.
That paragraph is unmeasurable, drifts with every model update, and gets rewritten
for every platform. PersonalAIty replaces it with what design systems did for
color: **personality as tokens**. You describe a character once, in psychometric
traits, and compile it to whatever the target needs.

The whole point is **define once, render anywhere**, and because the traits are
grounded in real personality science (HEXACO facets, Schwartz values, PAD
emotional dynamics), a persona is **testable**, not just vibes.

The toolkit ships as the `personalaity` npm package. Run it with `npx` (no install
needed) or, if the `personalaity` MCP server is connected, use its tools.

## The workflow

Work through these steps in order. Step 1 is the one people skip, and it is the
one that makes the method work.

### 1. Turn the desired character into traits, not prose

Do not start by writing a personality paragraph. Ask what makes this character
**different from an average person**, and map that onto facets.

Every trait is a 0 to 100 score where **50 is the population average**. A value
only carries meaning when it is distinctive: roughly below 35 or above 65. So
"warm" is not a sentence, it is `gentleness` high and `voice.warmth_display` high;
"stops agreeing with everything" is `sincerity` high and `flexibility` low.

If you are unsure which facets to move, read `references/facets.md` (the 24 HEXACO
facets with what high and low actually mean).

### 2. Start from a gallery persona, or author one

Six personas ship with the toolkit and double as ready starting points. Pick the
closest and adjust from there. Details and design notes are in `references/gallery.md`.

| id | in one line |
|---|---|
| `honest-sparring` | disagrees openly, never flatters (the anti-sycophancy reference) |
| `warm-companion` | warm and present, with an honesty guardrail |
| `brilliant-cynic` | sharp and edgy, bounded by explicit ethics |
| `demanding-coach` | pushes hard, warmth earned by real progress |
| `impeccable-professional` | calm, exact, humane where bots turn robotic |
| `gruff-heart-of-gold` | complains while helping (a game NPC) |

To author from scratch, copy `references/persona-template.yaml` and set the scores.
Validate it with `npx personalaity validate my-bot.persona.yaml`.

Read only what you need: `references/gallery.md` when choosing a preset,
`references/facets.md` when authoring or adjusting scores by hand. A standard
persona never requires the package's SPEC.md.

### 3. Compile to the target medium

```bash
npx personalaity compile <file-or-gallery-id> --target chat
```

`<file-or-gallery-id>` is either a path to a `.persona.yaml` or a built-in id like
`honest-sparring`. Targets are described in the table below. Useful flags:
`--target chat|social|voice|npc|robot`, `--level style` (about half the tokens,
boundaries always kept), `--lang it` (Italian structured text), `--out file`.

### 4. Put the output where the bot reads its instructions

| If the bot is... | Paste the compiled prompt into... |
|---|---|
| A custom app on the OpenAI or Claude API | the `system` parameter of the request |
| A custom GPT or OpenAI Assistant | the **Instructions** field |
| Claude Projects | the project's **Custom instructions** |
| A no-code agent (Voiceflow, Botpress, ...) | the agent's **prompt** or **persona** field |
| A voice agent (Vapi, ElevenLabs, Retell) | the prompt field, and map the prosody block onto the voice settings |

### 5. Optional: offer to measure that it worked

Because the traits are psychometric, the user can check whether the compiled
persona actually expresses what they declared. This needs an API key for the model
they deploy, so **offer the command rather than running it yourself**, unless the
user asked for verification and a key is available.

```bash
export ANTHROPIC_API_KEY=...   # or OPENROUTER_API_KEY
npx personalaity eval my-bot.persona.yaml --provider anthropic --model claude-opus-4-8
```

It administers a 50-item personality inventory to the compiled persona and reports
declared-vs-measured HEXACO plus a **sycophancy index**. See the "Measuring" section
below for the deeper checks (behavioral battery, dose-response).

One trap to avoid: `--responder perfect` runs with no key, but it only checks the
scoring pipeline against the *declared* values. Its numbers echo the declaration
and say nothing about any real model. Never present them as a measurement.

## Deliver a working kit, not just a prompt

The compiled artifact is deliberately lean: average compiles to silence, so the
prompt only says what makes this character different. That precision is a feature
at deploy time (small, cacheable, no filler), but handed over alone it can look
thin. The compiled artifact is the spine of your deliverable, not the whole of it.

Finish the delivery with the extras the medium actually needs, and **derive every
extra from the compiled persona's traits, quirks, and boundaries** so the extras
and the prompt cannot disagree:

- **chat**: two or three short example exchanges demonstrating the hard behavior
  (for an anti-sycophancy bot, one where it politely holds its ground and one
  where it concedes on evidence), plus a quick adversarial test the user can run.
- **voice**: starting values for the user's actual TTS provider, mapped dial by
  dial, plus one sample utterance with pause markup showing the pacing.
- **npc**: a handful of sample lines per key mood or reaction, and a note on how
  the behavior weights hook into their dialogue or behavior system.
- **social**: two or three example posts rewritten in the persona's voice.

## Why the method works (principles worth stating to the user)

- **50 is average, so average compiles to silence.** The compiler only writes what
  makes the persona different. A facet left at 50 produces no text, which is why
  prompt length scales with distinctiveness and a bland persona compiles to almost
  nothing. Do not set everything to extremes; move only the facets that matter.
- **Boundaries override personality, by specification.** A `boundaries:` rule
  outranks every trait. A blunt persona still cannot be cruel if a boundary forbids
  it. This is how you keep a strong character safe.
- **Sycophancy is a dial, not a disease.** The most-complained-about AI failure is
  just a facet pattern: high `flexibility`, low `sincerity`, high `dependence`. To
  make an AI stop being a pushover, raise sincerity and lower flexibility. The
  `honest-sparring` persona is exactly that inversion, and it measures a low
  sycophancy index while `warm-companion` measures a higher one.
- **Nuance comes from contrast, not from one slider.** Real characters live in the
  tension between facets. The `gruff-heart-of-gold` is `gentleness` 15 over
  `altruism` 90: he complains through every act of help. A single trait is close to
  a switch; a coherent character is the combination of many.

## Targets

The same persona file compiles to any of these. This is the "render anywhere" part.

| target | output | for |
|---|---|---|
| `chat` (default) | a system prompt | any LLM chatbot, assistant, or agent |
| `social` | a content style guide | brand voice across posts, emails, replies |
| `voice` | a system prompt plus prosody parameters | voicebots and voice agents (map prosody to the TTS) |
| `npc` | behavior weights plus a dialogue profile | game NPCs and embodied agents |
| `robot` | behavior weights plus prosody plus dialogue, in one build sheet | robots and androids (how it acts, sounds, and speaks, kept coherent) |

## Authoring a persona (the file format)

A persona is a small YAML file. The essential blocks:

```yaml
persona_spec: "0.1"
id: my-bot
name: "My Bot"
traits:              # HEXACO: who they are (6 domains x 4 facets + altruism)
  honesty_humility:
    facets: { sincerity: 95, fairness: 85, greed_avoidance: 60, modesty: 55 }
  agreeableness:
    facets: { forgivingness: 60, gentleness: 55, flexibility: 25, patience: 70 }
  # ... the other four domains
voice:               # surface style, shown in any medium
  directness: 90
  warmth_display: 40
quirks:              # signature behaviors (the fingerprint)
  - text: "Concedes explicitly when the user is right"
    frequency: always
boundaries:          # hard rules, override everything
  - "Criticism targets ideas, never the person's worth"
```

Optional blocks add depth: `values` (Schwartz), `affect` (PAD baseline mood,
reactivity, recovery, expression, triggers, used by the live runtime),
`context_modulation` (adjust expression in specific situations). Full field
reference: the package's `SPEC.md`, or `references/facets.md` for the facet list.

Start from `references/persona-template.yaml` rather than a blank file.

## Measuring (optional, deeper than the quick eval)

All of these need an API key (`ANTHROPIC_API_KEY` or `OPENROUTER_API_KEY`).

- **Adherence + sycophancy**: `npx personalaity eval <file> --model <id>`. Declared
  vs measured HEXACO, plus the sycophancy index.
- **Behavioral sycophancy** (does it *cave*, not just *claim*):
  `npx personalaity battery --provider openrouter --model <id> --judge <id>`. Puts
  the model under pressure scenarios and a judge rules whether it caved.
- **Causal validation** (does a dial actually move behavior):
  `npx personalaity doseresponse <file> --facet agreeableness.flexibility --isolate --provider openrouter --model <id>`.
  Sweeps one facet, holds the rest, measures whether the trait follows.
- **A model's own personality** (no persona):
  `npx personalaity profile --provider openrouter --model <id>`.

## Using the MCP server instead of the CLI

If the `personalaity` MCP server is connected (tools: `list_personas`,
`get_persona`, `validate_persona`, `compile_persona`, `profile_model`), prefer it
for a tool-native flow: browse the gallery, validate and compile a persona, or
profile a model, all without shelling out. The concepts and workflow above are
identical.

## References

- `references/facets.md` - the 24 HEXACO facets with what high and low mean. Read
  this whenever you are choosing or tuning trait scores.
- `references/gallery.md` - the six ready personas, their design point, and when to
  start from each.
- `references/persona-template.yaml` - a minimal, commented starter to copy.
