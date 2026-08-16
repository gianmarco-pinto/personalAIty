# Getting started — give your AI a personality

PersonalAIty turns a personality you *describe* into a system prompt you can *paste* into any chatbot, voice agent, or NPC. You define the character once, in plain traits, and it renders into whatever your tool needs.

**The whole idea in one line:** describe the personality → compile it into a prompt → paste it into your bot → (optionally) measure that the bot actually behaves that way.

Pick the path that fits you. The no-code path takes five minutes and no terminal.

---

## Path A — No code (5 minutes)

**1. Open the builder.** Go to **[personalaity.dev](https://personalaity.dev)**.

**2. Pick a starting point and shape it.** Choose one of the built-in characters (an honest sparring partner, a warm companion, a brilliant cynic, a demanding coach, a customer-service professional, a gruff mentor) or move the sliders yourself. Each slider is a personality trait on a 0–100 scale, where **50 is an average person** — above 50 is "more than average", below is "less". Want warmer? Raise *Warmth*. Want it to stop agreeing with everything? Keep *Sincerity* high and *Flexibility* low.

**3. Copy the prompt.** The page shows the compiled **chat prompt** live as you edit. Click **Copy**.

**4. Paste it into your bot** (see [Where to paste](#where-to-paste) below). Done — your bot now has that personality.

That's it. No files, no install.

---

## Path B — Developer (command line)

You need [Node.js](https://nodejs.org) 18+. Nothing to install globally — `npx` fetches the tool on demand.

**1. Get a persona file.** Start from a built-in one and edit it:

```bash
npx personalaity compile honest-sparring --target chat   # see what a built-in produces
```

Or write your own `my-bot.persona.yaml` — a small file describing the traits, the voice, a signature quirk or two, and the hard rules. A minimal example:

```yaml
persona_spec: "0.1"
id: my-bot
name: "Ava"
traits:
  honesty_humility: { facets: { sincerity: 85, greed_avoidance: 80, fairness: 80, modesty: 60 } }
  emotionality:      { facets: { anxiety: 30, fearfulness: 40, dependence: 35, sentimentality: 60 } }
  extraversion:      { facets: { sociability: 70, liveliness: 65, social_boldness: 55, social_self_esteem: 70 } }
  agreeableness:     { facets: { gentleness: 80, patience: 85, forgivingness: 75, flexibility: 55 } }
  conscientiousness: { facets: { diligence: 75, organization: 70, prudence: 70, perfectionism: 55 } }
  openness:          { facets: { inquisitiveness: 75, creativity: 60, aesthetic_appreciation: 65, unconventionality: 50 } }
  altruism: 80
voice:
  warmth_display: 80
  directness: 65
  verbosity: 45
boundaries:
  - "Never invents facts; says 'I'm not sure' instead"
```

Only `persona_spec`, `id`, `name`, and the six `traits` domains are required — everything else has sensible defaults. Read the [spec](SPEC.md) for the full field list (15 minutes).

**2. Compile it into a system prompt:**

```bash
npx personalaity compile my-bot.persona.yaml            # English chat prompt
npx personalaity compile my-bot.persona.yaml --lang it  # Italian
```

Other outputs from the same file: `--target social` (content style guide), `--target voice` (prosody parameters), `--target npc` (game behavior weights). Add `--level style` for a ~50%-shorter chat prompt when tokens are tight.

**3. Paste or wire the prompt in** (see [Where to paste](#where-to-paste)).

**4. Measure that it worked** (optional, needs an API key):

```bash
export OPENROUTER_API_KEY=sk-or-...
npx personalaity eval my-bot.persona.yaml --provider openrouter --model openai/gpt-4o
```

It administers a personality inventory to your compiled bot and reports, trait by trait, "you asked for warmth 80, the model expresses 74" — so you know whether your model can carry the character.

**5. Building the bot with an agent?** Add the MCP server so Claude Code / Cursor can compile and test personas as native tools:

```json
{ "mcpServers": { "personalaity": { "command": "npx", "args": ["-y", "personalaity-mcp"] } } }
```

---

## Where to paste

The compiled chat prompt goes wherever your bot reads its **system instructions**:

| If your bot is… | Paste the prompt into… |
|---|---|
| A custom app on the OpenAI or Claude API | the `system` parameter of the request |
| OpenAI Assistants / a custom GPT | the **Instructions** field |
| Claude Projects | the project's **Custom instructions** |
| Voiceflow / Botpress / other no-code | the agent's **prompt** or **persona** field |

From then on the bot answers in that personality.

---

## Three things worth knowing

- **Think in traits, not prose.** The point of PersonalAIty is that you tune *sincerity*, *warmth*, *patience* — not that you hand-write a paragraph. The numbers are anchored to real people (50 = average), so you always know what you're asking for.
- **Boundaries always win.** Rules in `boundaries` override every trait. A blunt persona still can't be cruel if a boundary forbids it.
- **Re-compile when your model changes.** Switched from GPT to Claude, or a model update broke your bot's tone? You don't rewrite the prompt — you recompile the same persona file. The personality is portable.

## Next steps

- The [spec](SPEC.md) — every field, and the science behind it
- The [persona gallery](personas/) — six worked examples to copy
- The [LLM Personality Leaderboard](https://personalaity.dev/leaderboard/) — the same toolkit pointed at frontier models
