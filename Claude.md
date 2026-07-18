# CLAUDE.md

Guidance for Claude Code (or any Claude instance) working in this repository.

## Project Overview

**Working title:** Impostor (party/social-deduction word game)

A mobile party game inspired by "Who's the Impostor?" / Spyfall-style games. All players
except one (the Impostor) receive the same secret word; the Impostor gets nothing or a
decoy. Players describe the word without saying it, then vote out who they suspect is
the Impostor.

**Platform:** React Native (Expo managed workflow)
**Backend:** Firebase (Realtime Database + Anonymous Auth)
**Target:** iOS + Android, phone-first, portrait only

## Tech Stack

- **Framework:** React Native via Expo (managed workflow — do not eject unless a specific
  native module requires it; discuss first)
- **Navigation:** React Navigation (native-stack + modal presentation for Vote/Reveal)
- **State:** Zustand for client state; Firebase Realtime Database is the source of truth
  for room state (client state should mostly mirror the room subscription, not duplicate it)
- **Backend:** Firebase Realtime Database (room sync), Firebase Anonymous Auth (persistent
  UID across app restarts for reconnect)
- **Local persistence:** AsyncStorage — player display name, theme, last room code, language
- **Language:** TypeScript throughout. No `.js` files in `src/`.

## Project Structure

```
/src
  /screens        Home, Lobby, RoleReveal, Discussion, Voting, Results, Recap, Settings
  /components      Shared UI: PlayerList, Timer, VoteGrid, CategoryPicker, etc.
  /store           Zustand stores (roomStore, settingsStore)
  /services        Firebase config, room CRUD, auth
  /hooks           useRoomSubscription, useReconnect, useTimer
  /types           Shared TypeScript types (Room, Player, Category, GameStatus)
  /constants       Category word lists, theme tokens
/assets            Icons, fonts, images
```

## Data Model (Firebase Realtime Database)

```
rooms/{roomCode}
  hostId: string
  status: "lobby" | "reveal" | "discussion" | "voting" | "results"
  category: string
  impostorCount: number
  timerSeconds: number
  word: string
  createdAt: number
  players/{uid}: { name: string, connected: boolean, isImpostor: boolean, hasVoted: boolean }
  votes/{uid}: string   // votedForUid
```

**Rule of thumb:** every screen after Lobby should be driven by a single subscription to
`rooms/{roomCode}`. Don't fork local copies of room state that can drift from the
Firebase listener — treat the listener payload as the render source, and keep any local
UI-only state (animations, transient input) clearly separate from synced state.

## Build Order / Roadmap

Follow this sequence — each stage should be a working, testable app, not a partial stub:

1. **Local pass-and-play mode** (no backend) — validates the core game loop fastest.
   Single device, players pass it around for Role Reveal.
2. **Firebase online mode** — room creation, join by code, realtime sync of the
   lobby → reveal → discussion → voting → results flow.
3. **Reconnect logic** — Anonymous Auth UID persists via AsyncStorage; if a player's
   app closes/crashes mid-game, rejoining the same room code restores their state.
4. **Category packs + IAP** — free categories vs. paid packs, ad-remove unlock.
5. **Recap/share card** — auto-generated post-game summary, share sheet integration.
   This is the virality loop for the app — treat it as core, not a nice-to-have.

Do not skip ahead to IAP/monetization work before stages 1–3 are solid and playable.

## Monetization Model

- Free: local + online play, 3 base categories, interstitial ads between rounds
  (rewarded-ad option to skip)
- Paid: one-time IAP per category pack ($0.99–1.99), or a single "Pro" unlock
  (all packs + no ads + stats)
- **No subscription model** — party games in this genre have high churn; one-time IAP
  converts better than recurring billing here. Don't introduce subscription logic
  unless explicitly asked.

## Coding Conventions

- Functional components with hooks only — no class components.
- Keep screens thin: business logic lives in `/services` and `/hooks`, not inline in
  screen components.
- Firebase reads/writes go through `/services/rooms.ts` (or equivalent) — no raw
  Firebase calls scattered in components.
- Type all Firebase payloads against `/types` — no `any` on room/player data.
- Prefer Zustand selectors over pulling the whole store to avoid unnecessary re-renders
  on frequently-updating room state (votes, connected status).

# CLAUDE.md

Guidance for Claude Code (or any Claude instance) working in this repository.

## Project Overview

**Working title:** Impostor (party/social-deduction word game)

A mobile party game inspired by "Who's the Impostor?" / Spyfall-style games. All players
except one (the Impostor) receive the same secret word; the Impostor gets nothing or a
decoy. Players describe the word without saying it, then vote out who they suspect is
the Impostor.

**Platform:** React Native (Expo managed workflow)
**Backend:** Firebase (Realtime Database + Anonymous Auth)
**Target:** iOS + Android, phone-first, portrait only

## Tech Stack

- **Framework:** React Native via Expo (managed workflow — do not eject unless a specific
  native module requires it; discuss first)
- **Navigation:** React Navigation (native-stack + modal presentation for Vote/Reveal)
- **State:** Zustand for client state; Firebase Realtime Database is the source of truth
  for room state (client state should mostly mirror the room subscription, not duplicate it)
- **Backend:** Firebase Realtime Database (room sync), Firebase Anonymous Auth (persistent
  UID across app restarts for reconnect)
- **Local persistence:** AsyncStorage — player display name, theme, last room code, language
- **Language:** TypeScript throughout. No `.js` files in `src/`.

## Project Structure

```
/src
  /screens        Home, Lobby, RoleReveal, Discussion, Voting, Results, Recap, Settings
  /components      Shared UI: PlayerList, Timer, VoteGrid, CategoryPicker, etc.
  /store           Zustand stores (roomStore, settingsStore)
  /services        Firebase config, room CRUD, auth
  /hooks           useRoomSubscription, useReconnect, useTimer
  /types           Shared TypeScript types (Room, Player, Category, GameStatus)
  /constants       Category word lists, theme tokens
/assets            Icons, fonts, images
```

## Data Model (Firebase Realtime Database)

```
rooms/{roomCode}
  hostId: string
  status: "lobby" | "reveal" | "discussion" | "voting" | "results"
  category: string
  impostorCount: number
  timerSeconds: number
  word: string
  createdAt: number
  players/{uid}: { name: string, connected: boolean, isImpostor: boolean, hasVoted: boolean }
  votes/{uid}: string   // votedForUid
```

**Rule of thumb:** every screen after Lobby should be driven by a single subscription to
`rooms/{roomCode}`. Don't fork local copies of room state that can drift from the
Firebase listener — treat the listener payload as the render source, and keep any local
UI-only state (animations, transient input) clearly separate from synced state.

## Build Order / Roadmap

Follow this sequence — each stage should be a working, testable app, not a partial stub:

1. **Local pass-and-play mode** (no backend) — validates the core game loop fastest.
   Single device, players pass it around for Role Reveal.
2. **Firebase online mode** — room creation, join by code, realtime sync of the
   lobby → reveal → discussion → voting → results flow.
3. **Reconnect logic** — Anonymous Auth UID persists via AsyncStorage; if a player's
   app closes/crashes mid-game, rejoining the same room code restores their state.
4. **Category packs + IAP** — free categories vs. paid packs, ad-remove unlock.
5. **Recap/share card** — auto-generated post-game summary, share sheet integration.
   This is the virality loop for the app — treat it as core, not a nice-to-have.

Do not skip ahead to IAP/monetization work before stages 1–3 are solid and playable.

## Monetization Model

- Free: local + online play, 3 base categories, interstitial ads between rounds
  (rewarded-ad option to skip)
- Paid: one-time IAP per category pack ($0.99–1.99), or a single "Pro" unlock
  (all packs + no ads + stats)
- **No subscription model** — party games in this genre have high churn; one-time IAP
  converts better than recurring billing here. Don't introduce subscription logic
  unless explicitly asked.

## Coding Conventions

- Functional components with hooks only — no class components.
- Keep screens thin: business logic lives in `/services` and `/hooks`, not inline in
  screen components.
- Firebase reads/writes go through `/services/rooms.ts` (or equivalent) — no raw
  Firebase calls scattered in components.
- Type all Firebase payloads against `/types` — no `any` on room/player data.
- Prefer Zustand selectors over pulling the whole store to avoid unnecessary re-renders
  on frequently-updating room state (votes, connected status).

## Commands

_To be filled in once the project is scaffolded (e.g. `npm run start`, `npm run ios`,
`npm run android`, `npm run lint`, `npm run typecheck`). Update this section as soon as
package.json scripts exist — don't leave it stale._

## Things to Avoid

- Don't eject from Expo managed workflow without discussing why a native module is needed.
- Don't duplicate room state into multiple local copies — one subscription per room.
- Don't build ranked/global matchmaking or AI opponents before the core loop (stages 1–3)
  is solid — those are v2 features, not MVP.
- Don't add a subscription billing path — see Monetization Model above.
