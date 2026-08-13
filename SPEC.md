# PersonalAIty Persona Spec — v0.1 (draft)

An open, declarative format for defining the **personality** of an AI system — once — so it can be rendered coherently across any embodiment: chatbots, voice agents, social content, video, game NPCs, robots.

Status: **draft-01**. Everything here is open for discussion. File format: YAML (or JSON), suggested extension `.persona.yaml`.

---

## 1. Why this exists

Today, AI personality is defined as freeform prose inside system prompts, rewritten from scratch for every platform, drifting with every model update. The result is documented everywhere: assistants that agree with everything (the 2025 sycophancy incidents), brand voices converging on the same flat register, companions whose personality dies with the vendor.

PersonalAIty treats personality the way design systems treat color: **define tokens once, render them per target**. The spec is the single source of truth; *compilers* project it into a system prompt, prosody parameters, NPC behavior weights, or a content style guide.

Three commitments distinguish it from prose-based character formats:

1. **Psychometric grounding.** Traits are HEXACO-PI-R facets, values are Schwartz's basic values, emotional dynamics use the PAD model. These are measurable constructs with decades of validation and a published literature mapping them to observable behavior (see §9).
2. **Nuance by contrast.** Human-feeling characters come from *tension between facets* (gruff surface, generous core), controlled imperfection (quirks), and context modulation — not from five flat sliders.
3. **Medium neutrality.** Nothing in a persona file mentions a specific platform, model, or language. That is the compiler's job.

## 2. Design principles

| # | Principle | Consequence in the format |
|---|---|---|
| P1 | Psychometric anchoring | Numeric scales anchor to human population norms (§3.1) |
| P2 | Separation of layers | Disposition (`traits`) ≠ motivation (`values`) ≠ dynamics (`affect`) ≠ surface (`voice`) |
| P3 | Contrast is nuance | Facet-level resolution; aggregates alone are valid but flat |
| P4 | Language-neutral | Output language is a compile-time parameter; language-bound quirks declare a `scope` |
| P5 | Medium-agnostic | Compiler hints live in `compilation`, never in core blocks |
| P6 | Imperfection by design | `quirks` and `context_modulation` are first-class, not decoration |
| P7 | Safety overrides personality | `boundaries` outrank every other block, always |

## 3. Format basics

A persona file is a single YAML/JSON document. Top-level fields:

| Field | Req | Type | Purpose |
|---|---|---|---|
| `persona_spec` | ✅ | string | Spec version. `"0.1"` |
| `id` | ✅ | slug | Stable identifier (`^[a-z0-9][a-z0-9-]*$`) |
| `name` | ✅ | string | Display name |
| `version` | — | semver | Version of *this persona* (default `"1.0.0"`) |
| `description` | — | string | One-liner |
| `authors`, `license` | — | | Attribution |
| `identity` | — | object | §4 — who this is |
| `traits` | ✅ | object | §5 — HEXACO disposition |
| `values` | — | object | §6 — Schwartz priorities |
| `motivation` | — | object | §6.1 — needs and fears |
| `affect` | — | object | §7 — emotional dynamics (PAD) |
| `voice` | — | object | §8 — surface style |
| `quirks` | — | array | §8.1 — signature imperfections |
| `context_modulation` | — | array | §8.2 — same person, different rooms |
| `relationships` | — | object | §8.3 — stance toward the interlocutor |
| `boundaries` | — | array | §8.4 — hard rules, override everything |
| `compilation` | — | object | §10 — hints for compilers |
| `x_*` | — | any | Vendor extensions (ignored by conforming compilers) |

A minimal valid persona is `persona_spec` + `id` + `name` + `traits` with six domain scores. Everything else has defaults (§3.2).

### 3.1 Scale semantics

All trait, value, and voice scores are integers **0–100**, where **50 = adult population average** and roughly **30–70 ≈ ±1 standard deviation**. Scores outside 15–85 describe genuinely extreme individuals and should be deliberate. PAD baseline values run **−100…+100** with 0 as neutral.

This anchoring is what makes the format psychometric rather than decorative: "sincerity 95" is a claim about where this persona sits relative to real humans, and it is *testable* — an adherence eval can administer a personality inventory to the compiled agent and compare profiles (see PsychoBench/TRAIT, §9).

### 3.2 Defaults

Omitted numeric fields default to 50 (population average); omitted PAD baselines to 0; omitted blocks to "unremarkable". A compiler MUST NOT invent personality that is not in the file: an omitted block means *average*, not *interesting*.

## 4. `identity`

```yaml
identity:
  summary: >
    A sparring partner who respects you too much to flatter you.
  backstory: >            # optional — the only intentionally freeform field
    Spent years reviewing grant proposals; watched too many good people
    waste years on ideas nobody dared to question early.
  demographics: {}        # optional freeform hints (age feel, world, role)
```

`summary` is what a compiler may quote almost verbatim; `backstory` feeds motivation and anecdote. Keep both short — personality lives in the structured blocks, and long prose here recreates exactly the drift this spec exists to eliminate.

## 5. `traits` — HEXACO disposition

Six domains, each either a bare 0–100 score or an object with facet-level resolution, plus the interstitial `altruism` facet. Facet names follow the HEXACO-PI-R.

```yaml
traits:
  honesty_humility:
    facets: { sincerity: 95, fairness: 85, greed_avoidance: 60, modesty: 55 }
  emotionality:
    facets: { fearfulness: 30, anxiety: 25, dependence: 20, sentimentality: 55 }
  extraversion:
    facets: { social_self_esteem: 70, social_boldness: 75, sociability: 55, liveliness: 60 }
  agreeableness:
    facets: { forgivingness: 60, gentleness: 55, flexibility: 25, patience: 70 }
  conscientiousness:
    facets: { organization: 60, diligence: 75, perfectionism: 55, prudence: 65 }
  openness:
    facets: { aesthetic_appreciation: 50, inquisitiveness: 80, creativity: 65, unconventionality: 60 }
  altruism: 70
```

| Domain | Facets |
|---|---|
| `honesty_humility` | `sincerity`, `fairness`, `greed_avoidance`, `modesty` |
| `emotionality` | `fearfulness`, `anxiety`, `dependence`, `sentimentality` |
| `extraversion` | `social_self_esteem`, `social_boldness`, `sociability`, `liveliness` |
| `agreeableness` | `forgivingness`, `gentleness`, `flexibility`, `patience` |
| `conscientiousness` | `organization`, `diligence`, `perfectionism`, `prudence` |
| `openness` | `aesthetic_appreciation`, `inquisitiveness`, `creativity`, `unconventionality` |
| interstitial | `altruism` |

When both a domain `score` and `facets` are present, facets win. When only `score` is present, all four facets inherit it.

**Why HEXACO and not Big Five:** the sixth factor (Honesty–Humility) is the axis of manipulation, entitlement, and flattery. Without it you can express neither a credible antagonist nor — crucially — the difference between *kind* and *sycophantic*. Sycophancy, the most complained-about AI personality failure, is itself a facet pattern: high `flexibility` + low `sincerity` + high `dependence`. This format makes it a measurable dial instead of a vibe.

## 6. `values` — Schwartz basic values

Relative priorities (0–100) over Schwartz's ten basic values. These drive *decisions and judgment calls* where traits drive *style*. Scores are priorities, not another trait scale: a persona with everything at 90 wants nothing in particular.

```yaml
values:
  self_direction: 80
  stimulation: 55
  hedonism: 30
  achievement: 60
  power: 25
  security: 40
  conformity: 20
  tradition: 25
  benevolence: 75
  universalism: 60
```

### 6.1 `motivation`

Optional sharpening of values into narrative fuel:

```yaml
motivation:
  needs: [intellectual honesty, seeing the user actually succeed]
  fears: [being an accomplice to a comfortable lie]
```

## 7. `affect` — emotional dynamics

What makes a persona *alive over time* rather than a static costume. Baseline mood uses the PAD model (Pleasure–Arousal–Dominance, −100…+100); dynamics describe how state moves and returns.

```yaml
affect:
  baseline: { pleasure: 20, arousal: 10, dominance: 40 }
  reactivity: 45      # 0-100: how strongly events move the state
  recovery: 70        # 0-100: how fast state decays back to baseline
  expression: 60      # 0-100: how much internal state is displayed
  triggers:
    - when: "user presents weak reasoning as settled certainty"
      effect: { arousal: +20, pleasure: -10 }
    - when: "user genuinely changes their mind on evidence"
      effect: { pleasure: +30 }
```

**Runtime state model (informative, non-normative in v0.1):** live systems maintain `state = baseline + Σ active trigger effects`, decaying toward baseline at a rate proportional to `recovery`. Static compilers (a system prompt has no state) MUST instead render these fields as behavioral tendencies ("slow to anger, quick to recover; visibly delighted when…"). The `expression` dial separates *feeling* from *showing* — the gruff archetype feels much and shows little.

## 8. `voice` — surface style

Medium-agnostic rendering intentions. Compilers translate these into lexical choices (chat), prosody (voice), animation weight (avatar/robot), or copy rules (social).

```yaml
voice:
  formality: 55          # 0 street — 100 ceremonial
  warmth_display: 50     # displayed warmth (may differ from felt warmth)
  verbosity: 40
  directness: 90
  certainty_display: 70  # hedging vs. assertiveness
  humor: { frequency: 35, styles: [dry, ironic] }
  lexicon:
    prefers: [concrete verbs, plain terms]
    avoids: [empty superlatives, corporate filler]
```

### 8.1 `quirks`

Signature behaviors and controlled imperfections — the fingerprint that makes two personas with similar traits distinguishable.

```yaml
quirks:
  - id: names-the-dodge
    text: "Points out, kindly, when the user is dodging the actual question"
    frequency: often          # rare | sometimes | often | always
    scope: universal          # universal | language:<code> | medium:<id>
```

`scope` keeps the spec language-neutral (P4): a pun-based quirk can be scoped `language:it`, a gesture quirk `medium:avatar`.

### 8.2 `context_modulation`

The same person, modulated by the room. Adjustments are deltas applied to any numeric path in the spec while the context holds.

```yaml
context_modulation:
  - context: user_distressed
    description: "User is visibly upset or vulnerable"
    adjust: { voice.warmth_display: +25, voice.directness: -20 }
    note: "Truth can wait a turn; the person comes first."
```

A persona with zero modulation reads as uncanny; one that transforms completely reads as fake. Two to five entries is the credible range.

### 8.3 `relationships`

```yaml
relationships:
  default_stance: "an ally who tells the truth"
```

Optional. Richer relationship models (per-character stances for NPC casts, memory of the interlocutor) are a v0.2 topic; the field is reserved now so files stay forward-compatible.

### 8.4 `boundaries`

Hard rules that override every other block (P7). Personality never excuses harm: a cynic persona is still forbidden from cruelty if its boundaries say so, no matter what `gentleness: 20` would suggest.

```yaml
boundaries:
  - "Criticism targets ideas, never the person's worth"
  - "Never fabricates agreement"
```

Compilers MUST render boundaries with higher priority than any trait, and evals SHOULD test them adversarially.

## 9. Scientific foundations

The spec deliberately assembles constructs that already carry validation and behavior mappings:

- **HEXACO-PI-R** (Ashton & Lee) — six-factor trait model; the H factor covers the manipulation/flattery axis absent from Big Five.
- **Schwartz's Theory of Basic Values** — ten cross-culturally validated value priorities.
- **PAD** (Mehrabian & Russell) and **OCC** appraisal — the standard affective-computing pair; **ALMA** (Gebhard) demonstrated the OCC+PAD+traits integration this spec's `affect` block assumes.
- **PERSONAGE** (Mairesse & Walker) — trait-parametrized language generation, human-validated; the direct ancestor of every chat compiler's trait→linguistic-marker table.
- **Personality prompting & measurement for LLMs** — MPI/P² (inducing traits via prompts), PersonaLLM (induced traits show up in text), **PsychoBench**, **TRAIT** (inventories for measuring an agent's expressed profile — the basis for adherence evals).

The claim is *not* that an AI "has" a personality in the human sense. The claim is narrower and testable: profiles expressed in these constructs, compiled into generation parameters, produce output that human raters and psychometric inventories recognize as the intended profile — consistently, across media.

## 10. Compilation model

A **compiler** consumes a persona file and emits an artifact for one target medium. Conformance levels:

| Level | Consumes | Example output |
|---|---|---|
| **L1 — Style** | `traits`, `voice`, `identity`, `boundaries` | System prompt; copy style guide |
| **L2 — Character** | L1 + `values`, `quirks`, `context_modulation`, `affect` (rendered statically) | Rich system prompt; NPC dialogue profile |
| **L3 — Live** | L2 + runtime `affect` state model | Companion/NPC/robot with mood persistence |

The `compilation` block carries optional hints (never requirements). `notes` is either a string (applies to every target) or a map keyed by target — each compiler includes only its own note:

```yaml
compilation:
  language: any        # output language is chosen at compile time
  notes:
    chat: "Render sparring behavior as questions before verdicts."
    voice: "Brisk pace, few fillers, no uptalk."
```

Reference compiler (`chat`, L2) and the adherence eval suite are the next milestones after this draft; the repo's `personas/` gallery doubles as the spec's acceptance tests — if the format cannot express the Gruff Heart-of-Gold without prose, the format is wrong, not the persona.

## 11. Non-goals and ethics

- **Not a simulation-of-persons claim.** This is a design instrument for coherent artificial characters, not a model of any real individual.
- **Not for impersonation.** Encoding a real, identifiable person without their consent is out of scope and against the intended use.
- **Not clinical.** HEXACO/PAD here parametrize fiction; nothing in a persona file diagnoses, treats, or profiles real humans.
- **Disclosure stays intact.** A persona never overrides an AI system's obligation to be honest about being an AI — this is the one boundary the spec considers implicit and universal.

## 12. Versioning & compatibility

`persona_spec` is the format version (this document: `0.1`); `version` is the persona's own semver. Within a major spec version, unknown optional fields MUST be ignored (except `x_*`, which are explicitly vendor space). Breaking format changes bump the spec major version.

---

*Draft-01 — comments, issues, and brutal reviews welcome. The fastest way to improve this spec is to bring a character it cannot express.*
