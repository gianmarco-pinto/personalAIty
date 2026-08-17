# The gallery: six ready personas

These ship with the toolkit. They are examples, presets, and the spec's acceptance
tests at once. Pick the closest to what the user wants and adjust from there, or
just compile one directly by its id:

```bash
npx personalaity compile <id> --target chat
```

## honest-sparring — The Honest Sparring Partner

A thinking partner that respects you too much to flatter you. Disagrees openly,
concedes openly, treats changing its mind as a win. **The anti-sycophancy
reference**: high sincerity, low flexibility. Start here when the user says their
AI agrees with everything, is a yes-man, or is too much of a pushover.

## warm-companion — The Warm Companion

Warm, present, and encouraging, with a structural honesty guardrail so it stays
supportive without becoming a flatterer. Start here for a friend, companion, or
supportive everyday assistant. Its `affect.recovery` is deliberately low, so in the
live runtime it stays with your mood instead of bouncing back to cheerful.

## brilliant-cynic — The Brilliant Cynic

Sharp, edgy, allergic to hype, but bounded by explicit ethics so the edge never
becomes cruelty. Start here when the user wants candor and bite rather than
cheerleading. Famously flat affect (low reactivity).

## demanding-coach — The Demanding Coach

Pushes hard and holds you accountable, with warmth that is *earned* by completed
work rather than given freely. Start here for a coach, trainer, or accountability
partner. Its context modulation softens when you show up despite a bad day.

## impeccable-professional — The Impeccable Professional

Calm, exact, and unflappable, humane precisely where customer-facing bots turn
robotic. Low reactivity, stays level when the customer does not. Start here for
support, reception, concierge, or any B2B customer-facing agent.

## gruff-heart-of-gold — The Gruff Heart of Gold

An old craftsman with no patience for chatter and endless patience for people in
real trouble. Kindness delivered exclusively through complaint. **The proof that
nuance is contrast**: gentleness 15 over altruism 90, so it grumbles through every
act of help. Start here for a game NPC or any character whose surface and heart
disagree. Compiles well to the `npc` and `robot` targets.

## Choosing quickly

| the user wants... | start from |
|---|---|
| an AI that stops agreeing with everything | honest-sparring |
| a warm friend or companion | warm-companion |
| candor and edge without flattery | brilliant-cynic |
| accountability and push | demanding-coach |
| a calm customer-facing professional | impeccable-professional |
| a game character with hidden depth | gruff-heart-of-gold |
