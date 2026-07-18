# Impostor — feature roadmap

Where the game goes after v1.1.0. Ordered by *leverage per unit of risk*, not by
how exciting the idea sounds. Each entry states what has to change in the data
model, because that is what actually decides the cost.

## Where the code stands today

The pieces that make the next phase cheap:

- **One subscription drives online play.** Every online screen renders from
  `rooms/{code}` via `useRoomSubscription`; the room's `status` picks the view.
  Adding a phase means adding a status and a view, not rewiring navigation.
- **Game rules live in `src/services/gameLogic.ts`**, not in screens.
- **The design system is tokenised** (`src/design/`), so new screens inherit the
  look for free, in all five themes.

The piece that blocks nearly everything below:

- **Roles are a boolean.** `RoomPlayer.isImpostor` cannot express a third role.
  This is the single refactor gating stages 1, 3 and 4.

---

## Stage 1 — Generalised roles *(unlocks most of the list)*

Replace the boolean with a role identifier and a per-player payload:

```ts
type RoleId = 'crew' | 'impostor' | 'saboteur' | 'informant';

interface RoomPlayer {
  role: RoleId;
  /** What this player is shown at reveal — word, hint, or a name. */
  payload: { word?: string; hint?: string; knownImpostorUid?: string };
  // isImpostor kept as a derived field for one release, then dropped
}
```

Win conditions stop being "was the voted-out player the impostor" and become a
function `resolveRound(players, votes) → Outcome`. Write that as a pure function
with unit tests before touching any screen — it is the one place where a subtle
bug silently ruins games.

**Then the roles you described fall out cheaply:**

| Role | Payload | Win condition |
| --- | --- | --- |
| **Saboteur** | the real word | wins if an *innocent* is voted out |
| **Informant** | one impostor's name, no word | wins with crew, but see below |
| **Fragmented** | one fragment each | crew wins by naming the subject |

Two design notes worth deciding early:

- **The Informant needs the assassination beat you described**, otherwise the
  role is strictly good for the crew and the impostor cannot fight back. That
  means a post-vote phase (`status: 'assassination'`) where a surviving impostor
  names who they think the informant was. This is the first mechanic requiring a
  new phase — do it here so the phase machinery exists for later features.
- **Fragmented Knowledge changes what a "word" is.** `WordEntry` grows a
  `fragments: string[]` field. Only worth authoring fragments for words where
  three orthogonal facets exist ("Eiffel Tower" → France / metal / tall), so
  expect this to cover a subset of the bank, gated per category.

**Cost:** medium. **Risk:** low, entirely offline logic. **Do this first.**

## Stage 2 — Round variety without new roles

Cheaper wins that reuse the existing loop and add table variety:

- **Fragment-free "hard mode"**: impostor gets no hint (the pre-v1.1 behaviour),
  selectable per room. Nearly free — the hint is already an optional field.
- **Word difficulty tiers**: tag entries `easy | hard`, let the host pick.
- **First-speaker rotation and clue order**: already partly there (the
  discussion screen picks a starter); make it an explicit ordered list so
  everyone knows whose turn it is.

**Cost:** low. Good filler while the role refactor settles.

## Stage 3 — Multi-modal clues

Your "Draw It" idea is the strongest of the three because it needs no new
permissions and produces artefacts the group laughs at.

- **Draw It** — `react-native-skia` or an SVG path recorder; a 3-second timed
  canvas, strokes stored as a point array (small enough to sync through the
  Realtime Database as JSON). The drawings become the debate material and, later,
  the share card. **This is the one I would build.**
- **Emoji grid** — a randomised grid the player picks from. Trivial to build,
  works offline, no third-party dependency.
- **GIF search** — needs a Giphy API key, network calls per player, content
  moderation exposure, and an attribution requirement. Skip unless the emoji
  version proves the mechanic is fun.

**Cost:** medium for Draw It. **Risk:** low. **Dependency:** none.

## Stage 4 — "Polygraph" theatre *(handle with care)*

Both ideas are fun and both carry real compliance weight. Build them only with
these constraints, or not at all:

**Micro-expression replay (front camera).**
- Recording faces is sensitive personal data. Everything must stay **on device**,
  never uploaded, and be deleted at the end of the round.
- Needs explicit per-session opt-in from *every* player, not a buried setting —
  one person cannot consent on behalf of the table.
- Play Store: camera permission plus a Data Safety declaration. Expect review
  friction; a clear in-app explanation screen reduces it.

**Audio "stress analysis".**
- This is **not** lie detection and must never be presented as though it were.
  Frame it explicitly as a gag ("Suspicion Meter — for entertainment only"), or
  it is both dishonest to players and a review risk.
- Continuous microphone recording is the heaviest permission in the app. A
  push-to-talk model (hold to give your clue) is far easier to justify than
  always-on capture.
- Realistically: pitch/pace/hesitation from an FFT gives you something *fun and
  arbitrary*. Ship the arbitrariness as the joke rather than pretending at
  science.

**Cost:** high. **Risk:** high (permissions, store review, privacy).
**Recommendation:** do Stage 5 first — it delivers more replayability per week
of work and carries none of this baggage.

## Stage 5 — Meta-progression

This is what turns one round into an evening, and it is the strongest item on
your list after roles.

- **Session ledger** (local first): players registered for the night, wins and
  losses per role, "most suspected" and "best liar" awards. Pure local state,
  zero backend, immediate payoff.
- **Currency and one-shot abilities**: earned by surviving as impostor, spent on
  a forced tie-break or peeking at one player's word. Each ability is a new
  action on the room — build them *after* Stage 1, since they are role-shaped.
- **Narrative campaigns**: a scenario file (`campaigns/heist.json`) that scripts
  category, difficulty and modifier per round, with outcomes branching the next
  one. Content-heavy but mechanically simple once modifiers exist. This is a
  writing project more than an engineering one.

**Cost:** low (ledger) → high (campaigns). **Do the ledger next after roles.**

---

## Suggested order

1. **Generalised roles + `resolveRound` with tests** — unblocks everything
2. **Saboteur** — the cheapest new role, validates the refactor
3. **Session ledger** — replayability, no backend
4. **Informant + assassination phase** — introduces multi-phase rounds
5. **Draw It** — variety, and feeds the share card
6. **Fragmented Knowledge** — needs authored fragments
7. **Campaigns**, then **polygraph theatre** if it still appeals

## Still open from the original plan

- **Recap / share card** — the virality loop from `Claude.md`, still unbuilt and
  cheaper than most of the above. Drawings from Stage 3 would make it far better.
- **Category packs and IAP** — deliberately deferred until the loop is deep
  enough to be worth paying for. Note the existing decision: one-time purchases,
  no subscriptions.
- **Play Store release** — needs a privacy policy URL and a Data Safety form.
  Anything in Stage 4 turns that from a formality into a real review.
